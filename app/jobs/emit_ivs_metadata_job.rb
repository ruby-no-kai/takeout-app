class EmitIvsMetadataJob < ApplicationJob
  class CardUpdateTooLarge < StandardError; end

  IvsCardUpdate = Struct.new(:candidate, :clear, :card, keyword_init: true) do
    def track
      clear || card.track
    end

    def candidate?
      !!candidate
    end

    def as_ivs_metadata_item
      h = ActiveSupport::HashWithIndifferentAccess.new({card: card.as_json})
      h[:candidate] = candidate if candidate
      h[:clear] = clear if clear
      if h.dig(:card, :topic, :description)
        desc = h.dig(:card, :topic, :description)
        limit = 800
        while {c: h}.to_json.bytesize > 600 && limit > 0
          h[:card][:topic][:description] = "#{desc[0,limit]} …" if desc.size > limit
          limit -= 10
        end
      end
      {c: h}
    end
  end

  Candidate = Struct.new(:track, :card)

  def perform(items: nil)
    @ivs = Aws::IVS::Client.new(region: Conference.data.fetch(:ivs).fetch(:region), logger: Rails.logger)
    @t = Time.zone.now

    cards = []
    updates = if items
      items
    else
      candidate_updates, cards = candidate_cards()
      current_updates = current_cards()

      StreamPresence.all.to_a + candidate_updates + current_updates
    end

    updates.each do |u|
      Rails.logger.debug(u.inspect)
    end

    emit_updates(*updates)

    # lift flags
    cards.each do |_|
      _.update!(pending_candidate_emit: false)
    end
  end

  private def current_cards
    Conference.track_slugs.map do |track|
      card = TrackCard.current_for(track, t: @t)
      card && IvsCardUpdate.new(card: card)
    end.compact
  end

  private def candidate_cards
    candidates, blank_candidates = Conference.track_slugs
      .map { |track| Candidate.new(track, TrackCard.candidate_for(track, t: @t)) }
      .partition(&:card)

    candidates.select! { |_| _.card.need_emit_as_candidate?(@t) }

    [
      [
        *candidates.map { |_|  IvsCardUpdate.new(candidate: true, card: _.card) },
        *blank_candidates.map { |_| IvsCardUpdate.new(candidate: true, clear: _.track) },
      ],
      candidates.map(&:card),
    ]
  end

  # Prioritise pending candidate updates, and the information for the same track
  private def emit_updates(*updates)
    channel_arn_with_tracks = Conference.data.fetch(:tracks).each_value.flat_map do |track_data|
      track_data.fetch(:ivs, {}).each_value.map { |ivs| [ivs.fetch(:arn), track_data.fetch(:slug)] }
    end.uniq(&:first)

    ths = channel_arn_with_tracks.map do |arn_track|
      Thread.new(arn_track) do |(arn,track)|
        sorted_updates = updates.sort_by do |u|
          case u
          when StreamPresence
            [0, u.track == track ? 0 : 1, 0, 0]
          when IvsCardUpdate
            [1, u.track == track ? 0 : 1, u.candidate? ? 0 : 1, u.clear ? 1: 0]
          end
        end

        chunks = make_card_update_chunks(sorted_updates)

        chunks.each do |payload|
          @ivs.put_metadata(channel_arn: arn, metadata: payload)
        end
      rescue Aws::IVS::Errors::ChannelNotBroadcasting => e
        Rails.logger.warn "#{e.inspect}"
      end
    end

    ths.map(&:value)
  end

  # Note: IVS metadata payload has 1KB limit. So we may need to split...
  private def make_card_update_chunks(updates)
    update_objects = updates.map(&:as_ivs_metadata_item)
    chunks = []

    cur = []
    last = nil
    update_objects.each do |u|
      cur.push u

      j = {i: cur}.to_json
      if j.bytesize >= 1000
        raise CardUpdateTooLarge, "cannot emit card update over 1KB" if cur.size == 1
        cur = [u]
        chunks << last
      end

      last = j
    end
    chunks.push({i: cur}.to_json) unless cur.empty?

    chunks
  end
end

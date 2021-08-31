class EmitIvsMetadataJob < ApplicationJob
  def perform
    @ivs = Aws::IVS::Client.new(region: Conference.data.fetch(:ivs).fetch(:region), logger: Rails.logger)

    # Note: IVS metadata payload has 1KB limit. So we may need to split...
    send_current_card
    send_candidate_card
  end

  private def send_current_card
    metadata = make_card_update_chunks(Conference.track_slugs.map do |track|
      {card: TrackCard.latest_for(track)&.as_json}
    end)

    Conference.ivs_channel_arns.each do |arn|
      metadata.each do |payload|
        @ivs.put_metadata(channel_arn: arn, metadata: payload)
      end
    end
  end

  private def send_candidate_card
    candidates, blank_candidates = Conference.track_slugs
      .map { |track| [track, TrackCard.candidate_for(track)] }
      .partition { |_| _[1] }

    t = Time.zone.now
    candidates.select! { |_| _[1].need_emit_as_candidate?(t) }

    metadata = make_card_update_chunks([
      *candidates.map { |_|  {candidate: true, card: _[1].as_json} },
      *blank_candidates.map { |_| {candidate: true, clear: _[0]} },
    ])

    Conference.ivs_channel_arns.each do |arn|
      metadata.each do |payload|
        @ivs.put_metadata(channel_arn: arn, metadata: payload)
      end
    end

    candidates.each do |_|
      _[1].update!(pending_candidate_emit: false)
    end
  end

  private def make_card_update_chunks(cards)
    cur = []
    cards.slice_before do |_|
      cur.push _;
      test = {cards: cur}.to_json.bytesize >= 1000
      cur = [] if test
      test
    end.map do |chunk|
      {cards: chunk}.to_json
    end
  end
end

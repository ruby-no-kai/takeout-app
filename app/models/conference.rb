class Conference
  DATA = ActiveSupport::HashWithIndifferentAccess.new(Jsonnet.load(Rails.root.join('config', 'conference.jsonnet')))

  def self.data
    DATA.fetch(ENV['CONFERENCE_ENV'] || Rails.env.to_s)
  end

  def self.to_h
    data
  end

  def self.as_json(t: Time.zone.now)
    presences = StreamPresence.as_json
    {
      default_track: data.fetch(:default_track),
      track_order: data.fetch(:track_order),
      tracks: data.fetch(:tracks).transform_values do |track|
        track.slice(:name, :slug).merge(
          chime: track.fetch(:chime, {}).slice(:channel_arn),
          interpretation: !track.dig(:ivs, :interpretation).nil?,
          chat: !track[:chime].nil?,
          card: TrackCard.current_for(track.fetch(:slug), t: t)&.as_json,
          card_candidate: TrackCard.candidate_for(track.fetch(:slug), t: t)&.as_json,
          spotlights: ChatSpotlight.where(track: track.fetch(:slug)).order(starts_at: :asc).map(&:as_json),
          presences: presences.fetch(track.fetch(:slug), {}),
        )
      end.merge(
        _screen: { # Pseudo track for /screen
          slug: '_screen',
          name: '',
          interpretation: false,
          chat: false,
          card: TrackCard.current_for('_screen', t: t)&.as_json,
          card_candidate: TrackCard.candidate_for('_screen', t: t)&.as_json,
          spotlights: [],
          presences: {},
        },
      ),
    }
  end

  def self.chime_enabled?
    !(Rails.env.development? && Rails.application.config.x.chime&.user_role_arn&.blank?)
  end

  def self.chime_channel_arns
    data.fetch(:tracks).each_value.map { |t| t.dig(:chime, :channel_arn) }.compact
  end

  def self.ivs_channel_arns
    data.fetch(:tracks).each_value.flat_map { |t| t.fetch(:ivs, {}).each_value.map { |_| _.fetch(:arn) } }.uniq
  end

  def self.track_slugs
    data.fetch(:track_order)
  end

  DummyChimeUser = Struct.new(:chime_id, :chime_arn)

  def self.chime_kiosk_user
    kiosk_user_arn = data.fetch(:chime).fetch(:kiosk_user_arn)
    DummyChimeUser.new(
      kiosk_user_arn.split(?/).last,
      kiosk_user_arn,
    )
  end
end

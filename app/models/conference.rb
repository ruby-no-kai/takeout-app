class Conference
  DATA = ActiveSupport::HashWithIndifferentAccess.new(Jsonnet.load(Rails.root.join('config', 'conference.jsonnet')))

  def self.data
    DATA.fetch Rails.env.to_s
  end

  def self.to_h
    data
  end
  

  def self.as_json
    {
      default_track: data.fetch(:default_track),
      track_order: data.fetch(:track_order),
      tracks: data.fetch(:tracks).transform_values do |track|
        track.slice(:name, :slug).merge(
          chime: track.fetch(:chime, {}).slice(:channel_arn),
          interpretation: !track.dig(:ivs, :interpretation).nil?,
          chat: !track[:chime].nil?,
          card: TrackCard.latest_for(track.fetch(:slug)).as_json,
        )
      end,
    }
  end

  def self.chime_enabled?
    !(Rails.env.development? && Rails.application.config.x.chime&.user_role_arn&.blank?)
  end

  def self.chime_channel_arns
    data.fetch(:tracks).each_value.map { |t| t.dig(:chime, :channel_arn) }
  end
end

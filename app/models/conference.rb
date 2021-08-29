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
        track.except(:ivs).merge( # TODO:
          topic: {
            title: "Topic #{track.fetch(:name)}",
            author: "Author #{track.fetch(:name)}",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            labels: %w(ja en foobar),
            interpretation: true,
          },
          speaker: {
            id: 'sorah',
            name: 'Sorah Fukumori',
            github_id: 'sorah',
            twitter_id: 'sorah',
            avatar_url: 'https://img.sorah.jp/x/icon2021.rect-h.480.png',
          },
          interpretation: !track.dig(:ivs, :interpretation).nil?,
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

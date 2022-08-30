class EmitChatSpotlightJob < ApplicationJob
  def perform(spotlights: nil, remove: false)

    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    Conference.track_slugs.each do |track_slug|
      track_spotlights = spotlights.select { |_| _.track == track_slug }
      next if track_spotlights.empty?

      control = if remove
        {control: {spotlights_r: track_spotlights.map { |_| {id: _.id} }}}
      else
        {control: {spotlights: track_spotlights.map(&:as_json)}}
      end

      channel_arn = Conference.data.fetch(:tracks).dig(track_slug, :chime, :channel_arn)
      next unless channel_arn

      @chimemessaging.send_channel_message(
        chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
        channel_arn: channel_arn,
        content: control.to_json,
        type: 'STANDARD',
        persistence: 'NON_PERSISTENT',
      )
    end

  end
end

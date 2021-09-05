class EmitChatSpotlightJob < ApplicationJob
  def perform(spotlights: nil)

    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    Conference.track_slugs.each do |track_slug|
      spotlight_jsons = spotlights.select { |_| _.track == track_slug }.map(&:as_json)
      next if spotlight_jsons.empty?

      channel_arn = Conference.data.fetch(:tracks).dig(track_slug, :chime, :channel_arn)
      next unless channel_arn

      control = {control: {spotlights: spotlight_jsons}}.to_json

      @chimemessaging.send_channel_message(
        chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
        channel_arn: channel_arn,
        content: control,
        type: 'STANDARD',
        persistence: 'NON_PERSISTENT',
      )
    end

  end
end

class EmitStreamPresenceJob < ApplicationJob
  def perform(presence:, was_online: nil)
    @presence = presence
    if !was_online.nil? && !was_online
      emit_to_chat()
    end

    EmitIvsMetadataJob.perform_now(items: [presence])
  end

  def emit_to_chat
    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    Conference.track_slugs.each do |track|
      channel_arn = Conference.data.fetch(:tracks).dig(track, :chime, :channel_arn)
      next unless channel_arn

      @chimemessaging.send_channel_message(
        chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
        channel_arn: channel_arn,
        content: {control: {presences: [@presence.as_json]}}.to_json,
        type: 'STANDARD',
        persistence: 'NON_PERSISTENT',
      )
    end
  end
end

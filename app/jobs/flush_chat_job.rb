class FlushChatJob < ApplicationJob
  def perform(track)
    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    channel_arn = Conference.data.fetch(:tracks).dig(track, :chime, :channel_arn)
    raise "no channel_arn" unless channel_arn

    @chimemessaging.send_channel_message(
      chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
      channel_arn: channel_arn,
      content: {control: {flush: true}}.to_json,
      type: 'STANDARD',
      persistence: 'PERSISTENT',
    )
  end
end

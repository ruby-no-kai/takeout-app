class EmitChatMessagePinJob < ApplicationJob
  def perform(pin: nil)
    pins = pin ? [pin] : ChatMessagePin.where(track: slugs).to_a

    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    pins.each do |_|
      @chimemessaging.send_channel_message(
        chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
        channel_arn: Conference.data.fetch(:chime).fetch(:systems_channel_arn),
        content: {control: {pin: _.as_json}}.to_json,
        type: 'STANDARD',
        persistence: 'NON_PERSISTENT',
      )

      channel_arn = Conference.data.fetch(:tracks).dig(_.track, :chime, :channel_arn)
      if channel_arn
        @chimemessaging.send_channel_message(
          chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
          channel_arn: channel_arn,
          content: {control: {pin: _.as_json}}.to_json,
          type: 'STANDARD',
          persistence: 'NON_PERSISTENT',
        )
      end
    end
  end
end

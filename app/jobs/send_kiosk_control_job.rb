class SendKioskControlJob < ApplicationJob
  def perform(ping: true, reload: nil, now: Time.zone.now)
    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)

    control = {
      control: {
        kiosk_control: {
          ping: now.to_i,
          reload: reload,
        },
      },
    }

    @chimemessaging.send_channel_message(
      chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
      channel_arn: Conference.data.fetch(:chime).fetch(:systems_channel_arn),
      content: control.to_json,
      type: 'STANDARD',
      persistence: 'NON_PERSISTENT',
    )
  end
end

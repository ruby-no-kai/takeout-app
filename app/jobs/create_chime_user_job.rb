class CreateChimeUserJob < ApplicationJob
  def perform(attendee, force: false)
    return unless Conference.chime_enabled?
    return if attendee.chime_user&.ready? && !force

    chime_user = attendee.chime_user || ChimeUser.new(attendee: attendee)
    chime_user.save! unless chime_user.persisted?

    chimeidentity = Aws::ChimeSDKIdentity::Client.new(region: 'us-east-1', logger: Rails.logger)
    chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)

    # Note: these APIs _look_ to have idempotency (doesn't return error for the same data)

    begin
      chimeidentity.create_app_instance_user(
        app_instance_arn: Conference.data.fetch(:chime).fetch(:app_arn),
        app_instance_user_id: chime_user.chime_id,
        name: chime_user.chime_name,
      )
    rescue Aws::ChimeSDKIdentity::Errors::ConflictException => e
      Rails.logger.warn "chime:CreateAppInstanceUser returned #{e} for #{chime_user.inspect}"
    end

    channel_arns = Conference.chime_channel_arns
    channel_arns.each do |channel|
      chimemessaging.create_channel_membership(
        channel_arn: channel,
        member_arn: chime_user.chime_arn,
        type: "HIDDEN",

        chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
      )
    end

    if attendee.staff?
      channel_arns.each do |channel|
        chimemessaging.create_channel_moderator(
          channel_arn: channel,
          channel_moderator_arn: chime_user.chime_arn,

          chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
        )
      end
    end

    chime_user.update!(ready: true)
  end
end

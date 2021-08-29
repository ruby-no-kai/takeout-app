class UpdateChimeUserJob < ApplicationJob
  def perform(attendee)
    return unless Conference.chime_enabled?

    chime_user = attendee.chime_user
    unless chime_user&.ready?
      Rails.logger.warn("ignoring missing ChimeUser for attendee=#{attendee.id}")
      return
    end

    new_name = chime_user.update_name
    return unless new_name

    chimeidentity = Aws::ChimeSDKIdentity::Client.new(region: 'us-east-1', logger: Rails.logger)
    chimeidentity.update_app_instance_user(
      app_instance_user_arn: chime_user.chime_arn,
      name: new_name,
      metadata: "",
    )

    chime_user.save!
  end
end

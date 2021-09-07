require 'open-uri'

class UploadChimeAvatarJob < ApplicationJob
  def perform(attendee, update_user: false)
    chime_user = attendee.chime_user
    raise "no chime_user for attendee=#{attendee.id}" unless chime_user

    s3 = Aws::S3::Client.new(region: Rails.application.config.x.s3.public_region, logger: Rails.logger)
    URI.open(attendee.original_avatar_url, 'r') do |io|
      s3.put_object(
        bucket: Rails.application.config.x.s3.public_bucket,
        key: "#{Rails.application.config.x.s3.public_prefix}avatars/#{chime_user.handle}",
        content_type: io.content_type,
        cache_control: 'pubilc, max-age=86400, stale-while-revalidate=3600',
        body: io,
      )
    end

    UpdateChimeUserJob.perform_now(attendee) if update_user
  end
end

require 'securerandom'

class EmitVenueAnnouncementsJob < ApplicationJob
  def perform()
    # GetVenueAnnouncementsResponse
    body = {
      venue_announcements: VenueAnnouncement.active.to_a.map(&:as_json),
    }

    outpost_key = "venue_announcements/#{Time.now.utc.strftime('%Y%m%dT%H%M%SZ')}-#{SecureRandom.urlsafe_base64(8)}.json"
    s3 = Aws::S3::Client.new(region: Rails.application.config.x.s3.public_region, logger: Rails.logger)
    s3.put_object(
      bucket: Rails.application.config.x.s3.public_bucket,
      key: "#{Rails.application.config.x.s3.public_prefix}outpost/#{outpost_key}",
      content_type: 'application/json; charset=utf-8',
      cache_control: 'pubilc, max-age=31536000',
      body: JSON.generate(body),
    )

    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)

    control = {control: {outpost: {venue_announcements: outpost_key}}}
    @chimemessaging.send_channel_message(
      chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
      channel_arn: Conference.data.fetch(:chime).fetch(:systems_channel_arn),
      content: control.to_json,
      type: 'STANDARD',
      persistence: 'NON_PERSISTENT',
    )
  end
end

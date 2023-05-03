require 'securerandom'

class EmitConferenceDataJob < ApplicationJob
  def perform(t: Time.zone.now, route:)
    @t = t
    # GetConferenceResponse
    body = {
      requested_at: t.to_i,
      stale_after: t.to_i + 15,
      conference: Conference.as_json(t: t),
    }

    outpost_key = "conference/#{t.utc.strftime('%Y%m%dT%H%M%SZ')}-#{SecureRandom.urlsafe_base64(8)}.json"
    s3 = Aws::S3::Client.new(region: Rails.application.config.x.s3.public_region, logger: Rails.logger)
    s3.put_object(
      bucket: Rails.application.config.x.s3.public_bucket,
      key: "#{Rails.application.config.x.s3.public_prefix}outpost/#{outpost_key}",
      content_type: 'application/json; charset=utf-8',
      cache_control: 'pubilc, max-age=31536000',
      body: JSON.generate(body),
    )

    case route
    when :both
      send_ivs(outpost_key)
      send_chime(outpost_key)
    when :ivs
      send_ivs(outpost_key)
      send_chime(outpost_key, track: false)
    when :chime
      send_chime(outpost_key)
    else
      raise ArgumentError, "unknown route: #{route}"
    end
  end

  def send_chime(outpost_key, track: true, systems: true)
    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)

    control = {control: {outpost: {conference: outpost_key}}}

    channel_arns = [
      *(track ? Conference.chime_channel_arns : []),
      *(systems ? [Conference.data.fetch(:chime).fetch(:systems_channel_arn)] : []),
    ]

    channel_arns.each do |channel_arn|
      @chimemessaging.send_channel_message(
        chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
        channel_arn: channel_arn,
        content: control.to_json,
        type: 'STANDARD',
        persistence: 'NON_PERSISTENT',
      )
    end
  end

  def send_ivs(outpost_key)
    @ivs = Aws::IVS::Client.new(region: Conference.data.fetch(:ivs).fetch(:region), logger: Rails.logger)

    channel_arn_with_tracks = Conference.data.fetch(:tracks).each_value.flat_map do |track_data|
      track_data.fetch(:ivs, {}).each_value.map { |ivs| [ivs.fetch(:arn), track_data.fetch(:slug)] }
    end.uniq(&:first)

    payload = {outpost: {conference: outpost_key}, t: (@t.to_f*1000).to_i }

    ths = channel_arn_with_tracks.map do |arn_track|
      Thread.new(arn_track) do |(arn,track)|
        @ivs.put_metadata(channel_arn: arn, metadata: payload.to_json)
      rescue Aws::IVS::Errors::ChannelNotBroadcasting => e
        Rails.logger.warn "#{e.inspect}"
      end
    end

    ths.map(&:value)
  end
end

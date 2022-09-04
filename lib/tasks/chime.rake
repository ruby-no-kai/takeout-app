namespace :takeout do
  task :ensure_chime => :environment  do |_t, args|
    chimeidentity = Aws::ChimeSDKIdentity::Client.new(region: 'us-east-1', logger: Rails.logger)
    chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    app_instance_arn = Conference.data.fetch(:chime).fetch(:app_arn)

    admin_arn = chimeidentity.create_app_instance_user(
      app_instance_arn:,
      app_instance_user_id: 'app',
      name: 'app',
    ).app_instance_user_arn

    chimeidentity.create_app_instance_admin(
      app_instance_arn:,
      app_instance_admin_arn: admin_arn,
    )

    kiosk_arn = chimeidentity.create_app_instance_user(
      app_instance_arn:,
      app_instance_user_id: 'kiosk',
      name: 'kiosk',
    ).app_instance_user_arn

    existing_channels = chimemessaging.list_channels(
      app_instance_arn:,
      chime_bearer: admin_arn,
    ).flat_map(&:channels).map { |_| [_.name, _.channel_arn] }.to_h

    track_channels = Conference.track_slugs.map do |track_slug|
      name = track_slug.to_s
      [
        track_slug.to_s, 
        existing_channels[name] || chimemessaging.create_channel(
          app_instance_arn:,
          name: ,
          mode: 'UNRESTRICTED',
          privacy: 'PUBLIC',

          chime_bearer: admin_arn,
        ).channel_arn
      ]
    end.to_h

    caption_channels = Conference.track_slugs.map do |track_slug|
      name =  "cc-#{track_slug}"
      [
        track_slug.to_s, 
        existing_channels[name] || chimemessaging.create_channel(
          app_instance_arn:,
          name:,
          mode: 'UNRESTRICTED',
          privacy: 'PUBLIC',
          chime_bearer: admin_arn,
        ).channel_arn
      ]
    end.to_h

    systems_channel = chimemessaging.create_channel(
      app_instance_arn:,
      name: "systems",
      mode: 'RESTRICTED',
      privacy: 'PRIVATE',
      chime_bearer: admin_arn,
    ).channel_arn

    chimemessaging.create_channel_membership(
      channel_arn: systems_channel,
      member_arn: kiosk_arn,
      type: "DEFAULT",
      chime_bearer: admin_arn,
    )

    puts
    puts JSON.pretty_generate(
      chime: {
        app_arn: app_instance_arn,
        app_user_arn: admin_arn,
        kiosk_user_arn: kiosk_arn,
        systems_channel_arn: systems_channel,
      },
      tracks: Conference.track_slugs.map do |track_slug|
        [
          track_slug.to_sym, 
          {
            chime: {
              channel_arn: track_channels.fetch(track_slug.to_s),
              caption_channel_arn: caption_channels.fetch(track_slug.to_s),
            },
          },
        ]
      end.to_h,
    )

    #rescue Aws::ChimeSDKIdentity::Errors::ConflictException => e
    #  Rails.logger.warn "chime:CreateAppInstanceUser returned #{e} for #{chime_user.inspect}"
    #end

  end
end

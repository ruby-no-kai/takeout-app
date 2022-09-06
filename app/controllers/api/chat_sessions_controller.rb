class Api::ChatSessionsController < Api::ApplicationController
  def self.sts
    @sts ||= Aws::STS::Client.new(region: 'us-east-1', logger: Rails.logger)
  end

  def show
    is_kiosk = params[:kiosk] == '1'

    if is_kiosk && session[:kiosk]
      # do nothing
    else
      require_attendee 
      unless current_attendee.chime_user&.ready?
        CreateChimeUserJob.perform_now(current_attendee)
      end
    end

    chaining = self.class.sts.config.credentials.session_token.present?
    lifetime = chaining ? 3600 : 3600*12
    grace = chaining ? 300 : (lifetime - (3600*3) + rand(3600))

    now = Time.now + 5 # assume STS call latency
    exp = now + lifetime + grace
    response.date = now
    response.headers['expires'] = (exp-grace).httpdate
    response.cache_control.merge!( public: false,  stale_if_error: grace )

    chime_user = is_kiosk ? Conference.chime_kiosk_user : current_attendee.chime_user

    role_session = self.class.sts.assume_role(
      role_arn: Rails.application.config.x.chime.user_role_arn,
      role_session_name: chime_user.chime_id,
      duration_seconds: lifetime,
      tags: [
        { key: 'rk_takeout_user_id', value: chime_user.chime_id},
      ],
    )

    render(json: {
      expiry: exp.to_i,
      grace: grace.to_i,
      app_arn: Conference.data.fetch(:chime).fetch(:app_arn),
      app_user_arn: Conference.data.fetch(:chime).fetch(:app_user_arn),
      user_arn: chime_user.chime_arn,
      aws_credentials: {
        access_key_id: role_session.credentials.access_key_id,
        secret_access_key: role_session.credentials.secret_access_key,
        session_token: role_session.credentials.session_token,
      },
      tracks: Conference.data.fetch(:tracks).transform_values do |track|
        track.fetch(:chime, nil)
      end,
      systems_channel_arn: Conference.data.fetch(:chime).fetch(:systems_channel_arn),
    })
  end
end

class Api::ChatSessionsController < Api::ApplicationController
  def self.sts
    @sts ||= Aws::STS::Client.new(region: 'us-east-1')
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

    use_oidc = !!Rails.configuration.x.chime.use_oidc # OIDC to avoid role chaining lifetime issue
    chaining = self.class.sts.config.credentials&.then { |c| c.is_a?(Aws::Credentials) ? c.session_token.present? : true } && !use_oidc
    lifetime = chaining ? 3600 : 3600*12
    grace = chaining ? 300 : (lifetime - (3600*3) + rand(3600))

    now0 = Time.now
    now = now0 + 5 # assume STS call latency
    exp = now + lifetime + grace

    chime_user = is_kiosk ? Conference.chime_kiosk_user : current_attendee.chime_user

    role_params = {
      role_arn: Rails.application.config.x.chime.user_role_arn,
      role_session_name: chime_user.chime_id,
      duration_seconds: lifetime,
    }
    role_session = if use_oidc
      self.class.sts.assume_role_with_web_identity(
        web_identity_token: JWT.encode(
          {
            iss: "https://takeout.rubykaigi.org",
            aud: 'sts.amazonaws.com',
            sub: "system:#{Rails.env.production? ? 'production' : 'development'}:takeout-app-user",
            jti: SecureRandom.urlsafe_base64(20),
            iat: now0.to_i,
            nbf: now0.to_i,
            exp: now0.to_i + 25,
            'https://aws.amazon.com/tags' => {
              principal_tags: {
                rk_takeout_user_id: [chime_user.chime_id],
              },
              transitive_tag_keys: %w(rk_takeout_user_id),
            },
          },
          OidcSigningKey.pkey,
          'RS256',
          kid: OidcSigningKey.kid,
        ),
        **role_params
      )
    else
      self.class.sts.assume_role(
        tags: [
          { key: 'rk_takeout_user_id', value: chime_user.chime_id},
        ],
        **role_params
      )
    end

    response.date = now
    response.headers['expires'] = (exp-grace).httpdate
    response.cache_control.merge!( public: false,  stale_if_error: grace )
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

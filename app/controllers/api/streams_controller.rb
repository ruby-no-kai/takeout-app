class Api::StreamsController < Api::ApplicationController
  before_action :require_attendee

  # https://docs.aws.amazon.com/ivs/latest/userguide/private-channels-generate-tokens.html
  def show
    track = Conference.data.fetch(:tracks)[params[:track_slug]]
    raise Api::ApplicationController::Error::NotFound, "unknown track" unless track

    stream_type = params[:interpretation] == '1' ? :interpretation : :general
    stream_info = track.fetch(:ivs)[stream_type]
    raise Api::ApplicationController::Error::NotFound, "stream type not offered" unless stream_info

    lifetime = 3600
    grace = 3600

    now = Time.now
    exp = now + lifetime + grace
    response.date = now
    response.headers['expires'] = (exp-grace).httpdate
    response.cache_control.merge!( public: false, state_while_revalidate: grace, stale_if_error: grace )

    pk = Rails.application.config.x.ivs.private_key
    token = pk && JWT.encode({ "aws:channel-arn" => stream_info.fetch(:arn), exp: exp.to_i }, pk, 'ES384')

    render(json: {
      stream: {
        slug: track.fetch(:slug),
        type: stream_type,
        url: token ? "#{stream_info.fetch(:url)}?token=#{token}" : stream_info.fetch(:url),
        expiry: exp.to_i,
      },
    }.to_json)
  end
end

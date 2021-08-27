class Api::StreamsController < Api::ApplicationController
  before_action :require_attendee

  # https://docs.aws.amazon.com/ivs/latest/userguide/private-channels-generate-tokens.html
  def show
    expires_in 1.hour, public: true, state_while_revalidate: 1.hour, stale_if_error: 1.hour, "s-maxage": 0

    track = Conference.data.fetch(:tracks)[params[:track_slug]]
    raise Api::ApplicationController::Error::NotFound, "unknown track" unless track

    stream_type = params[:interpretation] == '1' ? :interpretation : :general
    stream_info = track.fetch(:ivs)[stream_type]
    raise Api::ApplicationController::Error::NotFound, "stream type not offered" unless stream_info

    pk = Rails.application.config.x.ivs.private_key
    token = pk && JWT.encode({ "aws:channel-arn" => stream_info.fetch(:arn), exp: Time.now.to_i + (3600*2) }, pk, 'ES384')

    render(json: {
      stream: {
        slug: track.fetch(:slug),
        type: stream_type,
        url: token ? "#{stream_info.fetch(:url)}?token=#{token}" : stream_info.fetch(:url),
      },
    }.to_json)
  end
end

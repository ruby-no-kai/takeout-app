class Api::ChatMessagesController < ApplicationController
  before_action :require_attendee

  def create
    as_admin = params[:as_admin]
    chime_bearer = nil
    if as_admin
      unless current_attendee&.is_staff?
        raise Api::ApplicationController::Error::Forbidden, "you have to be a staff"
      end
      chime_bearer = Conference.data.fetch(:chime).fetch(:app_user_arn)
    end

    chime_bearer ||= current_attendee.chime_user&.chime_arn

    unless chime_bearer
      raise Api::ApplicationController::Error::NotFound, "chime_arn undefined"
    end

    channel_arn = Conference.data.fetch(:tracks).dig(params[:track_slug], :chime, :channel_arn)
    unless channel_arn
      raise Api::ApplicationController::Error::NotFound, "channel_arn undefined"
    end

    chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    chimemessaging.send_channel_message(
      chime_bearer: chime_bearer,
      channel_arn: channel_arn,
      content: as_admin ? {message: params[:message]}.to_json : params[:message],
      type: 'STANDARD',
      persistence: 'PERSISTENT',
    )

    render(json: {ok: true}.to_json)
  end

end

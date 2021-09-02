# XXX: subject to reconsider but this isn't an control API
class Api::ChatAdminMessagesController < ApplicationController
  before_action :require_attendee

  def create
    unless current_attendee&.is_staff?
      raise Api::ApplicationController::Error::Forbidden, "you have to be a staff"
    end

    channel_arn = Conference.data.fetch(:tracks).dig(params[:track_slug], :chime, :channel_arn)
    unless channel_arn
      raise Api::ApplicationController::Error::NotFound, "channel_arn undefined"
    end

    chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
    chimemessaging.send_channel_message(
      chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
      channel_arn: channel_arn,
      content: {message: params[:message]}.to_json,
      type: 'STANDARD',
      persistence: 'PERSISTENT',
    )

    render(json: {ok: true}.to_json)
  end

end

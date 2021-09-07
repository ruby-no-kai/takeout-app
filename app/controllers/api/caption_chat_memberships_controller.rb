class Api::CaptionChatMembershipsController < Api::ApplicationController
  before_action :require_attendee

  def create
    channel = Conference.data.dig(:tracks, params[:track_slug], :chime, :caption_channel_arn)
    unless channel
      raise Api::ApplicationController::Error::NotFound, "no caption channel arn"
    end

    chime_user = current_attendee.chime_user
    unless chime_user
      raise Api::ApplicationController::Error::Forbidden, "no chime user"
    end

    chimemessaging.create_channel_membership(
      channel_arn: channel,
      member_arn: chime_user.chime_arn,
      type: "HIDDEN",

      chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
    )

    render(json: {ok: true}.to_json)
  end

  def destroy
    channel = Conference.data.dig(:tracks, params[:track_slug], :chime, :caption_channel_arn)
    unless channel
      raise Api::ApplicationController::Error::NotFound, "no caption channel arn"
    end

    chime_user = current_attendee.chime_user
    unless chime_user
      raise Api::ApplicationController::Error::Forbidden, "no chime user"
    end

    chimemessaging.delete_channel_membership(
      channel_arn: channel,
      member_arn: chime_user.chime_arn,
      chime_bearer: Conference.data.fetch(:chime).fetch(:app_user_arn),
    )

    render(json: {ok: true}.to_json)
  end

  private def chimemessaging
    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Rails.logger)
  end
end

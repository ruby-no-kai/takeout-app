# XXX: separate controller due to CloudFront
class Api::ChatAdminMessagePinsController < ApplicationController
  before_action :require_attendee

  def update
    unless current_attendee&.is_staff?
      raise Api::ApplicationController::Error::Forbidden, "you have to be a staff"
    end

    ChatMessagePin.set(params[:track_slug], params[:chat_message])

    render(json: {ok: true}.to_json)
  end
end

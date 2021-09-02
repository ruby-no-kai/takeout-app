# intentionally public
class Api::ChatMessagePinsController < ApplicationController
  def show
    unless Conference.data.fetch(:tracks)[params[:track_slug]]
      raise Api::ApplicationController::Error::NotFound, "track undefined"
    end

    expires_in 15.seconds, public: true, stale_if_error: 2.minute
    (response.cache_control[:extras] ||= []) << 'no-cache="Set-Cookie"'

    pin = ChatMessagePin.find_by(track: params[:track_slug]) 
    render(json: {
      track: params[:track_slug],
      pin: pin&.as_json,
    }.to_json)
  end
end

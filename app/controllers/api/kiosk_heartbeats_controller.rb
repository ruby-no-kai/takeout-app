class Api::KioskHeartbeatsController < ApplicationController
  def create
    raise Api::ApplicationController::Error::Unauthorized unless session[:kiosk]
    now = Time.zone.now
    at = params[:last_heartbeat_at]&.to_i
    KioskHeartbeat.find_or_initialize_by(
      name: session[:kiosk],
    ).update!(
      version: params[:version],
      last_heartbeat_at: at ? Time.at(at) : nil,
      last_checkin_at: now,
    )
    render(json: {}.to_json)
  end
end

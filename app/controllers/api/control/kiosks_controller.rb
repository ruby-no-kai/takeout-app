class Api::Control::KiosksController < Api::Control::ApplicationController
  def index
    render(json: {
      kiosks: KioskHeartbeat.all.to_a.map(&:as_json),
    })
  end

  def reload
    @kiosk_heartbeat = KioskHeartbeat.find(params[:id])
    SendKioskControlJob.perform_now(reload: {name: @kiosk_heartbeat.name})
    render(json: {})
  end

end

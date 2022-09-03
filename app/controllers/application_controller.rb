class ApplicationController < ActionController::Base
  def current_attendee
    @current_attendee ||= session[:attendee_id].presence && Attendee.where(id: session[:attendee_id]).first
  end

  def require_attendee
    if current_attendee.nil? || current_attendee.voided?
      return redirect_to "/session/new?void=#{current_attendee&.voided? ? 1 : 0}"
    end
    return nil
  end

  def require_control
    require_attendee.tap do |x|
      return x if x
    end
    unless session[:staff_control]
      redirect_to "/control/session/new"
    end
  end
end

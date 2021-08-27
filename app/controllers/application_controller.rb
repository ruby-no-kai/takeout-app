class ApplicationController < ActionController::Base
  def current_attendee
    @current_attendee ||= session[:attendee_id].present? && Attendee.where(id: session[:attendee_id]).first
  end

  def require_attendee
    if !current_attendee || current_attendee.voided?
      redirect_to "/session/new?void=#{current_attendee&.voided? ? 1 : 0}"
    end
  end
end

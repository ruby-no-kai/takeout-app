class Control::ChimeUsersController < Control::ApplicationController
  def lookup
    redirect_to "/control/attendees/#{ChimeUser.joins(:attendee).find_by!(handle: params[:handle]).attendee.ticket_id}"
  end
end

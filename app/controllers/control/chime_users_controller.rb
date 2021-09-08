class Control::ChimeUsersController < Control::ApplicationController
  def lookup
    redirect_to "/control/attendees/#{ChimeUser.find_by!(handle: params[:handle]).attendee_id}"
  end
end

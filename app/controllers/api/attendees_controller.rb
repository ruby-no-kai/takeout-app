class Api::AttendeesController < Api::ApplicationController
  before_action :require_attendee

  def update
    current_attendee.assign_attributes(
      ready: true,
      name: params[:name],
    )
    current_attendee.gravatar_email = params[:gravatar_email] if params[:gravatar_email].present?

    current_attendee.save!
    UploadChimeAvatarJob.perform_later(current_attendee, update_user: true)

    render json: {ok: true, attendee: current_attendee.as_json}.to_json
  end
end

class Api::Control::AttendeesController < Api::Control::ApplicationController
  def index
    @tickets = Ticket.all.joins(attendees: :chime_user)
    query = params[:query].presence
    if query
      @tickets = @tickets.where("(' ' || tickets.first_name || ' ' || tickets.last_name || ' ') like ('%' || ? || '%') or tickets.reference = ?", query, query)
    end

    render(json: {
      items: @tickets.to_a.map do |ticket|
        attendee = ticket.active_attendee || ticket.build_attendee
        {
          ticket: ticket.as_json,
          attendee: attendee.as_json(admin: true),
          chime_user: attendee&.chime_user&.as_json,
        }
      end
    }.to_json)
  end

  def show
    ticket = Ticket.find(params[:id])
    attendee = ticket.active_attendee || ticket.build_attendee
    render(json: {
      ticket: ticket.as_json,
      attendee: attendee.as_json(admin: true),
      chime_user: attendee&.chime_user&.as_json,
    }.to_json)
  end

  def update
    @ticket = Ticket.find(params[:id])

    attendee = ticket.active_attendee || ticket.build_attendee

    attendee_params = params.require(:attendee).permit(:is_staff, :is_speaker, :is_committer, :name)
    attendee.update!(attendee_params)

    if attendee.ready?
      UpdateChimeUserJob.perform_later(attendee)
    end

    render(json: {ok: true}.to_json)
  end

  #def delete
  #  @ticket = Ticket.find(params[:id])

  #  attendee = ticket.active_attendee
  #  if attendee
  #    attendee.void!
  #    # TODO: void job
  #  end

  #end
end

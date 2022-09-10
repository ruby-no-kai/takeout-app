class Api::VenueAnnouncementsController < Api::ApplicationController
  def index
    render(json: {
      venue_announcements: VenueAnnouncement.active.to_a.map(&:as_json),
    })
  end
end

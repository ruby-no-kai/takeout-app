class Api::Control::VenueAnnouncementsController < Api::Control::ApplicationController
  before_action :set_venue_announcement,only: %i(update destroy)
  
  def index
    render(json: {
      venue_announcements: VenueAnnouncement.order(order_index: :asc).to_a.map(&:as_json),
    })
  end

  def create
    venue_announcement = VenueAnnouncement.new(venue_announcement_params)
    venue_announcement.save!
    EmitVenueAnnouncementsJob.perform_now()

    render(json: {
      venue_announcement: venue_announcement.as_json,
    })
  end

  def update
    @venue_announcement.update!(venue_announcement_params)
    EmitVenueAnnouncementsJob.perform_now()
    render(json: {
      venue_announcement: @venue_announcement.as_json,
    })
  end

  def destroy
    @venue_announcement.destroy!
    EmitVenueAnnouncementsJob.perform_now()
    render(json: {
      venue_announcement: @venue_announcement.as_json,
    })
  end

  private def set_venue_announcement
    @venue_announcement = VenueAnnouncement.find_by!(id: params[:id])
  end

  private def venue_announcement_params
    attributes = params[:venue_announcement]
    {
      content: attributes[:content],
      enabled: attributes[:enabled],
      only_intermission: attributes[:only_intermission],
      only_signage: attributes[:only_signage],
      only_subscreen: attributes[:only_subscreen],
      order_index: attributes[:order_index]&.then { |v| v >= 0 ? v : VenueAnnouncement.order(order_index: :desc).first&.order_index&.succ } || 0,
    }
  end
end

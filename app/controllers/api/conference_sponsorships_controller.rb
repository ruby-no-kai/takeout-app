class Api::ConferenceSponsorshipsController < Api::ApplicationController
  def index
    expires_in 15.minutes, public: true

    render(json: {
      conference_sponsorships: ConferenceSponsorship.order(sponsor_app_id: :asc).map(&:as_json),
    })
  end
end

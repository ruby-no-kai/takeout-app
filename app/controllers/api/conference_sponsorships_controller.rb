class Api::ConferenceSponsorshipsController < Api::ApplicationController
  def index
    expires_in 1.hour, public: true, stale_while_revalidate: 30.minutes, stale_if_error: 1.hour, "s-maxage": 12.hours

    render(json: {
      conference_sponsorships: ConferenceSponsorship.order(sponsor_app_id: :asc).map(&:as_json),
    })
  end
end

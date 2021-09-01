class Api::Control::ConferencesController < Api::Control::ApplicationController
  def show
    expires_in 1.hour, public: false, stale_while_revalidate: 1.hour
    render(json: {
      presentations: ConferencePresentation.all.map{ |_| [_.slug, _.as_json] }.to_h,
      speakers: ConferenceSpeaker.all.map{ |_| [_.slug, _.as_json] }.to_h,
    }.to_json)
  end
end

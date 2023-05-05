class Api::ConferencesController < Api::ApplicationController
  # This API is intentionally public

  def show
    now = Time.zone.now

    expires_in 5.seconds, public: true, 's-maxage' => 300
    (response.cache_control[:extras] ||= []) << 'no-cache="Set-Cookie"'

    render(json: {
      requested_at: now.to_i,
      stale_after: now.to_i + 15.seconds,
      conference: Conference.as_json(t: now),
    }.to_json)
  end
end

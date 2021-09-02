class Api::ConferencesController < Api::ApplicationController
  # This API is intentionally public

  def show
    now = Time.zone.now
    lifetime = 15.seconds
    grace = 2.minutes
    response.date = now
    response.headers['expires'] = (now+lifetime).httpdate
    (response.cache_control[:extras] ||= []) << 'no-cache="Set-Cookie"'
    response.cache_control.merge!( public: true, stale_while_revalidate: grace, stale_if_error: grace )

    render(json: {
      requested_at: now.to_i,
      stale_after: now.to_i + 15.seconds,
      conference: Conference.as_json(t: now),
    }.to_json)
  end
end

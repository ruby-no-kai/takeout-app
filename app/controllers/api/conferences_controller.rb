class Api::ConferencesController < Api::ApplicationController
  # This API is intentionally public

  def show
    expires_in 15.seconds, public: true, stale_while_revalidate: 15.seconds, stale_if_error: 15.minutes # TODO:
    response.cache_control[:extras] << 'no-cache="Set-Cookie"'

    render(json: {
      conference: Conference.as_json,
    }.to_json)
  end
end

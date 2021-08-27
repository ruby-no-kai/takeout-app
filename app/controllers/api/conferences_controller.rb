class Api::ConferencesController < Api::ApplicationController
  # This API is intentionally public

  def show
    expires_in 1.minutes, public: true
    response.cache_control[:extras] << 'no-cache="Set-Cookie"'

    render(json: {
      conference: Conference.as_json,
    }.to_json)
  end
end

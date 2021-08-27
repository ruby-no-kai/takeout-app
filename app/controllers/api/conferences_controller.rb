class Api::ConferencesController < Api::ApplicationController
  # This API is intentionally public

  def show
    expires_in 1.minutes, public: true
    response.cache_control[:extras] << 'no-cache="Set-Cookie"'

    render(json: {
      conference: {
        default_track: Conference.data.fetch(:default_track),
        track_order: Conference.data.fetch(:track_order),
        tracks: Conference.data.fetch(:tracks).transform_values do |track|
          track.except(:ivs).merge( # TODO:
            topic: "Topic #{track.fetch(:name)}",
            topic_author: "Author #{track.fetch(:name)}",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          )
        end,
      }
    }.to_json)
  end
end

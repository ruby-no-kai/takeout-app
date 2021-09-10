class Api::AppVersionsController < ApplicationController
  def show
    expires_in 60.seconds
    render(json: {
      commit: Rails.application.config.x.release_meta.commit || '',
      release: Rails.application.config.x.release_meta.version || '',
    }.to_json)
  end
end

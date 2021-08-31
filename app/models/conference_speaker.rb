class ConferenceSpeaker < ApplicationRecord
  def original_avatar_url
    "https://www.gravatar.com/avatar/#{gravatar_hash}?r=g&s=250&d=#{URI.encode_www_form_component(Rails.application.config.x.default_avatar_url)}" # TODO:
  end
end

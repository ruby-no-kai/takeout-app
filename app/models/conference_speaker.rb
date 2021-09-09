class ConferenceSpeaker < ApplicationRecord
  def as_json
    {
      slug: slug,
      name: name,
      github_id: github_id,
      twitter_id: twitter_id,
      avatar_url: avatar_url,
    }
  end

  def original_avatar_url
    "https://www.gravatar.com/avatar/#{gravatar_hash}?r=g&s=250&d=#{URI.encode_www_form_component(Rails.application.config.x.default_avatar_url)}" # TODO:
  end

  def avatar_url
    "/avatars/s_#{slug}"
  end
end

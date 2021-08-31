module AvatarProvider
  def self.url(handle, original_url, version: nil)
    prefix = Rails.application.config.x.avatar_prefix
    if handle && prefix
      p "#{prefix}#{handle}?v=#{version}"
    else
      original_url
    end
  end
end

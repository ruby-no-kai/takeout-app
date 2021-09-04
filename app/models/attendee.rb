class Attendee < ApplicationRecord
  validates :name, presence: true # TODO: length
  validates :gravatar_hash, presence: true

  belongs_to :ticket

  has_one :chime_user, dependent: :destroy

  scope :active, -> { where(voided_at: nil) }

  def gravatar_email=(o)
    write_attribute(:gravatar_hash,  Digest::MD5.hexdigest(o.strip.downcase))
    o
  end

  def assign_inferred_role
    # Note: using release_title because release_slug may have a randomised value
    case ticket.release_title&.downcase
    when 'staff'
      self.is_staff = true
    when 'speaker'
      self.is_speaker = true
    when 'ruby committer'
      self.is_committer = true
    when 'sponsor'
      self.is_sponsor = true
    end
  end

  def as_json(admin: false)
    {
      id: id,
      name: name,
      avatar_url: AvatarProvider.url(chime_user&.handle, original_avatar_url, version: chime_user&.version),
      is_ready: ready?,
      is_staff: staff?,
      is_speaker: speaker?,
      is_committer: committer?,
    }.merge(admin ? {
      is_sponsor: sponsor?,
      presentation_slugs: presentation_slugs || [],
    } : {})
  end

  def original_avatar_url
    "https://www.gravatar.com/avatar/#{gravatar_hash}?r=g&s=250&d=#{URI.encode_www_form_component(Rails.application.config.x.default_avatar_url)}" # TODO:
  end

  def void!
    self.voided_at = Time.zone.now
    self.save!
  end

  def voided?
    !!self.voided_at
  end

  def staff?
    !!is_staff
  end

  def speaker?
    !!is_speaker
  end

  def committer?
    !!is_committer
  end

  def sponsor?
    !!is_sponsor
  end
end

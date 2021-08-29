class Attendee < ApplicationRecord
  validates :name, presence: true
  validates :gravatar_hash, presence: true

  belongs_to :ticket

  scope :active, -> { where(voided_at: nil) }

  def gravatar_email=(o)
    write_attribute(:gravatar_hash,  Digest::MD5.hexdigest(o.strip.downcase))
    o
  end

  def assign_inferred_role
    # Note: using release_title because release_slug may have a randomised value
    case release_title.downcase
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
      name: name,
      avatar_url: avatar_url,
      is_ready: ready?,
      is_staff: staff?,
      is_speaker: speaker?,
      is_committer: committer?,
      is_sponsor: sponsor?,
    }
  end

  def avatar_url
    "https://www.gravatar.com/avatar/#{gravatar_hash}?s=500" # TODO:
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

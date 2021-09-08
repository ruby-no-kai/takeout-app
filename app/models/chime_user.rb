require 'securerandom'

class ChimeUser < ApplicationRecord
  belongs_to :attendee

  before_validation :ensure_name
  before_validation :ensure_handle
  before_validation :ensure_version

  def as_json
    {
      handle: handle,
      name: name,
      version: version,
      is_ready: ready,
    }
  end

  def chime_id
    handle
  end

  def chime_arn
    "#{Conference.data.fetch(:chime).fetch(:app_arn)}/user/#{chime_id}"
  end

  def chime_name
    bits = %i(is_staff is_speaker is_committer).map { |_| attendee[_] ? 't' : 'f' }.join
    "a!#{bits}!#{(version || 0).to_s(27)}|#{attendee.ready? ? attendee.name : ""}"
  end

  def update_name
    new_name = chime_name
    return nil if new_name == self.name
    self.name = chime_name
  end

  private def ensure_name
    update_name unless self.name
  end

  # https://docs.aws.amazon.com/chime/latest/APIReference/API_identity-chime_CreateAppInstanceUser.html#API_identity-chime_CreateAppInstanceUser_RequestSyntax
  CHIME_USER_ID_PATTERN = /^[A-Za-z0-9]([A-Za-z0-9\:\-\_\.\@]{0,62}[A-Za-z0-9])?$/

  private def ensure_handle
    if self.handle.blank? || !(self.handle || "").match?(CHIME_USER_ID_PATTERN)
      loop do
        self.handle = "u_#{SecureRandom.urlsafe_base64(9)}"
        next unless self.handle.match?(CHIME_USER_ID_PATTERN)
        break unless self.class.where(handle: self.handle).exists?
        sleep 0.1
      end
    end
  end

  private def ensure_version
    self.version ||= 0
    self.version = self.version_was + 1 if self.version_was && self.changed?
  end
end

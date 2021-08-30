require 'securerandom'

class ChimeUser < ApplicationRecord
  belongs_to :attendee

  before_validation :ensure_name
  before_validation :ensure_handle

  def chime_id
    handle
  end

  def chime_arn
    "#{Conference.data.fetch(:chime).fetch(:app_arn)}/user/#{chime_id}"
  end

  def chime_name
    bits = %i(is_staff is_speaker is_committer).map { |_| attendee[_] ? 't' : 'f' }.join
    "#{bits}|#{attendee.ready? ? attendee.name : ""}"
  end

  def update_name
    new_name = chime_name
    return nil if new_name == self.name
    self.name = chime_name
  end

  private def ensure_name
    update_name unless self.name
  end

  private def ensure_handle
    unless self.handle
      loop do
        self.handle = "u_#{SecureRandom.urlsafe_base64(9)}"
        break unless self.class.where(handle: self.handle).exists?
        sleep 0.1
      end
    end
  end
end

class Attendee < ApplicationRecord
  belongs_to :ticket

  scope :active, -> { where.not(voided_at: nil) }

  def void!
    self.voided_at = Time.zone.now
    self.save!
  end
end

class Ticket < ApplicationRecord
  has_many :attendees, dependent: :destroy # includes voided attendees

  def active_attendee
    attendees.active.first
  end
end

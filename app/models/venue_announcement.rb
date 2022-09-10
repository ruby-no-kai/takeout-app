class VenueAnnouncement < ApplicationRecord
  scope :active, -> { where(enabled: true).order(order_index: :asc) }
end

class KioskHeartbeat < ApplicationRecord
  validates :name, presence: true
  validates :version, presence: true

  def as_json
    {
      id: id,
      name: name,
      version: version,
      last_heartbeat_at: last_heartbeat_at&.to_i,
      last_checkin_at: last_checkin_at&.to_i,
    }
  end
end

class StreamPresence < ApplicationRecord
  validates :kind, inclusion: { in: %w(main interpretation) }, presence: true
  validates :track, presence: true
  validate :validate_known_track

  def self.set(track, kind, online, save: true, emit: true)
    presence = self.find_or_initialize_by(track: track.to_s, kind: kind.to_s)
    presence.online = online
    was_online = presence.online_was
    if save
      presence.save!
      if emit
        EmitStreamPresenceJob.perform_now(presence: presence, was_online: was_online)
      end
    end
    presence
  end

  def self.as_json
    self.all.to_a
      .group_by(&:track)
      .transform_values { |vs| vs.map { |_| [_.kind, _.as_json] }.to_h }
  end

  def as_json
    {
      track: track,
      kind: kind,
      online: online,
      at: updated_at&.to_i || 0,
    }
  end

  def as_ivs_metadata_item
    {p: as_json}
  end

  private def validate_known_track
    unless Conference.track_slugs.map(&:to_s).include?(track&.to_s)
      errors.add(:track, 'is not known')
    end
  end
end

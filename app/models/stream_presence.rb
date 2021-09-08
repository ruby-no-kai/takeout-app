class StreamPresence < ApplicationRecord
  # TODO: validate

  def self.set(track, kind, online, save: true, emit: true)
    presence = self.find_or_initialize_by(track: track, kind: kind)
    presence.online = online
    was_online = presence.online_was
    if save
      presence.save!
      if emit
        EmitStreamPresenceJob.perform_now(presence: presence, was_online: was_online)
      end
    end
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
    { p: as_json }
  end

  def self.as_json
    self.all.to_a.group_by(&:track).transform_values { |vs| vs.map { |_| [_.kind, _.as_json] }.to_h }
  end
end

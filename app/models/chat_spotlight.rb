class ChatSpotlight < ApplicationRecord
  def self.set(track, handles, t: Time.zone.now, start_t: t, emit: true)
    last = ChatSpotlight.where(track: track, ends_at: nil).order(starts_at: :asc).last
    if last && !last.ends_at
      last.ends_at = t
      last.save!
    end
    spotlight = ChatSpotlight.create!(track: track, starts_at: start_t, ends_at: nil, handles: handles)
    if emit
      EmitChatSpotlightJob.perform_now(spotlights: [last, spotlight].compact)
    end
    spotlight
  end

  def as_json
    {
      id: id,
      track: track,
      starts_at: starts_at.to_i,
      ends_at: ends_at&.to_i,
      handles: handles,
    }
  end
end

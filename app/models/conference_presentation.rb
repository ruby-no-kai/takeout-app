class ConferencePresentation < ApplicationRecord
  def speakers
    slugs = (speaker_slugs || []).compact
    records = ConferenceSpeaker.where(slug: slugs).to_a
    slugs.map { |slug| records.find { |r| r.slug == slug } }.compact
  end
end

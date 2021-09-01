class ConferencePresentation < ApplicationRecord
  def as_json
    {
      slug: slug,
      title: title,
      kind: kind,
      language: language,
      description: description,
      speaker_slugs: speaker_slugs,
    }
  end

  def speakers
    slugs = (speaker_slugs || []).compact
    records = ConferenceSpeaker.where(slug: slugs).to_a
    slugs.map { |slug| records.find { |r| r.slug == slug } }.compact
  end
end

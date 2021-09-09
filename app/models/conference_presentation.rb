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

  def as_track_card
    presentation = self
    {
      interpretation: presentation.language != "EN",
      topic: {
        title: presentation.title,
        author: presentation.speaker_slugs.join(", "),
        description: presentation.description,
        labels: [presentation.kind, presentation.language],
      },
      speakers: presentation.speakers.map { |speaker|
        {
          name: speaker.name,
          github_id: speaker.github_id,
          twitter_id: speaker.twitter_id,
          avatar_url: speaker.avatar_url,
        }
      },
    }
  end

  def speakers
    slugs = (speaker_slugs || []).compact
    records = ConferenceSpeaker.where(slug: slugs).to_a
    slugs.map { |slug| records.find { |r| r.slug == slug } }.compact
  end
end

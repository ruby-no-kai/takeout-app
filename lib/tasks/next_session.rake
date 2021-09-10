require 'time'
namespace :takeout do
  task :next_session, [:slug_a, :slug_b, :time] => :environment  do |_t, args|
    now = Time.zone.now
    t = Time.parse(args[:time])

    presentation_a = args[:slug_a].present? ? ConferencePresentation.find_by!(slug: args[:slug_a]) : nil
    presentation_b = args[:slug_b].present? ? ConferencePresentation.find_by!(slug: args[:slug_b]) : nil

    ChatSpotlight.where(starts_at: t - 300).each(&:destroy!)
    TrackCard.where(activation_at: t).each(&:destroy!)

    ChatSpotlight.set('a', presentation_a.speaker_chime_handles, t: t, start_t: t - 300)
    ChatSpotlight.set('b', presentation_b.speaker_chime_handles, t: t, start_t: t - 300)


    screen = TrackCard.create!(
      track: '_screen',
      activation_at: now,
      content: {
        upcoming_topics: [
          presentation_a ? presentation_a.as_track_card.merge(track: "a", at: t.to_i) : nil,
          presentation_b ? presentation_b.as_track_card.merge(track: "b", at: t.to_i) : nil,
        ].compact,
      },
    )
    card_a = presentation_a ? TrackCard.create!(
      track: 'a',
      activation_at: t,
      content: presentation_a.as_track_card,
    ) : nil
    card_b = presentation_b ? TrackCard.create!(
      track: 'b',
      activation_at: t,
      content: presentation_b.as_track_card,
    ) : nil

    EmitIvsMetadataJob.perform_now
  end
end

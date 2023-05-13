class Api::Control::NextSessionsController < Api::Control::ApplicationController
  NextPresentation = Struct.new(:track, :presentation, keyword_init: true)
  def create
    t = Time.zone.now
    activation_at = Time.at(params[:activation_at])
    colleration = nil
    track_cards = []
    chat_spotlights = []

    ApplicationRecord.transaction do
      colleration = ControlColleration.create!(description: params[:description] || 'ns: ?')
      presentations = []
      params[:next_sessions].each do |ns|
        next if ns[:presentation].blank?
        presentation = ConferencePresentation.find_by!(slug: ns[:presentation])
        presentations.push(NextPresentation.new(track: ns[:track], presentation: presentation))

        track_cards.push(
          TrackCard.create!(
            track: ns[:track],
            activation_at: activation_at,
            content: presentation.as_track_card,
            control_colleration: colleration,
          )
        )

        ChatSpotlight.where(track: ns[:track], ends_at: nil).each do |cs|
          cs.update!(ends_at: t)
          chat_spotlights.push(cs)
        end

        chat_spotlights.push(
          ChatSpotlight.create!(
            track: ns[:track],
            starts_at: activation_at - 300,
            ends_at: nil,
            handles:  presentation.speaker_chime_handles,
            control_colleration: colleration,
          )
        )
      end

      track_cards.push(
        TrackCard.create!(
          track: '_screen',
          activation_at: t,
          content: {
            upcoming_topics: presentations.map do |pr|
              pr.presentation.as_track_card.merge(track: pr.track, at: activation_at.to_i)
            end,
          },
          control_colleration: colleration,
        )
      )
    end

    EmitConferenceDataJob.perform_now(route: :ivs)

    render(json: {
      ok: true,
      control_colleration: colleration.as_json,
      track_cards: track_cards.map { |_| _.as_json(control: true) },
      chat_spotlights: chat_spotlights.map { |_| _.as_json(control: true) },
    })
  end
end

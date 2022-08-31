class Api::Control::ControlCollerationsController < Api::Control::ApplicationController
  def show
    @colleration = ControlColleration.find(params[:id])

    render(json: {
      colleration: @colleration.as_json,
      track_cards: @colleration.track_cards.map { |_| _.as_json(control: true) },
      chat_spotlights: @colleration.chat_spotlights.map(&:as_json),
    })
  end

  def destroy
    @colleration = ControlColleration.find(params[:id])
    cards = @colleration.track_cards.to_a
    chat_spotlights = @colleration.chat_spotlights.to_a
    ApplicationRecord.transaction do
      @colleration.destroy!
    end
    EmitChatSpotlightJob.perform_now(spotlights: chat_spotlights, remove: true)
    EmitIvsMetadataJob.perform_now(items: nil)

    render(json: {
      track_cards: cards.map { |_| _.as_json(control: true) },
      chat_spotlights: chat_spotlights.map { |_| _.as_json(control: true) },
    })
  end
end

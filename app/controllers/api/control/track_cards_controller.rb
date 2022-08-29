class Api::Control::TrackCardsController < Api::Control::ApplicationController
  before_action :set_track_card, only: %i(update destroy)

  def index
    if params[:until]
      ts = begin
        Time.at(Integer(params[:until], 10))
      rescue ArgumentError
        raise Api::Control::ApplicationController::Error::BadRequest
      end

      cards = TrackCard.where(track: params[:track_slug])
        .where('activation_at <= ?', ts)
        .limit(10)
        .order(activation_at: :desc)
    else
      cards = [
        TrackCard.current_for(params[:track_slug]),
        *TrackCard.where(track: params[:track_slug]).candidate.to_a,
      ]
    end
    render(json: {
      track_cards: cards.compact.map { |_| _.as_json(control: true) },
    })
  end

  def create
    track_card = TrackCard.new(track_card_params)

    now = Time.now 
    track_card.activation_at = now if track_card.activation_at < now

    track_card.save!
    EmitIvsMetadataJob.perform_now
    render(json: {ok: true}.to_json)
  end

  def update
    if @track_card.candidate?
      @track_card.update!(track_card_params)
      EmitIvsMetadataJob.perform_later
      render(json: {ok: true}.to_json)
    else
      raise Api::ApplicationController::Error::BadRequest, "cannot update activated cards"
    end
  end

  def destroy
    if @track_card.candidate?
      @track_card.destroy!
      EmitIvsMetadataJob.perform_later
      render(json: {ok: true}.to_json)
    else
      raise Api::ApplicationController::Error::BadRequest, "cannot delete activated cards"
    end
  end

  private def set_track_card
    @track_card = TrackCard.find_by!(track: params[:track_slug], id: params[:id])
  end

  private def track_card_params
    attributes = params[:track_card]
    {
      track: attributes[:track],
      activation_at: attributes[:at]&.yield_self { |_| Time.at(_) } || Time.zone.now,
      content: {
        interpretation: attributes[:interpretation],
        topic: attributes[:topic],
        speakers: attributes[:speakers],
        screen: attributes[:screen],
        upcoming_topics: attributes[:upcoming_topics],
      },
    }
  end
end

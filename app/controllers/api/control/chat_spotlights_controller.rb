class Api::Control::ChatSpotlightsController < Api::Control::ApplicationController
  before_action :set_chat_spotlight, only: %i(update destroy)

  def index
    if params[:until]
      ts = begin
        Time.at(Integer(params[:until], 10))
      rescue ArgumentError
        raise Api::Control::ApplicationController::Error::BadRequest
      end

      chat_spotlights = ChatSpotlight.where(track: params[:track_slug])
        .where('ends_at <= ?', ts)
        .limit(10)
        .order(ends_at: :asc)
    else
      # TODO: index
      chat_spotlights = ChatSpotlight.where(track: params[:track_slug])
        .where('ends_at >= ? or ends_at is null', 12.hours.ago)
        .order(ends_at: :asc)
    end
    render(json: {
      chat_spotlights: chat_spotlights.compact.map { |_| _.as_json(control: true) },
    })
  end

  def create
    pa = chat_spotlight_params()
    t = Time.zone.now
    ChatSpotlight.set(pa[:track], pa[:handles], t: t, start_t: pa[:starts_at], emit: true)
    render(json: {ok: true}.to_json)
  end

  def update
    @chat_spotlight.update!(chat_spotlight_params)
    EmitChatSpotlightJob.perform_now(spotlights: [@chat_spotlight], remove: false)
    render(json: {ok: true}.to_json)
  end

  def destroy
    @chat_spotlight.destroy!
    EmitChatSpotlightJob.perform_now(spotlights: [@chat_spotlight], remove: true)
    render(json: {ok: true}.to_json)
  end

  private def set_chat_spotlight
    @chat_spotlight = ChatSpotlight.find_by!(track: params[:track_slug], id: params[:id])
  end

  private def chat_spotlight_params
    attributes = params[:chat_spotlight]
    {
      track: attributes[:track],
      handles: attributes[:handles],
      starts_at: attributes[:starts_at]&.yield_self { |_| Time.at(_) } || Time.zone.now,
      ends_at: attributes[:ends_at]&.yield_self { |_| Time.at(_) },
    }
  end
end

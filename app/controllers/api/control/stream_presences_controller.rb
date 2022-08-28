class Api::Control::StreamPresencesController < Api::Control::ApplicationController
  def show
    track = begin
      Conference.data.fetch(:tracks).fetch(params[:track_slug])
    rescue KeyError
      raise Api::Control::ApplicationController::Error::NotFound
    end

    @stream_presences = StreamPresence.where(track: params[:track_slug]).map { |v|  [v.kind, v] }.to_h
    %w(main interpretation).each do |kind|
      next if @stream_presences[kind]
      @stream_presences[kind] = track.fetch(:ivs).key?(kind) \
        ? StreamPresence.new(track: params[:track_slug], kind: kind.to_s, online: false)
        : nil
    end

    # TODO: consider caching
    # XXX: move ivs client to more proper location
    ivs = Aws::IVS::Client.new(region: Conference.data.fetch(:ivs).fetch(:region), logger: Rails.logger)
    @stream_statuses = track.fetch(:ivs).map do |kind, stream|
      [kind, ivs.get_stream(channel_arn: stream.fetch(:arn)).stream.to_h]
    rescue Aws::IVS::Errors::ChannelNotBroadcasting 
      [kind, nil]
    end.compact.to_h

    render(json: {
      at: Time.now.to_i,
      stream_presences: @stream_presences.transform_values(&:as_json),
      stream_statuses: @stream_statuses,
    })
  end

  def update
    render(json: {
      stream_presence: StreamPresence.set(params[:track_slug], params[:kind], params[:online]).as_json,
    })
  end
end

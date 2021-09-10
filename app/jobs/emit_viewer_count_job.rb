class EmitViewerCountJob < ApplicationJob
  def perform
    @ivs = Aws::IVS::Client.new(region: Conference.data.fetch(:ivs).fetch(:region), logger: Rails.logger)

    online_streams = StreamPresence.where(online: true).all
    channel_arns_by_track = Conference.data.fetch(:tracks).each_value.flat_map do |track_data|
      track_data.fetch(:ivs, {}).map { |kind, ivs|
        online_streams.find { |_| _.track == track_data.fetch(:slug) && _.kind == kind } ? [track_data.fetch(:slug), ivs.fetch(:arn)] : nil
      }.compact
    end.group_by(&:first).transform_values{ |_| _.map(&:last) }


    data = channel_arns_by_track.map do |track, channel_arns|
      count = channel_arns.uniq.map do |arn|
        @ivs.get_stream(channel_arn: arn).stream.viewer_count || 0
      rescue Aws::IVS::Errors::ChannelNotBroadcasting 
        0
      end.inject(:+)
      
      {track: track, count: count}
    end

    expiry = Time.zone.now + 90
    data = data.map { |_| {n: _.merge(expiry: expiry.to_i) }}

    channel_arns_by_track.values.flatten.each do |arn|
      @ivs.put_metadata(
        channel_arn: arn,
        metadata: {
          i: data,
        }.to_json,
      )
    rescue Aws::IVS::Errors::ChannelNotBroadcasting => e
      Rails.logger.warn "#{e.inspect}"
    end
  end
end

require 'socket'
require 'logger'
require 'thread'

require 'aws-sdk-transcribestreamingservice'
require 'json'

require_relative '../config/environment'
require_relative '../app/models/conference'

# ffmpeg -i ... -vn -f s16le -ar 16000 -ac 1 - | ruby serve.rb a |& tee -a /tmp/serve
# ffmpeg -i udp://0.0.0.0:10000 -f mpegts -c:a pcm_s16le -vn -f s16le -ar 16000 -ac 1 - | ruby serve.rb a |& tee -a /tmp/serve
class StdinInput
  def initialize
    @on_data = proc { }
  end

  def on_data(&block)
    @on_data = block
    self
  end

  def start
    th = Thread.new do
      $stdin.binmode
      $stderr.puts({binmode?: $stdin.binmode?}.inspect)
      until $stdin.eof?
        buf = $stdin.read(32000) # 256Kb
        @on_data.call buf
      end
    end.abort_on_exception = true
  end
end

class TranscribeEngine
  def initialize
    @client = Aws::TranscribeStreamingService::AsyncClient.new(region: 'ap-northeast-1')
    @input_stream = Aws::TranscribeStreamingService::EventStreams::AudioStream.new
    @output_stream = Aws::TranscribeStreamingService::EventStreams::TranscriptResultStream.new

    @output_stream.on_bad_request_exception_event do |exception|
      raise exception
    end

    @output_stream.on_event do |event|
      p event unless event.is_a?(Aws::TranscribeStreamingService::Types::TranscriptEvent)
    end
  end

  attr_reader :output_stream

  def feed(audio_chunk)
    @input_stream.signal_audio_event_event(audio_chunk: audio_chunk)
    self
  rescue Seahorse::Client::Http2ConnectionClosedError
    @client.connection.errors.each do |e|
      p e
    end
    raise
  end

  def start
    @client.start_stream_transcription(
      language_code: ENV.fetch('TRANSCRIBE_LANGUAGE_CODE', 'en-US'),

      enable_partial_results_stabilization: true,
      partial_results_stability: 'high',

      media_encoding: "pcm",
      media_sample_rate_hertz: 16000,

      input_event_stream_handler: @input_stream,
      output_event_stream_handler: @output_stream,
    )
  end

  def finish
    @input_stream.signal_end_stream
  end

  def on_transcript_event(&block)
    output_stream.on_transcript_event_event(&block)
    self
  end
end

class ChimeMessgagingOutput
  CaptionData = Struct.new(:result_id, :is_partial, :transcript)

  def initialize(chime_user_arn:, channel_arn:)
    @chimemessaging = Aws::ChimeSDKMessaging::Client.new(region: 'us-east-1', logger: Logger.new($stdout))
    @chime_user_arn = chime_user_arn
    @channel_arn = channel_arn

    @id_map = {}
    @data_lock = Mutex.new
    @data = {}
  end

  def feed(event)
    @data_lock.synchronize do
      event.transcript.results.each do |result|
        caption = CaptionData.new(result.result_id, result.is_partial, result.alternatives[0]&.transcript)
        @data[result.result_id] = caption if caption.transcript
      end
    end
  end

  def start
    th = Thread.new do
      loop do
        begin
          data = nil
          @data_lock.synchronize do
            data = @data
            @data = {}
          end

          data.each do |k, caption|
            message_id = @id_map[caption.result_id]

            content = {control: {caption: caption.to_h}}.to_json

            if message_id
              p [:update_channel_message, message_id, caption]
              @chimemessaging.update_channel_message(
                chime_bearer: @chime_user_arn,
                channel_arn: @channel_arn,
                message_id: message_id,
                content: content,
              )
            else
              p [:send_channel_message, caption]
              resp = @chimemessaging.send_channel_message(
                chime_bearer: @chime_user_arn,
                channel_arn: @channel_arn,
                content: content,
                type: 'STANDARD',
                persistence: 'PERSISTENT',
              )
              @id_map[caption.result_id] = resp.message_id
            end

            @id_map.delete(caption.result_id) unless caption.is_partial
          end
          # TODO: handle transient error
        end
        sleep 0.7
      end
    end.abort_on_exception = true
  end
end

track_slug = ARGV[0]

chime_user_arn = Conference.data.fetch(:chime).fetch(:app_user_arn)
channel_arn = Conference.data
  .fetch(:tracks)
  .fetch(track_slug)
  .fetch(:chime)
  .fetch(:caption_channel_arn)

p env: Rails.env, chime_user_arn: chime_user_arn, channel_arn: channel_arn

input = StdinInput.new
engine = TranscribeEngine.new
output = ChimeMessgagingOutput.new(chime_user_arn: chime_user_arn, channel_arn: channel_arn)

input.on_data do |chunk|
  p on_audio: chunk.bytesize
  engine.feed(chunk)
end

engine.on_transcript_event do |e|
  output.feed(e)
end
# TODO: graceful restart

begin
  output.start
  call = engine.start
  input.start
  p call.wait.inspect
rescue Interrupt
  engine.finish
end

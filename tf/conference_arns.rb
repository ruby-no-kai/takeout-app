require 'bundler/setup'
require 'jsonnet'
require 'json'

@j = Jsonnet.load(ARGV[0])
@result = {}

def get_chime_app_instance_arn(env)
  @result["#{env}_chime_app_instance_arn"] = @j.fetch(env).dig('chime', 'app_arn')
end
def get_chime_app_user_arn(env)
  @result["#{env}_chime_app_user_arn"] = @j.fetch(env).dig('chime', 'app_user_arn')
end
def get_chime_kiosk_user_arn(env)
  @result["#{env}_chime_kiosk_user_arn"] = @j.fetch(env).dig('chime', 'kiosk_user_arn')
end

def get_chime_track_channel_arns(env)
  @result["#{env}_chime_track_channel_arns"] = @j.fetch(env).fetch('tracks').each_value.map { |t| t.dig('chime', 'channel_arn') }.compact
end
def get_chime_caption_channel_arns(env)
  @result["#{env}_chime_caption_channel_arns"] = @j.fetch(env).fetch('tracks').each_value.map { |t| t.dig('chime', 'caption_channel_arn') }.compact
end
def get_chime_systems_channel_arn(env)
  @result["#{env}_chime_systems_channel_arn"] = @j.fetch(env).dig('chime', 'systems_channel_arn')
end

def get_ivs_channel_arns(env)
  @result["#{env}_ivs_channel_arns"] = @j.fetch(env).fetch('tracks').each_value.flat_map { |t| t.dig('ivs')&.values || []}.compact.map { |_| _.fetch('arn') }
end


@j.each_key do |env|
  get_chime_app_instance_arn(env)
  get_chime_app_user_arn(env)
  get_chime_kiosk_user_arn(env)
  get_chime_track_channel_arns(env)
  get_chime_caption_channel_arns(env)
  get_chime_systems_channel_arn(env)
  get_ivs_channel_arns(env)
end

final = @result.transform_values do |v|
  [*v].sort.join("|#|")
end

puts JSON.generate(final)

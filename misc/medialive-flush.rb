require 'logger'
require 'aws-sdk-medialive'
@ml = Aws::MediaLive::Client.new(logger: Logger.new($stdout))

CHANNEL_ID = {
 a: '2178162',
 b: '4086414',
 interpret: '8137967',
 dev: '1920989',
}

now = Time.now
as = CHANNEL_ID.map do |k,id|
 actions = @ml.describe_schedule(channel_id:id).flat_map(&:schedule_actions).select { |_|  s = _.schedule_action_start_settings&.fixed_mode_schedule_action_start_settings&.time;  s && Time.parse(s) > now }

   actions.map do |x|
     {channel: [k,id], action_name: x.action_name, time: x.schedule_action_start_settings&.fixed_mode_schedule_action_start_settings&.time}
   end
end


as.flatten.each { |_| p _ }
puts "ENTER DELETE"
exit if gets.chomp != "DELETE"

as.each do |actions|
  chid =   actions[0].fetch(:channel)[1]
  pp @ml.batch_update_schedule(
    channel_id: chid,
    deletes: {
      action_names: actions.map {|_| _.fetch(:action_Name) }
    },
  )
end


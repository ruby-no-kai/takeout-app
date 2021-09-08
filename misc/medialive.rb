require 'logger'
require 'aws-sdk-medialive'

def gen_name
  "lo-#$$-#{('%.4f' % (Time.now.to_f-1631070921)).tr(?.,?-)}-#{SecureRandom.hex(7)}"
end

def gen_time(t)
  t.utc.iso8601(3)
end

@ml = Aws::MediaLive::Client.new(logger: Logger.new($stdout))

CHANNEL_ID = '1920989'

target_time = Time.now.round + 18#Time.new(2021, 9, 8, 12, 18, 30)
effect_prefix_sec = 2.7
still_prefix_sec = 2.6


@name = gen_name

pp @ml.batch_update_schedule(
  channel_id: CHANNEL_ID,
  creates: {
    schedule_actions: [
      {
        action_name: "#{@name}_001-eff_a",
        schedule_action_start_settings: {
          fixed_mode_schedule_action_start_settings: {
            time: gen_time(target_time - effect_prefix_sec),
          },
        },
        schedule_action_settings: {
          motion_graphics_image_activate_settings: {
            duration: 10000,
            url: 'https://rk-takeout-app.s3.dualstack.ap-northeast-1.amazonaws.com/tmp/transition/rk2021-transition.html?6',
          },
        },
      },
      {
        action_name: "#{@name}_002-eff_still",
        schedule_action_start_settings: {
          fixed_mode_schedule_action_start_settings: {
            time: gen_time(target_time - effect_prefix_sec + still_prefix_sec),
          },
        },
        schedule_action_settings: {
          static_image_activate_settings: {
            duration: 10000,
            fade_in: 0,
            fade_out: 0,
            width: 1920,
            height: 1080,
            image_x: 0,
            image_y: 0,
            layer: 7,
            opacity: 100,
            image: { uri: 'https://rk-takeout-app.s3.dualstack.ap-northeast-1.amazonaws.com/tmp/transition/rk2021-transition.png?6' },
          },
        },
      },
      {
        action_name: "#{@name}_003-switch",
        schedule_action_start_settings: {
          fixed_mode_schedule_action_start_settings: {
            time: gen_time(target_time),
          },
        },
        schedule_action_settings: {
          input_switch_settings: { input_attachment_name_reference: "takeout-app" },
          #input_switch_settings: {
          #  input_attachment_name_reference: "takeout-mp4",
          #  input_clipping_settings: {
          #    input_timecode_source: "ZEROBASED",
          #    start_timecode: {timecode: "00:00:00;00"}, #HHMMSSFF
          #  },
          #  url_path: ["2021/edited/day1/k0kubun-ja.mp4"],
          #},
        },
      },
      {
        action_name: "#{@name}_004-eff_rmstill",
        schedule_action_start_settings: {
          fixed_mode_schedule_action_start_settings: {
            time: gen_time(target_time + 0.2),
          },
        },
        schedule_action_settings: {
          static_image_deactivate_settings: {
            fade_out: 0,
            layer: 7,
          },
        },
      },
    ],
  },
)


p target_time.iso8601(4)

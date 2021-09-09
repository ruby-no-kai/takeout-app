require 'logger'
require 'aws-sdk-medialive'

def gen_name
  "lo-#$$-#{('%.4f' % (Time.now.to_f-1631070921)).tr(?.,?-)}-#{SecureRandom.hex(7)}"
end

def gen_time(t)
  t.utc.iso8601(3)
end

def activate_motion(tag, t: @target_time - @effect_prefix_sec)
  {
    action_name: "#{@name}_#{tag}",
    schedule_action_start_settings: {
      fixed_mode_schedule_action_start_settings: {
        time: gen_time(t),
      },
    },
    schedule_action_settings: {
      motion_graphics_image_activate_settings: {
        duration: 10000,
        url: 'https://rk-takeout-app.s3.dualstack.ap-northeast-1.amazonaws.com/tmp/transition/rk2021-transition.html?6',
      },
    },
  }
end

def activate_still(tag, t: @target_time - @effect_prefix_sec + @still_prefix_sec)
        {
          action_name: "#{@name}_#{tag}",
          schedule_action_start_settings: {
            fixed_mode_schedule_action_start_settings: {
              time: gen_time(t),
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
        }
end

def switch_mp4(tag, key, t: @target_time)
        {
          action_name: "#{@name}_#{tag}",
          schedule_action_start_settings: {
            fixed_mode_schedule_action_start_settings: {
              time: gen_time(t),
            },
          },
          schedule_action_settings: {
            #input_switch_settings: { input_attachment_name_reference: "takeout-intermission" },
            input_switch_settings: {
              input_attachment_name_reference: "takeout-mp4",
              input_clipping_settings: {
                input_timecode_source: "ZEROBASED",
                start_timecode: {timecode: "00:00:00;00"}, #HHMMSSFF
              },
              url_path: [key],
            },
          },
        }
end

def remove_still(tag, t: @target_time + 0.2)
{
          action_name: "#{@name}_#{tag}",
          schedule_action_start_settings: {
            fixed_mode_schedule_action_start_settings: {
              time: gen_time(t),
            },
          },
          schedule_action_settings: {
            static_image_deactivate_settings: {
              fade_out: 0,
              layer: 7,
            },
          },
        }
end

def switch_live(tag, t: @target_time + @live_cm_size)
        {
          action_name: "#{@name}_#{tag}",
          schedule_action_start_settings: {
            fixed_mode_schedule_action_start_settings: {
              time: gen_time(t),
            },
          },
          schedule_action_settings: {
            input_switch_settings: { input_attachment_name_reference: "takeout-rtmp" },
          },
        }
end

def switch_intermission(tag, t: @target_time)
        {
          action_name: "#{@name}_#{tag}",
          schedule_action_start_settings: {
            fixed_mode_schedule_action_start_settings: {
              time: gen_time(t),
            },
          },
          schedule_action_settings: {
            #input_switch_settings: { input_attachment_name_reference: "takeout-intermission" },
            input_switch_settings: { input_attachment_name_reference: "takeout-rtmp" },
          },
        }
end



def prep_intermission(tag, t: @target_time + 90)

        {
          action_name: "#{@name}_#{tag}",
          schedule_action_start_settings: {
            fixed_mode_schedule_action_start_settings: {
              time: gen_time(t),
            },
          },
          schedule_action_settings: {
            input_prepare_settings: { input_attachment_name_reference: "takeout-rtmp" },
            #input_prepare_settings: { input_attachment_name_reference: "takeout-intermission" },
          },
        }
end

def actions_schedule_live(cm_key)
[
        activate_motion('001-eff_a'),
        activate_still('002-eff_still'),
        switch_mp4('003-switch', cm_key),
        remove_still('004-eff_rmstill'),
        switch_live('005-switchlive'),
        prep_intermission('006-prepinterm'),
      ]
end

def actions_immediate_interm()
  @target_time = Time.now + 20
  [
    activate_motion('001-eff_a'),
    activate_still('002-eff_still'),
    switch_intermission('003-switch'),
    remove_still('004-eff_rmstill'),
  ]
end

def actions_immediate_live()
  @target_time = Time.now + 20
  [
    activate_motion('001-eff_a'),
    activate_still('002-eff_still'),
    switch_live('003-switch', t: @target_time),
    remove_still('004-eff_rmstill'),
  ]
end


def actions_schedule_prerec(key,m,s)
  a = [
    activate_motion('001-eff_a'),
    activate_still('002-eff_still'),
    switch_mp4('003-switch', key),
    remove_still('004-eff_rmstill'),
  ]
  @target_time = @target_time + (60*m) + s
  b =   [
    activate_motion('101-eff_a'),
    activate_still('102-eff_still'),
    switch_intermission('103-switch'),
    remove_still('104-eff_rmstill'),
  ]

  a+b
end

@ml = Aws::MediaLive::Client.new(logger: Logger.new($stdout))

CHANNEL_ID = {
 a: '2178162',
 b: '4086414',
 interpret: '8137967',
 dev: '1920989',
}

@effect_prefix_sec = 3.2
@still_prefix_sec = @effect_prefix_sec - 0.25

@name = gen_name


# @target_time = Time.now + 20

tt = @target_time = Time.new(2021, 9, 9, 16, 5, 0)
@ch_names = %i(a )
@channels = @ch_names.map { |_| CHANNEL_ID.fetch(_) }

#actions = actions_immediate_interm()
#actions = actions_immediate_live()
@live_cm_size = 65
actions = actions_schedule_live('2021/edited/CM/platinum-cm-1.mp4')

#actions = actions_schedule_prerec('2021/edited/day1/vinistock.mp4', 26, 57)
#actions = actions_schedule_prerec('2021/edited/day1/shioimm-en.mp4', 23, 41)
#actions = actions_schedule_prerec('2021/edited/day1/koic-ja.mp4', 28-20, 29+2)

pp actions
$stdin.gets

@channels.each do |chid|
  pp @ml.batch_update_schedule(
    channel_id: chid,
    creates: {
      schedule_actions: actions,
    },
  )
end


p tt.iso8601(4)

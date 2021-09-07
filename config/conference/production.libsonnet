local interpret_ivs = { arn: 'arn:aws:ivs:us-west-2:005216166247:channel/BqJ6JEV7iJUt', url: 'https://73c1ba2ff7fa.us-west-2.playback.live-video.net/api/video/v1/us-west-2.005216166247.channel.BqJ6JEV7iJUt.m3u8' };

{
  default_track: 'a',
  track_order: ['a'],  //, 'b'],
  tracks: {
    a: {
      name: '#rubykaigiA',
      slug: 'a',
      ivs: {
        main: {
          arn: 'arn:aws:ivs:us-west-2:005216166247:channel/VvM44QACk0cP',
          url: 'https://73c1ba2ff7fa.us-west-2.playback.live-video.net/api/video/v1/us-west-2.005216166247.channel.VvM44QACk0cP.m3u8',
        },
        interpretation: interpret_ivs,
      },
      chime: {
        channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/392944572afa3858efaf634bc12b511a01a7d3aa1388aa9ab1508dbc9628e693',
        caption_channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/f785f9f8f243e58d3566b52958534b87ceeeedae11d4b1906e956e375b538ca5',
      },
    },
    // b: {
    //   name: '#rubykaigiB',
    //   slug: 'b',
    //   ivs: {
    //     main: {
    //       arn: 'arn:aws:ivs:us-west-2:005216166247:channel/lxVf1pHuVdbU',
    //       url: 'https://73c1ba2ff7fa.us-west-2.playback.live-video.net/api/video/v1/us-west-2.005216166247.channel.lxVf1pHuVdbU.m3u8',
    //     },
    //     interpretation: interpret_ivs,
    //   },
    //   chime: {
    //     channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/d9542baf3d0c8a6aa3a045ca710f1a301bdbdb82dd456f8f84c7f9166a84db9b',
    //     caption_channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/channel/9b908e352f5e98f9c2992c3fcf02e2fc78faebbda8db39ded97ecd71092191c6',
    //   },
    // },
  },

  chime: {
    app_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395',
    app_user_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/11029a8c-c09e-47c2-aff6-db9515482395/user/app',
  },
  ivs: {
    region: 'us-west-2',
  },
}

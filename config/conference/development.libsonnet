// takeout-dev
local ivs_arn = 'arn:aws:ivs:us-west-2:005216166247:channel/oTssPyKzhjoS';
local ivs_url = 'https://73c1ba2ff7fa.us-west-2.playback.live-video.net/api/video/v1/us-west-2.005216166247.channel.oTssPyKzhjoS.m3u8';

{
  default_track: 'a',
  track_order: ['a', 'b'],
  tracks: {
    a: {
      name: '#rubykaigiA',
      slug: 'a',
      ivs: {
        main: {
          arn: ivs_arn,
          url: ivs_url,
        },
        interpretation: {
          arn: ivs_arn,
          url: ivs_url,
        },
      },
      chime: {
        channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/cf0d6a1f32cc876c68eab23e90399de0da627ed027ab6f2159b0f8087dd7facd',
        caption_channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/9f4c6d3dcf1476c72a947e06aa9c6b5ce99e9ec332ea9bc0baac7091def653b9',
      },
    },
    b: {
      name: '#rubykaigiB',
      slug: 'b',
      ivs: {
        main: {
          arn: ivs_arn,
          url: ivs_url,
        },
      },
      chime: {
        channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/1dee0cf699e51df2910a69398ea41b262a52213a654781c8e386d257a7844f5b',
        caption_channel_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/channel/42f2ba43b257bfcfcc1c20e889b132e22e89531eec86844d1684eac774ce2e7b',
      },
    },
  },

  chime: {
    app_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443',
    app_user_arn: 'arn:aws:chime:us-east-1:005216166247:app-instance/0e09042d-8e87-4b2f-a25b-d71a0e604443/user/app',
  },
  ivs: {
    region: 'us-west-2',
  },
}

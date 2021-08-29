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
        general: {
          arn: ivs_arn,
          url: ivs_url,
        },
        interpretation: {
          arn: ivs_arn,
          url: ivs_url,
        },
      },
    },
    b: {
      name: '#rubykaigiB',
      slug: 'b',
      ivs: {
        general: {
          arn: ivs_arn,
          url: ivs_url,
        },
      },
    },
  },
}

{
  AWSTemplateFormatVersion: '2010-09-09',

  Parameters: {
    ChannelName: { Type: 'String' },
    StreamKey: { Type: 'String' },
    Subnet1Id: { Type: 'String' },
    Subnet2Id: { Type: 'String' },
    RoleArn: { Type: 'String' },
    VpcSgDefaultId: { Type: 'String' },
    VpcSgId: { Type: 'String' },
    MedialiveSgPublicId: { Type: 'String' },
    CaptionerUrl: { Type: 'String' },
    IvsUrl: { Type: 'String' },
    IvsKey: { Type: 'String' },
  },

  Resources: {
    InputPrivate: {
      local name = { 'Fn::Sub': '${ChannelName}-private/${ChannelName}-mi-${StreamKey}' },
      Type: 'AWS::MediaLive::Input',
      Properties: {
        Type: 'RTMP_PUSH',
        Destinations: [
          { StreamName: name },
        ],
        RoleArn: { 'Fn::Sub': '${RoleArn}' },
        Vpc: {
          SecurityGroupIds: [{ 'Fn::Sub': '${VpcSgDefaultId}' }, { 'Fn::Sub': '${VpcSgId}' }],
          SubnetIds: [{ 'Fn::Sub': '${Subnet1Id}' }, { 'Fn::Sub': '${Subnet2Id}' }],
        },
        Tags: {
          Name: { 'Fn::Sub': '${ChannelName}-private' },
          Project: 'takeout-app',
          Component: 'medialive',
        },
      },
    },

    InputPublic: {
      local name = { 'Fn::Sub': '${ChannelName}-public/${ChannelName}-mo-${StreamKey}' },
      Type: 'AWS::MediaLive::Input',
      Properties: {
        Type: 'RTMP_PUSH',
        Destinations: [
          { StreamName: name },
        ],
        InputSecurityGroups: [{ 'Fn::Sub': '${MedialiveSgPublicId}' }],
        Tags: {
          Name: { 'Fn::Sub': '${ChannelName}-public' },
          Project: 'takeout-app',
          Component: 'medialive',
        },
      },
    },

    ChannelEip: {
      Type: 'AWS::EC2::EIP',
      Properties: {
        Domain: 'vpc',
        Tags: [
          { Key: 'Name', Value: { 'Fn::Sub': 'medialive-${ChannelName}' } },
          { Key: 'Project', Value: 'takeout-app' },
          { Key: 'Component', Value: 'medialive' },
        ],
      },
    },

    Channel: {
      Type: 'AWS::MediaLive::Channel',
      Properties: {
        Name: { 'Fn::Sub': '${ChannelName}' },
        ChannelClass: 'SINGLE_PIPELINE',
        RoleArn: { 'Fn::Sub': '${RoleArn}' },
        LogLevel: 'INFO',
        EncoderSettings: {
          VideoDescriptions: [
            {
              Name: 'ivs1v',
              CodecSettings: {
                H264Settings: {
                  AfdSignaling: 'NONE',
                  ColorMetadata: 'INSERT',
                  AdaptiveQuantization: 'HIGH',
                  Bitrate: 5000000,
                  EntropyEncoding: 'CABAC',
                  FlickerAq: 'ENABLED',
                  ForceFieldPictures: 'DISABLED',
                  FramerateControl: 'SPECIFIED',
                  FramerateNumerator: 30000,
                  FramerateDenominator: 1001,
                  GopBReference: 'DISABLED',
                  GopClosedCadence: 1,
                  GopNumBFrames: 3,
                  GopSize: 2,
                  GopSizeUnits: 'SECONDS',
                  SubgopLength: 'FIXED',
                  ScanType: 'PROGRESSIVE',
                  Level: 'H264_LEVEL_AUTO',
                  LookAheadRateControl: 'HIGH',
                  NumRefFrames: 3,
                  ParControl: 'SPECIFIED',
                  ParNumerator: 1,
                  ParDenominator: 1,
                  Profile: 'HIGH',
                  RateControlMode: 'CBR',
                  Syntax: 'DEFAULT',
                  SceneChangeDetect: 'ENABLED',
                  Slices: 4,
                  SpatialAq: 'ENABLED',
                  TemporalAq: 'ENABLED',
                  TimecodeInsertion: 'DISABLED',
                },
              },
              RespondToAfd: 'NONE',
              Sharpness: 50,
              ScalingBehavior: 'DEFAULT',
              Width: 1920,
              Height: 1080,
            },
          ],
          AudioDescriptions: [
            {
              Name: 'ivs1a',
              CodecSettings: {
                AacSettings: {
                  InputType: 'NORMAL',
                  Bitrate: 128000,
                  CodingMode: 'CODING_MODE_2_0',
                  RawFormat: 'NONE',
                  Spec: 'MPEG4',
                  Profile: 'LC',
                  RateControlMode: 'CBR',
                  SampleRate: 48000,
                },
              },
              AudioTypeControl: 'FOLLOW_INPUT',
              LanguageCodeControl: 'FOLLOW_INPUT',
            },
            {
              Name: 'caption1a',
              CodecSettings: {
                AacSettings: {
                  InputType: 'NORMAL',
                  Bitrate: 128000,
                  CodingMode: 'CODING_MODE_1_0',
                  RawFormat: 'NONE',
                  Spec: 'MPEG4',
                  Profile: 'LC',
                  RateControlMode: 'CBR',
                  SampleRate: 48000,
                },
              },
              AudioTypeControl: 'FOLLOW_INPUT',
              LanguageCodeControl: 'FOLLOW_INPUT',
            },
          ],
          OutputGroups: [
            {
              Name: 'ivs',
              OutputGroupSettings: {
                RtmpGroupSettings: {
                  InputLossAction: 'PAUSE_OUTPUT',
                },
              },
              Outputs: [
                {
                  OutputName: 'ivs1',
                  OutputSettings: {
                    RtmpOutputSettings: {
                      Destination: { DestinationRefId: 'ivs1' },
                      ConnectionRetryInterval: 2,
                      NumRetries: 10,
                      CertificateMode: 'VERIFY_AUTHENTICITY',
                    },
                  },
                  VideoDescriptionName: 'ivs1v',
                  AudioDescriptionNames: ['ivs1a'],
                },
              ],
            },
            {
              Name: 'captioner',
              OutputGroupSettings: {
                UdpGroupSettings: {
                  InputLossAction: 'EMIT_PROGRAM',
                  //timedMetadataId3Period: 10,
                  //timedMetadataId3Frame: 'PRIV',
                },
              },
              Outputs: [
                {
                  OutputName: 'caption1',
                  OutputSettings: {
                    UdpOutputSettings: {
                      Destination: { DestinationRefId: 'captioner1' },
                      BufferMsec: 1000,
                      ContainerSettings: {
                        M2tsSettings: {
                          //CcDescriptor: 'DISABLED',
                          //ebif: 'NONE',
                          //nielsenId3Behavior: 'NO_PASSTHROUGH',
                          //programNum: 1,
                          //patInterval: 100,
                          //pmtInterval: 100,
                          //pcrControl: 'PCR_EVERY_PES_PACKET',
                          //pcrPeriod: 40,
                          //timedMetadataBehavior: 'NO_PASSTHROUGH',
                          //bufferModel: 'MULTIPLEX',
                          //rateMode: 'CBR',
                          //audioBufferModel: 'ATSC',
                          //audioStreamType: 'DVB',
                          //audioFramesPerPes: 2,
                          //segmentationStyle: 'MAINTAIN_CADENCE',
                          //segmentationMarkers: 'NONE',
                          //ebpPlacement: 'VIDEO_AND_AUDIO_PIDS',
                          //ebpAudioInterval: 'VIDEO_INTERVAL',
                          //esRateInPes: 'EXCLUDE',
                          //arib: 'DISABLED',
                          //aribCaptionsPidControl: 'AUTO',
                          //absentInputAudioBehavior: 'ENCODE_SILENCE',
                          //pmtPid: '480',
                          //videoPid: '481',
                          //audioPids: '482-498',
                          //dvbTeletextPid: '499',
                          //dvbSubPids: '460-479',
                          //scte27Pids: '450-459',
                          //scte35Pid: '500',
                          //scte35Control: 'NONE',
                          //klv: 'NONE',
                          //klvDataPids: '501',
                          //timedMetadataPid: '502',
                          //etvPlatformPid: '504',
                          //etvSignalPid: '505',
                          //aribCaptionsPid: '507',
                        },
                      },
                    },
                  },
                  AudioDescriptionNames: ['caption1a'],
                },
              ],
            },
          ],
          TimecodeConfig: {
            Source: 'EMBEDDED',
          },
        },
        local inputAttachmentInputSettings = {
          SourceEndBehavior: 'CONTINUE',
          InputFilter: 'AUTO',
          FilterStrength: 1,
          DeblockFilter: 'DISABLED',
          DenoiseFilter: 'DISABLED',
        },
        InputAttachments: [
          {
            InputAttachmentName: { 'Fn::Sub': '${ChannelName}-private' },
            InputId: { Ref: 'InputPrivate' },
            InputSettings: inputAttachmentInputSettings,
          },
          {
            InputAttachmentName: { 'Fn::Sub': '${ChannelName}-public' },
            InputId: { Ref: 'InputPublic' },
            InputSettings: inputAttachmentInputSettings,
          },
        ],
        InputSpecification: {
          Codec: 'AVC',
          Resolution: 'HD',
          MaximumBitrate: 'MAX_20_MBPS',
        },
        Destinations: [
          {
            Id: 'ivs1',
            Settings: [
              {
                Url: { 'Fn::Sub': '${IvsUrl}' },
                StreamName: { 'Fn::Sub': '${IvsKey}' },
              },
            ],
          },
          {
            Id: 'captioner1',
            Settings: [
              {
                Url: { 'Fn::Sub': '${CaptionerUrl}' },
              },
            ],
          },
        ],
        Vpc: {
          SecurityGroupIds: [{ 'Fn::Sub': '${VpcSgId}' }],
          SubnetIds: [{ 'Fn::Sub': '${Subnet1Id}' }],
          PublicAddressAllocationIds: [{ 'Fn::GetAtt': ['ChannelEip', 'AllocationId'] }],
        },
        Tags: {
          Name: { 'Fn::Sub': '${ChannelName}' },
          Project: 'takeout-app',
          Component: 'medialive',
        },
      },
    },

  },
}

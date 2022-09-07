import React from "react";
import dayjs from "dayjs";

import videojs from "video.js";
import { VideoJSEvents as VideoJSIVSEvents, VideoJSIVSTech, VideoJSQualityPlugin } from "amazon-ivs-player";
import "./videojs";

import { AspectRatio, Box, Center, VStack, Skeleton, Image, Heading } from "@chakra-ui/react";

import { Api, IvsMetadata, Track, TrackStreamOptions, consumeIvsMetadata } from "./Api";
import { Colors } from "./theme";

export type Props = {
  track: Track;
  streamOptions: Pick<TrackStreamOptions, "interpretation">;
  ignoreStreamPresence?: boolean;
  ignoreTrackInterpretation?: boolean;
};

export const TrackVideo: React.FC<Props> = ({
  track,
  streamOptions,
  ignoreStreamPresence,
  ignoreTrackInterpretation,
}) => {
  const [streamTokenNotExpired, setStreamTokenNotExpired] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const streamKind = determineStreamKind(track, streamOptions.interpretation, ignoreTrackInterpretation === true);
  const streamPresence = track.presences[streamKind];

  // TODO: handle error
  const { data: streamInfo, mutate: streamMutate } = Api.useStream(track.slug, streamKind === "interpretation");

  React.useEffect(() => {
    const now = dayjs().unix() + 180;
    if (streamInfo?.stream && streamInfo.stream.expiry <= now) {
      setStreamTokenNotExpired(false);
      console.log("TrackVideo: request streamData renew");

      const timer = setInterval(() => {
        console.log("Requesting streamData due to expiration");
        streamMutate();
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setStreamTokenNotExpired(true);
    }
  }, [track.slug, streamKind, streamInfo?.stream?.expiry]);

  if (!streamPresence?.online && ignoreStreamPresence !== true) {
    return <TrackOfflineView />;
  }

  if (streamInfo && !streamInfo.stream) {
    return <TrackOfflineView />;
  }

  if (streamInfo?.stream && streamTokenNotExpired) {
    if (!streamInfo) throw "wut";
    return (
      <StreamView
        key={`${streamInfo.stream.slug}/${streamInfo.stream.type}`}
        playbackUrl={streamInfo.stream.url}
        shouldStartPlayback={isPlaying}
        onPlayOrStop={setIsPlaying}
      />
    );
  } else {
    return (
      <AspectRatio ratio={16 / 9}>
        <Skeleton h="100%" w="100%" />
      </AspectRatio>
    );
  }
};

export type StreamViewProps = {
  playbackUrl: string;
  shouldStartPlayback: boolean;
  onPlayOrStop: (playing: boolean) => void;
};

export type StreamPlaybackSession = {
  url: string;
  player: videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;
  root: HTMLDivElement;
};

const StreamView: React.FC<StreamViewProps> = ({ playbackUrl, shouldStartPlayback, onPlayOrStop }) => {
  const [_session, setSession] = React.useState<StreamPlaybackSession | null>(null);
  const elem = React.useRef<HTMLDivElement>(null);

  const volumeStorageKey = "rk-takeout-app--DefaultVolume";
  const { volume: defaultVolume, muted: defaultMuted } = ((): { volume: number; muted: boolean } => {
    try {
      return JSON.parse(window.localStorage?.getItem(volumeStorageKey) || '{"volume": 0.5, "muted": false}');
    } catch (e) {
      console.warn(e);
      return { volume: 0.5, muted: false };
    }
  })();

  React.useEffect(() => {
    if (!elem.current) return; // TODO: これほんとにだいじょうぶ?? でも elem.current を dep にいれると2回 useEffect 発火するんだよな
    console.log("StreamView: initializing", playbackUrl, elem.current);

    const root = document.createElement("div");
    root.dataset.vjsPlayer = "true";
    const video = document.createElement("video");
    video.playsInline = true;
    video.classList.add("video-js");

    root.appendChild(video);
    elem.current.appendChild(root);

    const player = videojs(
      video,
      {
        techOrder: ["AmazonIVS"],
        autoplay: shouldStartPlayback,
        controls: true,
        fill: true,
      },
      () => {
        console.log("player is ready");
      },
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    player.enableIVSQualityPlugin();
    player.src(playbackUrl);

    player.volume(defaultVolume);
    player.muted(!!defaultMuted);

    player.on("play", () => {
      onPlayOrStop(true);
    });
    player.on("pause", () => {
      onPlayOrStop(false);
    });

    player.on("volumechange", () => {
      const volume = player.volume();
      const muted = player.muted();
      try {
        window.localStorage?.setItem(volumeStorageKey, JSON.stringify({ volume, muted }));
      } catch (e) {
        console.warn(e);
      }
    });

    const events: VideoJSIVSEvents = player.getIVSEvents();
    const ivsPlayer = player.getIVSPlayer();

    ivsPlayer.addEventListener(events.PlayerEventType.TEXT_METADATA_CUE, (cue) => {
      const payload: IvsMetadata = JSON.parse(cue.text);
      console.log("Incoming IVS Metadata", payload);
      try {
        consumeIvsMetadata(payload);
      } catch (e) {
        console.error("IVS metadata error", e);
      }
    });

    ivsPlayer.addEventListener(events.PlayerState.PLAYING, () => {
      console.log("IVS Player is playing");
    });

    setSession({
      url: playbackUrl,
      player,
      root,
    });

    return () => {
      console.log("StreamView: dispose", playbackUrl);
      player.dispose();
      root.remove();
    };
  }, [playbackUrl]);

  return (
    <AspectRatio ratio={16 / 9}>
      <Box h="100%" ref={elem} />
    </AspectRatio>
  );
};

const TrackOfflineView: React.FC = () => {
  return (
    <AspectRatio ratio={16 / 9}>
      <Center w="100%" h="100%">
        <VStack>
          <Box w="95px" h="95px" css={{ filter: "grayscale(1)" }}>
            <Image src="/assets/ninja_blue.svg" w="100%" h="100%" alt="" />
          </Box>
          <Heading as="div" color={Colors.textMuted}>
            Offline...
          </Heading>
        </VStack>
      </Center>
    </AspectRatio>
  );
};

function determineStreamKind(
  track: Track,
  userPreference: boolean,
  ignoreTrackInterpretation: boolean,
): "main" | "interpretation" {
  if (ignoreTrackInterpretation && userPreference) {
    return "interpretation";
  }
  // When user doesn't prefer intepret
  if (!userPreference) {
    return "main";
  }

  // Track doesn't have an interpretation stream
  if (!track.interpretation) {
    return "main";
  }

  // TrackVideo don't care current program provides interpretation (track.card.interpretation)
  // (as long as it is online, connect to interpretation stream for a stability)

  // if interpretation is offline
  const presence = track.presences["interpretation"];
  if (!presence?.online) {
    return "main";
  }

  return "interpretation";
}

export default TrackVideo;

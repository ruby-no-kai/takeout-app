import React from "react";
import dayjs from "dayjs";

import videojs from "video.js";
import { VideoJSEvents as VideoJSIVSEvents, VideoJSIVSTech, VideoJSQualityPlugin } from "amazon-ivs-player";
import "./videojs";

import { AspectRatio, Box, Center, VStack, Skeleton, Image, Heading } from "@chakra-ui/react";

import { Api, IvsMetadata, Track, TrackStreamOptions, consumeIvsMetadata } from "./Api";
import { Colors } from "./theme";

export interface Props {
  track: Track;
  streamOptions: TrackStreamOptions;
}

export const TrackVideo: React.FC<Props> = ({ track, streamOptions }) => {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const streamKind = determineStreamKind(track, streamOptions.interpretation);
  const streamPresence = track.presences[streamKind];

  // TODO: handle error
  const { data: streamInfo, mutate: streamMutate } = Api.useStream(track.slug, streamKind === "interpretation");

  const now = dayjs().unix() + 180;
  const streamInfoReady = streamInfo && now < streamInfo.stream.expiry;

  React.useEffect(() => {
    if (streamInfo && streamInfo.stream.expiry <= now) {
      console.log("TrackVideo: request streamData renew");
      streamMutate();
    }
  }, [track.slug, now, streamKind, streamInfo?.stream?.expiry]);

  console.log("TrackVideo: render", {
    track: track.slug,
    interpretationPreference: streamOptions.interpretation,
    streamKind,
  });

  if (!streamPresence) {
    return <TrackOfflineView />;
  }

  if (streamInfoReady) {
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

export interface StreamViewProps {
  playbackUrl: string;
  shouldStartPlayback: boolean;
  onPlayOrStop: (playing: boolean) => void;
}

export interface StreamPlaybackSession {
  url: string;
  player: videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;
  root: HTMLDivElement;
}

const StreamView: React.FC<StreamViewProps> = ({ playbackUrl, shouldStartPlayback, onPlayOrStop }) => {
  const [_session, setSession] = React.useState<StreamPlaybackSession | null>(null);
  const elem = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!elem.current) return; // TODO: これほんとにだいじょうぶ?? でも elem.current を dep にいれると2回 useEffect 発火するんだよな
    console.log("StreamView: initializing", playbackUrl, elem.current);

    const root = document.createElement("div");
    root.dataset.vjsPlayer = "true";
    const video = document.createElement("video");
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

    player.on("play", () => {
      onPlayOrStop(true);
    });
    player.on("pause", () => {
      onPlayOrStop(false);
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
      <Box w="100%" h="100%" ref={elem} />
    </AspectRatio>
  );
};

const TrackOfflineView: React.FC = () => {
  return (
    <AspectRatio ratio={16 / 9}>
      <Center w="100%" h="100%">
        <VStack>
          <Box h="30%" maxW="300px" w="30%" css={{ filter: "grayscale(1)" }}>
            <picture>
              <source type="image/webp" srcSet="/assets/hero_hamburger.webp" />
              <Image src="/assets/hero_hamburger.svg" w="100%" />
            </picture>
          </Box>
          <Heading as="div" color={Colors.textMuted}>
            Offline...
          </Heading>
        </VStack>
      </Center>
    </AspectRatio>
  );
};

function determineStreamKind(track: Track, userPreference: boolean): "main" | "interpretation" {
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
  if (!track.presences["interpretation"]) {
    return "main";
  }

  return "interpretation";
}

export default TrackVideo;

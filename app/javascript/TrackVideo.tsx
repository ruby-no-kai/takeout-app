import React from "react";
import dayjs from "dayjs";

import videojs from "video.js";
import { VideoJSEvents as VideoJSIVSEvents, VideoJSIVSTech, VideoJSQualityPlugin } from "amazon-ivs-player";
import "./videojs";

import { AspectRatio, Box } from "@chakra-ui/react";

import { Api, IvsMetadata, Track, TrackStreamOptions, consumeIvsMetadata } from "./Api";

export interface Props {
  track: Track;
  streamOptions: TrackStreamOptions;
}

export const TrackVideo: React.FC<Props> = ({ track, streamOptions }) => {
  // TODO: handle error
  const { data: streamInfo } = Api.useStream(track.slug, streamOptions.interpretation && track.interpretation);

  const now = dayjs().unix() + 180;
  const streamInfoReady = streamInfo && now < streamInfo.stream.expiry;

  if (streamInfoReady) {
    if (!streamInfo) throw "wut";
    return (
      <StreamView key={`${streamInfo.stream.slug}/${streamInfo.stream.type}`} playbackUrl={streamInfo.stream.url} />
    );
  } else {
    // TODO: placeholder
    return <p>Loading</p>;
  }
};

export interface StreamViewProps {
  playbackUrl: string;
}

export interface StreamPlaybackSession {
  url: string;
  player: videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;
  root: HTMLDivElement;
}

const StreamView: React.FC<StreamViewProps> = ({ playbackUrl }) => {
  const [_session, setSession] = React.useState<StreamPlaybackSession | null>(null);
  const elem = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!elem.current) return; // TODO: これほんとにだいじょうぶ?? でも elem.current を dep にいれると2回 useEffect 発火するんだよな
    console.log("useEffect", playbackUrl, elem.current);

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
        autoplay: true,
        controls: true,
        fill: true,
      },
      () => {
        console.log("player is ready");
      },
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    player.enableIVSQualityPlugin();
    player.src(playbackUrl);

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

    console.log("useEffect2", playbackUrl, elem.current);

    return () => {
      console.log("dispose...");
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

import React from "react";
import dayjs from "dayjs";

import videojs from "video.js";
import { VideoJSIVSTech, VideoJSQualityPlugin } from "amazon-ivs-player";
import "./videojs";

import { Box } from "@chakra-ui/react";

import { Api, Track, TrackStreamOptions } from "./Api";

export interface Props {
  track: Track;
  streamOptions: TrackStreamOptions;
}

export const TrackVideo: React.FC<Props> = ({ track, streamOptions }) => {
  const { data: streamInfo } = Api.useStream(
    track.slug,
    streamOptions.interpretation && track.interpretation
  );

  const now = dayjs().unix() + 180;
  const streamInfoReady = streamInfo && now < streamInfo.stream.expiry;

  if (streamInfoReady) {
    if (!streamInfo) throw "wut";
    return (
      <StreamView
        key={`${streamInfo.stream.slug}/${streamInfo.stream.type}`}
        playbackUrl={streamInfo.stream.url}
      />
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
  const [session, setSession] = React.useState<StreamPlaybackSession | null>(
    null
  );
  const elem = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!elem.current) return; // TODO: これほんとにだいじょうぶ?? でも elem.current を dep にいれると2回 useEffect 発火するんだよな
    console.log("useEffect", playbackUrl, elem.current);

    const root = document.createElement("div");
    const vjsdiv = document.createElement("div");
    vjsdiv.dataset.vjsPlayer = "true";
    const video = document.createElement("video");

    vjsdiv.appendChild(video);
    root.appendChild(vjsdiv);
    elem.current.appendChild(root);

    const newPlayer = videojs(
      video,
      {
        techOrder: ["AmazonIVS"],
        autoplay: true,
      },
      () => {
        console.log("player is ready");
        newPlayer.src(playbackUrl);
      }
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    newPlayer.enableIVSQualityPlugin();

    /*const events: VideoJSEvents = player.getIVSEvents();
    const ivsPlayer = player.getIVSPlayer();
    ivsPlayer.addEventListener(events.PlayerState.PLAYING, () => { console.log('IVS Player is playing') })*/

    setSession({
      player: newPlayer,
      url: playbackUrl,
      root,
    });
    console.log("useEffect2", playbackUrl, elem.current);

    return () => {
      console.log("dispose...");
      newPlayer.dispose();
      root.remove();
    };
  }, [playbackUrl]);

  return <Box ref={elem} />;
};

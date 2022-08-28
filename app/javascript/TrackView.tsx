import React from "react";
import loadable, { lazy } from "@loadable/component";

import { Flex, Box, Container } from "@chakra-ui/react";
import { AspectRatio, Skeleton, HStack } from "@chakra-ui/react";

import { Track, TrackStreamOptionsState } from "./Api";

import TrackCardView from "./TrackCardView";

const TrackStreamOptionsSelector = loadable(() => import(/* webpackPrefetch: true */ "./TrackStreamOptionsSelector"));
const TrackVideo = lazy(() => import(/* webpackPrefetch: true */ "./TrackVideo"));
const TrackChat = lazy(() => import(/* webpackPrefetch: true */ "./TrackChat"));
const TrackCaption = lazy(() => import("./TrackCaption"));
const TrackViewerCount = loadable(() => import(/* webpackPrefetch: true */ "./TrackViewerCount"));

const AppVersionAlert = loadable(() => import("./AppVersionAlert"));

export type Props = {
  track: Track;
  streamOptionsState: TrackStreamOptionsState;
}

export const TrackView: React.FC<Props> = ({ track, streamOptionsState }) => {
  const [streamOptions, setStreamOptions] = streamOptionsState;
  const trackOptionsSelector = (instance: string) => (
    <TrackStreamOptionsSelector track={track} streamOptionsState={streamOptionsState} instance={instance} />
  );

  // Preload candidate speaker images
  React.useEffect(() => {
    if (!track.card_candidate) return;
    if (!track.card_candidate.speakers) return;

    track.card_candidate.speakers.forEach((s) => {
      const i = new Image();
      i.onload = () => console.log("Preloaded", s.avatar_url);
      i.src = s.avatar_url;
    });
  }, [track.card_candidate]);

  // TODO: Chakra 側のブレークポイントの調整
  // TODO: hide chat button
  return (
    <Container maxW={["auto", "auto", "auto", "1700px"]} px="15px" py="22px">
      <Flex alignItems="top" justifyContent="space-between" direction={["column", "column", "column", "row"]}>
        <Box w="100%">
          <React.Suspense
            fallback={
              <AspectRatio ratio={16 / 9}>
                <Skeleton w="100%" h="100%" />
              </AspectRatio>
            }
          >
            <TrackVideo track={track} streamOptions={streamOptionsState[0]} />
          </React.Suspense>
          {streamOptions.caption ? (
            <React.Suspense fallback={<Skeleton w="100%" h="80px" />}>
              <TrackCaption
                track={track}
                onUnsubscribe={() => {
                  setStreamOptions({ ...streamOptions, caption: false });
                }}
              />
            </React.Suspense>
          ) : null}

          <Box display={["flex", "flex", "none", "none"]} justifyContent="end" my={2}>
            <Box w="150px">{trackOptionsSelector("1")}</Box>
          </Box>
        </Box>

        {streamOptions.chat && track.chat ? (
          <Box
            maxW={["auto", "auto", "auto", "400px"]}
            h={["480px", "480px", "480px", "auto"]}
            w="100%"
            ml={["0", "0", "0", "30px"]}
          >
            <React.Suspense fallback={<Skeleton w="100%" h="100%" />}>
              <TrackChat track={track} />
            </React.Suspense>
          </Box>
        ) : null}
      </Flex>

      <Flex alignItems="top" justifyContent="space-between" direction={["column", "column", "column", "row"]} mt="12px">
        <Box w="100%">
          <TrackCardView
            card={track.card}
            nav={
              <HStack alignItems="flex-start" spacing="20px">
                {track.viewerCount ? <TrackViewerCount count={track.viewerCount} /> : null}
                <Box display={["none", "none", "block", "block"]}>{trackOptionsSelector("2")}</Box>
              </HStack>
            }
          />
        </Box>
        <Box maxW={["auto", "auto", "auto", "400px"]} w="100%" ml="30px">
          <AppVersionAlert />
        </Box>
      </Flex>
    </Container>
  );
};

export default TrackView;

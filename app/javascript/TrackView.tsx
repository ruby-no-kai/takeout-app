import React from "react";
import loadable, { lazy } from "@loadable/component";

import { Flex, Box, Container } from "@chakra-ui/react";
import { AspectRatio, Skeleton } from "@chakra-ui/react";

import { Track, TrackStreamOptionsState } from "./Api";

const TrackStreamOptionsSelector = loadable(() => import("./TrackStreamOptionsSelector"));
const TrackCardView = lazy(() => import("./TrackCardView"));
const TrackVideo = lazy(() => import("./TrackVideo"));
const TrackChat = lazy(() => import("./TrackChat"));
const TrackCaption = lazy(() => import("./TrackCaption"));

export interface Props {
  track: Track;
  streamOptionsState: TrackStreamOptionsState;
}

export const TrackView: React.FC<Props> = ({ track, streamOptionsState }) => {
  const [streamOptions, setStreamOptions] = streamOptionsState;
  const trackOptionsSelector = <TrackStreamOptionsSelector track={track} streamOptionsState={streamOptionsState} />;

  // TODO: Chakra 側のブレークポイントの調整
  // TODO: hide chat button
  return (
    <>
      <Container maxW={["auto", "auto", "auto", "1700px"]}>
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
          </Box>

          {streamOptions.chat && track.chat ? (
            <Box maxW={["auto", "auto", "auto", "400px"]} minH="400px" w="100%" ml={3}>
              <React.Suspense fallback={<Skeleton w="100%" h="100%" />}>
                <TrackChat track={track} />
              </React.Suspense>
            </Box>
          ) : null}
        </Flex>

        <Flex alignItems="top" justifyContent="space-between" direction={["column", "column", "column", "row"]}>
          <Box w="100%">
            <React.Suspense fallback={<Skeleton w="100%" h="20px" />}>
              <TrackCardView card={track.card} nav={trackOptionsSelector} />
            </React.Suspense>
          </Box>
          <Box maxW={["auto", "auto", "auto", "400px"]} w="100%" ml={3} />
        </Flex>
      </Container>
    </>
  );
};

export default TrackView;

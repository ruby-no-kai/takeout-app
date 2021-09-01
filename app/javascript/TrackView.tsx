import React from "react";
import loadable from "@loadable/component";

import { Flex, Box, Container } from "@chakra-ui/react";

import { Track, TrackStreamOptionsState } from "./Api";

import { TrackStreamOptionsSelector } from "./TrackStreamOptionsSelector";
import { TrackTopic } from "./TrackTopic";
import { TrackSpeaker } from "./TrackSpeaker";
const TrackVideo = loadable(() => import("./TrackVideo"));
const TrackChat = loadable(() => import("./TrackChat"));

export interface Props {
  track: Track;
  streamOptionsState: TrackStreamOptionsState;
}

export const TrackView: React.FC<Props> = ({ track, streamOptionsState }) => {
  const streamOptions = streamOptionsState[0];
  const trackOptionsSelector = <TrackStreamOptionsSelector track={track} streamOptionsState={streamOptionsState} />;

  // TODO: Chakra 側のブレークポイントの調整
  // TODO: hide chat button
  return (
    <>
      <Container maxW={["auto", "auto", "auto", "1700px"]}>
        <Flex alignItems="top" justifyContent="space-between" direction={["column", "column", "column", "row"]}>
          <Box w="100%">
            <TrackVideo track={track} streamOptions={streamOptionsState[0]} />
          </Box>
          {streamOptions.chat && track.chat ? (
            <Box maxW={["auto", "auto", "auto", "400px"]} w="100%">
              <TrackChat track={track} />
            </Box>
          ) : null}
        </Flex>

        {track.card?.topic ? (
          <TrackTopic topic={track.card.topic} topicNav={trackOptionsSelector} />
        ) : (
          <Flex justify="space-between" align="center" w="100%">
            {trackOptionsSelector}
          </Flex>
        )}
        {track.card?.speakers?.map((s) => (
          <TrackSpeaker key={`${s.name}-${s.avatar_url}`} speaker={s} />
        ))}
      </Container>
    </>
  );
};

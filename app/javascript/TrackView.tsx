import React from "react";
import { useParams, useHistory } from "react-router-dom";

import { Flex, Box, Container, Button, Link, Heading, Text } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";

import { Track, TrackStreamOptionsState, Api } from "./Api";
import { ErrorAlert } from "./ErrorAlert";

import { TrackStreamOptionsSelector } from "./TrackStreamOptionsSelector";
import { TrackTopic } from "./TrackTopic";
import { TrackSpeaker } from "./TrackSpeaker";
import { TrackVideo } from "./TrackVideo";
import { TrackChat } from "./TrackChat";

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

        {track.topic ? (
          <TrackTopic topic={track.topic} topicNav={trackOptionsSelector} />
        ) : (
          <Flex justify="space-between" align="center" w="100%">
            {trackOptionsSelector}
          </Flex>
        )}
        {track.speakers?.map((s) => (
          <TrackSpeaker key={`${s.name}-${s.avatar_url}`} speaker={s} />
        ))}
      </Container>
    </>
  );
};

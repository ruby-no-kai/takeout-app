import React from "react";
import { useParams, useHistory } from "react-router-dom";

import {
  Flex,
  Box,
  Container,
  Button,
  Link,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";

import { Track, TrackStreamOptionsState, Api } from "./Api";
import { ErrorAlert } from "./ErrorAlert";

import { TrackStreamOptionsSelector } from "./TrackStreamOptionsSelector";
import { TrackTopic } from "./TrackTopic";
import { TrackSpeaker } from "./TrackSpeaker";
import { TrackVideo } from "./TrackVideo";

export interface Props {
  track: Track;
  streamOptionsState: TrackStreamOptionsState;
}

export const TrackView: React.FC<Props> = ({ track, streamOptionsState }) => {
  const trackOptionsSelector = (
    <TrackStreamOptionsSelector
      track={track}
      streamOptionsState={streamOptionsState}
    />
  );
  return (
    <>
      <TrackVideo slug={track.slug} streamOptions={streamOptionsState[0]} />
      <Container maxW={["auto", "auto", "auto", "1400px"]}>
        {track.topic ? (
          <TrackTopic topic={track.topic} topicNav={trackOptionsSelector} />
        ) : (
          <Flex justify="space-between" align="center" w="100%">
            {trackOptionsSelector}
          </Flex>
        )}
        {track.speaker ? <TrackSpeaker speaker={track.speaker} /> : null}
      </Container>
    </>
  );
};

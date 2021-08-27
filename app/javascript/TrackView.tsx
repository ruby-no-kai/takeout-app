import React from "react";
import { useParams, useHistory } from "react-router-dom";

import { Box, Container, Button, Link, Heading, Text } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";

import { Track, Api } from "./Api";
import { ErrorAlert } from "./ErrorAlert";

import { TrackTopic } from "./TrackTopic";
import { TrackSpeaker } from "./TrackSpeaker";

export interface Props {
  track: Track;
}

export const TrackView: React.FC<Props> = ({ track }) => {
  return (
    <>
      <Container maxW={["auto", "auto", "auto", "1400px"]}>
        <TrackTopic topic={track.topic} />
        <TrackSpeaker speaker={track.speaker} />
      </Container>
    </>
  );
};

import React from "react";
import loadable from "@loadable/component";
import dayjs from "dayjs";

import { Flex, Box } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

import { Api, Track, TrackCard } from "./Api";
import { ControlApi } from "./ControlApi";

const TrackCardView = loadable(() => import("./TrackCardView"));
const ControlTrackCardForm = loadable(() => import("./ControlTrackCardForm"));

export interface Props {
  track: Track;
}

export const ControlTrackCards: React.FC<Props> = ({ track }) => {
  //  const { data: controlConferenceData } = ControlApi.useConference();
  const { data: cardsData } = ControlApi.useTrackCards(track.slug);

  return (
    <Box>
      <Heading>{track.name}</Heading>
      <ControlTrackCardForm track={track} />
      {cardsData?.track_cards.map((card) => (
        <TrackCardBox key={`${track.slug}-${card.at}`} card={card} />
      ))}
    </Box>
  );
};

export const TrackCardBox: React.FC<{ card: TrackCard }> = ({ card }) => {
  return (
    <Box mt={3}>
      <Heading as="h6" size="xs">
        {dayjs.unix(card.at).format()}
      </Heading>
      <TrackCardView card={card} />
    </Box>
  );
};

export default ControlTrackCards;

import React from "react";
import loadable from "@loadable/component";
import dayjs from "dayjs";

import { Flex, Box } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

import { Api, Track, TrackCard } from "./Api";
import { ControlApi, ControlTrackCard } from "./ControlApi";

const TrackCardView = loadable(() => import("./TrackCardView"));
const ControlTrackCardForm = loadable(() => import("./ControlTrackCardForm"));
const ControlTrackCardView = loadable(() => import("./ControlTrackCardView"));

export type Props = {
  track: Track;
};

export const ControlTrackCards: React.FC<Props> = ({ track }) => {
  //  const { data: controlConferenceData } = ControlApi.useConference();
  const { data: cardsData } = ControlApi.useTrackCards(track.slug);

  return (
    <Box>
      <Heading>
        {track.name} ({track.slug})
      </Heading>
      <ControlTrackCardForm track={track} />
      {cardsData?.track_cards.map((card) => (
        <TrackCardBox key={`${track.slug}-${card.at}`} card={card} />
      ))}
    </Box>
  );
};

export const TrackCardBox: React.FC<{ card: ControlTrackCard }> = ({ card }) => {
  return (
    <Box mt={3}>
      <ControlTrackCardView card={card} />
    </Box>
  );
};

export default ControlTrackCards;

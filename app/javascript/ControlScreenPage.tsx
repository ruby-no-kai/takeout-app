import React from "react";
import loadable from "@loadable/component";
import dayjs from "dayjs";

import { Flex, Box } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

import { Api, Track, TrackCard } from "./Api";
import { ControlApi, ControlTrackCard } from "./ControlApi";
import ControlScreenForm from "./ControlScreenForm";

const ControlTrackCardView = loadable(() => import("./ControlTrackCardView"));

export const ControlScreenPage: React.FC = () => {
  //  const { data: controlConferenceData } = ControlApi.useConference();
  const { data: cardsData } = ControlApi.useTrackCards("_screen");

  return (
    <Box>
      <ControlScreenForm />
      <Box>
        {cardsData?.track_cards.map((card) => (
          <ScreenCardBox key={`${card.id}-${card.at}`} card={card} />
        ))}
      </Box>
    </Box>
  );
};

const ScreenCardBox: React.FC<{ card: ControlTrackCard }> = ({ card }) => {
  return (
    <Box mt={3}>
      <ControlTrackCardView card={card} />
    </Box>
  );
};

export default ControlScreenPage;

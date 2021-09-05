import React from "react";
import loadable from "@loadable/component";

import { Flex, Box } from "@chakra-ui/react";

import { TrackCard } from "./Api";

const TrackTopic = loadable(() => import("./TrackTopic"));
const TrackSpeaker = loadable(() => import("./TrackSpeaker"));

export interface Props {
  card: TrackCard | null;
  nav?: JSX.Element;
}

export const TrackCardView: React.FC<Props> = ({ card, nav }) => {
  return (
    <Box>
      <TrackTopic card={card} topicNav={nav} />
      {card?.speakers?.map((s) => (
        <TrackSpeaker key={`${s.name}-${s.avatar_url}`} speaker={s} />
      ))}
    </Box>
  );
};
export default TrackCardView;

import React from "react";
import loadable from "@loadable/component";

import { Box } from "@chakra-ui/react";

import { TrackCard } from "./Api";

const TrackTopic = loadable(() => import("./TrackTopic"));

export type Props = {
  card: TrackCard | null;
  nav?: JSX.Element;
}

export const TrackCardView: React.FC<Props> = ({ card, nav }) => {
  return (
    <Box>
      <TrackTopic card={card} topicNav={nav} />
    </Box>
  );
};
export default TrackCardView;

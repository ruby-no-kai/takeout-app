import React from "react";
import loadable from "@loadable/component";

import { Box, Flex } from "@chakra-ui/react";

import { Api } from "./Api";

import { ControlTrackCards } from "./ControlTrackCards";

export const ControlTrackCardsPage: React.FC = () => {
  const { data } = Api.useConference();
  if (!data) return <p>Loading..</p>;
  return (
    <Box mx="50px">
      <Flex direction="row">
        {data.conference.track_order.map((slug) => (
          <ControlTrackCards key={slug} track={data.conference.tracks[slug]!} />
        ))}
      </Flex>
    </Box>
  );
};
export default ControlTrackCardsPage;

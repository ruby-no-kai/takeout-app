import React from "react";
import loadable from "@loadable/component";

import { Box, Flex } from "@chakra-ui/react";

import { Api } from "./Api";

import { ControlChatSpotlights } from "./ControlChatSpotlights";

export const ControlChatSpotlightsPage: React.FC = () => {
  const { data } = Api.useConference();
  if (!data) return <p>Loading..</p>;
  return (
    <Box mx="50px">
      <Flex direction="row">
        {data.conference.track_order.map((slug) => (
          <Box flex={1} key={slug}>
            <ControlChatSpotlights track={data.conference.tracks[slug]!} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
export default ControlChatSpotlightsPage;

import React from "react";

import { Box, Flex, Heading } from "@chakra-ui/react";

import { Api } from "./Api";
import { ControlStreamPresence } from "./ControlStreamPresence";

export const ControlStreamPresencesPage: React.FC = () => {
  const { data } = Api.useConference();
  if (!data) return <p>Loading..</p>;
  return (
    <Box mx="50px">
      <Flex direction="column">
        {data.conference.track_order.map((slug) => (
          <React.Fragment key={slug}>
            <Heading as="h2">{slug}</Heading>
            <ControlStreamPresence key={slug} track={data.conference.tracks[slug]!} />
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
};
export default ControlStreamPresencesPage;

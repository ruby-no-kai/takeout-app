import React from "react";

import { Box, Flex } from "@chakra-ui/react";

import ControlApi from "./ControlApi";

export const ControlKiosksPage: React.FC = () => {
  const { data } = ControlApi.useKiosks();

  if (!data) return <p>Loading..</p>;

  return (
    <Box mx="50px">
      <Flex direction="row">
        {data.kiosks.map((kiosk) => (
          <Box flex={1} key={kiosk.id}>
            {JSON.stringify(kiosk)}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
export default ControlKiosksPage;

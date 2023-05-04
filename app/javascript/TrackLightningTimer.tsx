import React from "react";

import { Box, Flex } from "@chakra-ui/react";
import { Fonts } from "./theme";
import { type LightningTimerData } from "./LightningTimer";

export const TrackLightningTimer: React.FC<{ timer: LightningTimerData }> = ({ timer }) => {
  return (
    <Flex w="100%" h="100%" direction="column" justify="space-around">
      <Box w="100%" fontSize="90px" lineHeight="90px" textAlign="center" fontFamily={Fonts.heading} fontWeight={700}>
        {timer.m}:{timer.s}
      </Box>
    </Flex>
  );
};

export default TrackLightningTimer;

import React from "react";
import dayjs from "dayjs";

import { Box } from "@chakra-ui/react";
import { Heading } from "@chakra-ui/react";

import { Api, Track } from "./Api";
import { Colors } from "./theme";
import { useLightningTimer } from "./LightningTimer";

export type Props = {
  track: Track;
};

export const ControlLightningTimer: React.FC<Props> = ({ track }) => {
  const { data: latency } = Api.useStreamLatencyMark();
  const timer = useLightningTimer(track?.card?.lightning_timer);

  if (!timer) return <></>;

  return (
    <Box border="1px solid" borderColor={Colors.chatBorder2} backgroundColor="white">
      <Heading as="h4" fontSize="1.1rem">
        Lightning Timer
      </Heading>
      <Box fontSize="5rem" textAlign="center">
        {timer.m}:{timer.s}
      </Box>
      <Box>Latency: {latency?.delta || "-"} ms</Box>
    </Box>
  );
};

export default ControlLightningTimer;

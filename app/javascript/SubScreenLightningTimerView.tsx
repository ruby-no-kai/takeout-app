import React from "react";

import { Track } from "./Api";

import { Box, Flex, Skeleton } from "@chakra-ui/react";
import { useLightningTimer } from "./LightningTimer";
import { Fonts } from "./theme";

export const SubScreenLightningTimerView: React.FC<{ track: Track }> = ({ track }) => {
  const timer = useLightningTimer(track?.card?.lightning_timer, false);

  if (!timer) return <></>;

  return (
    <React.Suspense fallback={<Skeleton w="100%" h="100%" />}>
      <Flex w="100%" h="100%" direction="column" justify="space-around">
        <Box w="100%" fontSize="14vw" lineHeight="14vw" textAlign="center" fontFamily={Fonts.heading} fontWeight={700}>
          {timer.m}:{timer.s}
        </Box>
      </Flex>
    </React.Suspense>
  );
};

import React from "react";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { AspectRatio } from "@chakra-ui/react";

import Api from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";

import { ScreenSponsorRotation } from "./ScreenSponsorRotation";
import { ScreenHeroFiller } from "./ScreenHeroFiller";
import { ScreenAnnounceView } from "./ScreenAnnounceView";

export const IntermissionScreen: React.FC = () => {
  return (
    <Box w="100vw" h="auto" maxW="1920px" maxH="1080px">
      <AspectRatio ratio={16 / 9}>
        <Box bgColor="#D7D165" bgImage="/assets/screen-bg.png" bgSize="contain" w="100%" h="100%" p="2.5vw">
          <IntermissionScreenInner />
        </Box>
      </AspectRatio>
    </Box>
  );
};

export const IntermissionScreenInner: React.FC = () => {
  return (
    <Flex h="100%" w="100%" justify="space-between" direction="row">
      <Box h="100%">
        <ScreenAnnounceView />
      </Box>
      <Box h="100%">
        <ScreenSponsorRotation />
      </Box>
    </Flex>
  );
};

export default IntermissionScreen;

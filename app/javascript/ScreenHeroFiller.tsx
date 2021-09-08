import React from "react";

import { Center, HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { Logo } from "./Logo";

export const ScreenHeroFiller: React.FC = () => {
  return (
    <Box w="100%" h="100%">
      <Center>
        <VStack spacing="3vw">
          <Image src="/assets/hero_hamburger.webp" w="100%" />
          <Logo />
        </VStack>
      </Center>
    </Box>
  );
};

import React from "react";

import { Center, HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { Logo } from "./Logo";

export const ScreenHeroFiller: React.FC = () => {
  return (
    <Center w="100%" h="100%">
      <VStack spacing="3vw" css={{ "& svg": { height: "auto", width: "100%" } }}>
        <Image src="/assets/hero_hamburger.webp" h="30vw" />
        <Logo />
      </VStack>
    </Center>
  );
};

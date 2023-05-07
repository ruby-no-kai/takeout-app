import React from "react";

import { Center, HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { Logo } from "./Logo";
import { CACHE_BUSTER } from "./meta";

export const ScreenHeroFiller: React.FC = () => {
  return (
    <Center w="100%" h="100%">
      <VStack
        spacing="3vw"
        css={{ "& svg": { height: "auto", width: "100%" }, "& img": { height: "auto", width: "100%" } }}
        w="90%"
      >
        <Image src={`/assets/hero.svg?p=${CACHE_BUSTER}`} />
        {/*
        <Image src="/assets/hero_hamburger.webp" h="30vw" />
        <Logo />*/}
      </VStack>
    </Center>
  );
};

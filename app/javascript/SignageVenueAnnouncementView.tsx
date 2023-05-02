import React, { useCallback, useState, useEffect } from "react";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";

import Api, { VenueAnnouncement } from "./Api";
import { Colors } from "./theme";

export const SignageVenueAnnouncementView: React.FC<{ ann: VenueAnnouncement }> = ({ ann }) => {
  return (
    <Flex w="100%" h="100%" direction="column" justify="space-around" color={Colors.textDefault} textAlign="center">
      <Text fontWeight="500" fontSize="3vw" lineHeight="5vw">
        {returnToBr(ann.content)}
      </Text>
    </Flex>
  );
};

// XXX: returnToBr dupe
function returnToBr(text: string) {
  const elems = text
    .split("\n")
    .flatMap((v, i) => [<React.Fragment key={`${i}t`}>{v}</React.Fragment>, <br key={`${i}b`} />]);
  elems.pop();
  return elems;
}

export default SignageVenueAnnouncementView;

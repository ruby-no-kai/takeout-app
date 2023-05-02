import React, { useCallback, useState, useEffect } from "react";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";

import Api, { VenueAnnouncement } from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";
import { QRCodeSVG } from "qrcode.react";

export const SignageVenueAnnouncementView: React.FC<{ ann: VenueAnnouncement }> = ({ ann }) => {
  // XXX: dupe with ScreenAnnounceView Inner
  return (
    <Flex w="45vw" h="100%" direction="column">
      <Box css={{ "& svg": { height: "1.8vw", width: "auto" } }}>
        <Logo />
      </Box>
      <Flex w="100%" h="100%" direction="column" justify="space-between" textAlign="center">
        <Flex w="100%" flexGrow={1} flexShrink={0} flexBasis={0} direction="column" justify="space-around">
          <Text fontWeight="500" fontSize="3vw" lineHeight="5vw">
            {returnToBr(ann.content)}
          </Text>
        </Flex>
        {ann.url ? (
          <Flex h="16vw" direction="row">
            <Box css={{ "& svg": { height: "100%", width: "auto" } }} bgColor="white">
              <QRCodeSVG value={ann.url} level={"M"} includeMargin={true} size={300} />
            </Box>
            <Flex
              textAlign="left"
              h="100%"
              direction="column"
              justify="space-around"
              ml="1vw"
              fontSize="1.5vw"
              lineHeight="2vw"
              textDecoration="underline"
            >
              <Text>{ann.url}</Text>
            </Flex>
          </Flex>
        ) : null}
      </Flex>
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

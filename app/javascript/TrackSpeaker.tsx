import React from "react";

import { Box, Link, Text, Heading } from "@chakra-ui/react";
import { HStack, Flex, AspectRatio, Image } from "@chakra-ui/react";

import { Colors } from "./theme";
import { GitHubIcon } from "./GitHubIcon";
import { TwitterIcon } from "./TwitterIcon";

import { Speaker } from "./Api";

export interface Props {
  speaker: Speaker;
}

export const TrackSpeaker: React.FC<Props> = ({ speaker }) => {
  return (
    <>
      <Flex my="16px" py="8px" h="70px" borderY={`1px solid ${Colors.border}`} alignItems="center">
        <HStack w="100%">
          <AspectRatio ratio={1} w="100%" minW="16px" maxW="36px" mr="12px">
            <Image w="100%" h="100%" alt="" src={speaker.avatar_url} />
          </AspectRatio>
          <Box>
            <Text as="p" fontSize="16px" lineHeight="19px" fontWeight="bold">
              {speaker.name}
            </Text>
            <HStack fontSize="12px" h="20px" lineHeight="20px" mt="3px" color={Colors.secondary}>
              {speaker.github_id ? (
                <HStack mr={1}>
                  <GitHubIcon boxSize="12px" mr="2px" />
                  <Link isExternal href={`https://github.com/${speaker.github_id}`} m={0}>
                    @{speaker.github_id}
                  </Link>
                </HStack>
              ) : null}
              {speaker.twitter_id ? (
                <HStack ml={1}>
                  <TwitterIcon boxSize="12px" mr="2px" />
                  <Link isExternal href={`https://twitter.com/${speaker.twitter_id}`} m={0}>
                    @{speaker.twitter_id}
                  </Link>
                </HStack>
              ) : null}
            </HStack>
          </Box>
        </HStack>
      </Flex>
    </>
  );
};

export default TrackSpeaker;

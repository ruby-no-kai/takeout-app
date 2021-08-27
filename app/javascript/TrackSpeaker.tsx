import React from "react";

import { Box, Container, Button, Link, Heading, Text } from "@chakra-ui/react";
import { Stack, Center, Circle, Image } from "@chakra-ui/react";

import { Speaker } from "./Api";

export interface Props {
  speaker: Speaker;
}

export const TrackSpeaker: React.FC<Props> = ({ speaker }) => {
  return (
    <>
      <Box>
        <Stack direction={["column", "row"]} spacing="24px">
          <Box w="60px" h="60px">
            <Image w="100%" h="100%" alt="" src={speaker.avatar_url} />
          </Box>
          <Box>
            <Heading size="lg">{speaker.name}</Heading>
            <Box>
              {speaker.github_id ? (
                <Link
                  isExternal
                  href={`https://github.com/${speaker.github_id}`}
                >
                  GitHub
                </Link>
              ) : null}
              {speaker.twitter_id ? (
                <Link
                  isExternal
                  href={`https://twitter.com/${speaker.twitter_id}`}
                >
                  Twitter
                </Link>
              ) : null}
            </Box>
          </Box>
        </Stack>
      </Box>
    </>
  );
};

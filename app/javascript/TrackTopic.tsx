import React from "react";

import { Flex, Box, Heading, Text } from "@chakra-ui/react";
import { Tag, HStack } from "@chakra-ui/react";

import type { TrackCard } from "./Api";

import { SpeakerAvatar } from "./SpeakerAvatar";

export interface Props {
  card: TrackCard | null;
  topicNav: JSX.Element | undefined;
}

export const TrackTopic: React.FC<Props> = ({ card, topicNav }) => {
  const topic = card?.topic!;
  if (!topic || !card) {
    return (
      <Flex justify="space-between" align="center" w="100%">
        {topicNav}
      </Flex>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" w="100%">
        <HStack flexGrow={1} flexShrink={0} flexBasis={0}>
          {card.speakers && card.speakers.length > 0 ? (
            <Box w="100%" maxW="64px">
              <SpeakerAvatar speakers={card.speakers} />
            </Box>
          ) : null}
          <Text as="div" lineHeight="29px">
            <Heading as="h2" fontSize="30px" lineHeight="36px">
              {topic.title}
            </Heading>
            <Box mt="2px">
              {topic.labels.map((v, i) => (
                <Tag key={i} variant="solid" colorscheme="gray" size="sm" mr={1}>
                  {v}
                </Tag>
              ))}
            </Box>
          </Text>
        </HStack>
        <Box>{topicNav}</Box>
      </Flex>
      <Text my="11px">{topic.description}</Text>
    </Box>
  );
};

export default TrackTopic;

import React from "react";

import { Flex, Box, Heading, Text, Link } from "@chakra-ui/react";
import { Tag, HStack, VStack } from "@chakra-ui/react";

import type { TrackCard, Speaker } from "./Api";

import { Colors } from "./theme";
import { GitHubIcon } from "./GitHubIcon";
import { TwitterIcon } from "./TwitterIcon";

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
    <VStack spacing="18px">
      <Flex justify="space-between" align="center" w="100%" alignItems="top">
        <HStack flexGrow={1} flexShrink={0} flexBasis={0} alignItems="top" spacing="12px">
          {card.speakers && card.speakers.length > 0 ? (
            <Box w="100%" maxW="64px">
              <SpeakerAvatar speakers={card.speakers} />
            </Box>
          ) : null}
          <Box as="div">
            <Heading as="h2" fontSize="30px" lineHeight="36px" fontWeight="500" mt="-4px">
              {topic.title}
            </Heading>
            <Box mt="2px">
              {topic.labels.map((v, i) => (
                <Tag key={i} variant="solid" colorscheme="gray" size="sm" mr={1}>
                  {v}
                </Tag>
              ))}
            </Box>
            {card.speakers && card.speakers.length > 0 ? (
              <Box>
                {card.speakers.map((s) => (
                  <TrackTopicSpeaker key={s.avatar_url} speaker={s} />
                ))}
              </Box>
            ) : null}
          </Box>
        </HStack>
        <Box>{topicNav}</Box>
      </Flex>
      <Box py="18px" borderTop="1px solid" borderColor={Colors.border} w="100%">
        <Text as="p">{topic.description}</Text>
      </Box>
    </VStack>
  );
};

const TrackTopicSpeaker: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const primaryAlias = speaker.github_id || speaker.twitter_id;
  const primaryLink =
    (speaker.github_id && `https://github.com/${speaker.github_id}`) ||
    (speaker.twitter_id && `https://twitter.com/${speaker.twitter_id}`);
  return (
    <HStack
      as="p"
      spacing={2}
      fontSize="16px"
      fontWeight="400"
      h="20px"
      lineHeight="24px"
      mt="3px"
      color={Colors.secondary}
    >
      <Text as="span">{speaker.name}</Text>
      {primaryAlias && primaryLink ? (
        <Link isExternal href={primaryLink} m={0}>
          @{primaryAlias}
        </Link>
      ) : null}
      {speaker.github_id ? (
        <Link isExternal href={`https://github.com/${speaker.github_id}`} m={0}>
          <GitHubIcon boxSize="16px" />
        </Link>
      ) : null}
      {speaker.twitter_id ? (
        <Link isExternal href={`https://twitter.com/${speaker.twitter_id}`} m={0}>
          <TwitterIcon boxSize="16px" />
        </Link>
      ) : null}
    </HStack>
  );
};

export default TrackTopic;

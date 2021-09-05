import React from "react";

import { Flex, Box, Heading, Text } from "@chakra-ui/react";
import { Tag, HStack } from "@chakra-ui/react";

import { Topic } from "./Api";

export interface Props {
  topic: Topic;
  topicNav: JSX.Element | undefined;
}

export const TrackTopic: React.FC<Props> = ({ topic, topicNav }) => {
  return (
    <Box>
      <Flex justify="space-between" align="center" w="100%">
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
        <Box>{topicNav}</Box>
      </Flex>
      <Text my="11px">{topic.description}</Text>
    </Box>
  );
};

export default TrackTopic;

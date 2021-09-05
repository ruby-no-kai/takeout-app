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
        <Text as="div">
          <Heading as="h2" display="inline">
            {topic.title}
          </Heading>
          <Box display="inline">
            {topic.labels.map((v, i) => (
              <Tag key={i} variant="solid" colorscheme="gray" size="sm" mr={1}>
                {v}
              </Tag>
            ))}
          </Box>
        </Text>
        <Box>{topicNav}</Box>
      </Flex>
      <Text>{topic.description}</Text>
    </Box>
  );
};

export default TrackTopic;

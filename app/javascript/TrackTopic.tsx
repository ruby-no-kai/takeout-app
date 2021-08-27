import React from "react";

import {
  Flex,
  Box,
  Container,
  Button,
  Link,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Tag, HStack, Center, Circle, Image } from "@chakra-ui/react";

import { Topic } from "./Api";

export interface Props {
  topic: Topic;
  topicNav: JSX.Element;
}

export const TrackTopic: React.FC<Props> = ({ topic, topicNav }) => {
  return (
    <>
      <Box>
        <Flex justify="space-between" align="center" w="100%">
          <HStack>
            <Heading as="h2">{topic.title}</Heading>
            <Box>
              <HStack spacing="5px">
                {topic.labels.map((v, i) => (
                  <Tag key={i} variant="solid" colorscheme="gray" size="sm">
                    {v}
                  </Tag>
                ))}
              </HStack>
            </Box>
          </HStack>
          <Box>{topicNav}</Box>
        </Flex>
        <Text>{topic.description}</Text>
      </Box>
    </>
  );
};

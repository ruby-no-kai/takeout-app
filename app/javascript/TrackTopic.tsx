import React from "react";

import { Box, Container, Button, Link, Heading, Text } from "@chakra-ui/react";
import { Tag, HStack, Center, Circle, Image } from "@chakra-ui/react";

import { Topic } from "./Api";

export interface Props {
  topic: Topic;
}

export const TrackTopic: React.FC<Props> = ({ topic }) => {
  return (
    <>
      <Box>
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
        <Text>{topic.description}</Text>
      </Box>
    </>
  );
};

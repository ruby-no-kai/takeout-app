import React from "react";
import dayjs from "dayjs";
import loadable from "@loadable/component";

import { Flex, Box, Tag, HStack, useDisclosure } from "@chakra-ui/react";
import { Heading, Text } from "@chakra-ui/react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

import { Api, ScreenControl, ScreenNextSchedule, Speaker, Topic, Track, TrackCard, UpcomingTopic } from "./Api";
import { Colors } from "./theme";
import { SpeakerAvatar } from "./SpeakerAvatar";

const TrackCardView = loadable(() => import("./TrackCardView"));

// [x] interpretation flag
// [x] topic. speaker name
// [x] TrackCardView preview (topic&speaker in full)
// screen
//   filler
//   upcoming topic
//   basic announcement (heading, next schedule, footer)
// upcoming_topics
//   track, at, topic, speakers
//
// <TrackCardView card={card} />;

export const ControlTrackCardView: React.FC<{ card: TrackCard }> = ({ card }) => {
  return (
    <Box border="1px solid" borderColor={Colors.chatBorder2} backgroundColor="white">
      <Heading as="h6" size="xs">
        {dayjs.unix(card.at).format()}
      </Heading>

      {card.upcoming_topics ? (
        <CardUpcomingTopics topics={card.upcoming_topics} />
      ) : card.screen ? (
        <CardScreen screen={card.screen} />
      ) : null}

      {card.topic ? <CardTopic topic={card.topic} /> : null}
      {card.speakers ? <CardSpeakers speakers={card.speakers} /> : null}
      {card.topic || card.speakers || card.interpretation ? (
        card.interpretation ? (
          <Text>Interpretation: On</Text>
        ) : (
          <Text>Interpretation: Off</Text>
        )
      ) : null}
      {card.topic || card.speakers ? <CardPreview card={card} /> : null}
    </Box>
  );
};

const CardTopic: React.FC<{ topic: Topic }> = ({ topic }) => {
  return (
    <Box w="100%">
      <Heading as="div" fontSize="1.2rem" fontWeight="bold">
        {topic.title}
      </Heading>

      {topic.labels.map((v, i) => (
        <Tag key={i} variant="solid" size="sm" mr={1} css={{ backgroundColor: Colors.textMuted, color: "#ffffff" }}>
          {v}
        </Tag>
      ))}
      <Box textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" w="100%" maxW="400px">
        {topic.description}
      </Box>
    </Box>
  );
};

const CardSpeakers: React.FC<{ speakers: Speaker[] }> = ({ speakers }) => {
  return (
    <HStack>
      <Box w="100%" maxW="48px">
        <SpeakerAvatar speakers={speakers} />
      </Box>
      <Box>{speakers.map((v) => v.name).join(", ")}</Box>
    </HStack>
  );
};

const CardPreview: React.FC<{ card: TrackCard }> = ({ card }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>Show Preview</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TrackCardView card={card} />
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const CardUpcomingTopics: React.FC<{ topics: UpcomingTopic[] }> = ({ topics }) => {
  return (
    <>
      <Text>Screen: Upcoming Topics mode</Text>
      {topics.map((ut, i) => {
        const ts = dayjs.unix(ut.at);
        return (
          <Box key={`${ut.track}-${i}`}>
            <Heading as="div" fontSize="1.2rem" fontWeight="bold">
              {ut.track}
            </Heading>
            <Text>At: {ts.format()}</Text>
            {ut.topic ? <Text>{ut.topic.title}</Text> : null}
            {ut.speakers ? <CardSpeakers speakers={ut.speakers} /> : null}
          </Box>
        );
      })}
    </>
  );
};

const CardScreen: React.FC<{ screen: ScreenControl }> = ({ screen }) => {
  if (screen.filler) {
    return (
      <>
        <Text>Screen: Filler mode</Text>
      </>
    );
  }
  return (
    <>
      <Text>Screen: Announcement mode</Text>
      {screen.heading ? (
        <>
          <Heading as="div" fontSize="1.2rem" fontWeight="bold">
            Heading
          </Heading>
          <Text>{screen.heading}</Text>
        </>
      ) : null}
      {screen.next_schedule
        ? ((schedule) => {
            const ts = dayjs.unix(schedule.at);
            return (
              <>
                <Heading as="div" fontSize="1.2rem" fontWeight="bold">
                  Next Schedule
                </Heading>

                <Text>{schedule.title}</Text>
                <Text>Happens at: {ts.format()}</Text>
                {schedule.absolute_only ? <Text>Relative time turned off;</Text> : null}
              </>
            );
          })(screen.next_schedule)
        : null}
      {screen.footer ? (
        <>
          <Heading as="div" fontSize="1.2rem" fontWeight="bold">
            Footer
          </Heading>
          <Text>{screen.footer}</Text>
        </>
      ) : null}
    </>
  );
};

export default ControlTrackCardView;

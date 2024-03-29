import React, { useState, useCallback } from "react";
import dayjs from "dayjs";
import loadable from "@loadable/component";

import { Flex, Box, Tag, HStack, useDisclosure, IconButton, Tooltip, useToast, Skeleton } from "@chakra-ui/react";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from "@chakra-ui/react";

import { Api, ScreenControl, ScreenNextSchedule, Speaker, Topic, Track, TrackCard, UpcomingTopic } from "./Api";
import { ControlApi, ControlTrackCard } from "./ControlApi";

import { Colors } from "./theme";
import { SpeakerAvatar } from "./SpeakerAvatar";
import { DeleteIcon, CopyIcon } from "@chakra-ui/icons";
import { errorToToast } from "./ErrorAlert";

const ControlTrackCardForm = loadable(() => import("./ControlTrackCardForm")); // XXX: cyclic?
const TrackCardView = loadable(() => import("./TrackCardView"));
const ControlCollerationRemovalPrompt = loadable(() => import("./ControlCollerationRemovalPrompt")); // XXX: cyclic?

export const ControlTrackCardView: React.FC<{ card: ControlTrackCard; isActionable?: boolean }> = ({
  card,
  isActionable,
}) => {
  const isActivated = dayjs().unix() >= card.at;
  return (
    <Box border="1px solid" borderColor={Colors.chatBorder2} backgroundColor="white">
      <Flex justifyContent="space-between" direction="row">
        <Heading as="h6" size="xs">
          {dayjs.unix(card.at).format()}
        </Heading>

        <Box>
          {isActionable !== false && card.id >= 0 ? (
            <>
              {card.id >= 0 && !isActivated ? <CardRemoveAction card={card} /> : null}
              <CardCopyAction card={card} />
            </>
          ) : null}
        </Box>
      </Flex>

      {card.upcoming_topics ? (
        <CardUpcomingTopics topics={card.upcoming_topics} />
      ) : card.screen ? (
        <CardScreen screen={card.screen} />
      ) : null}

      {card.topic ? <CardTopic topic={card.topic} /> : null}
      {card.speakers ? <CardSpeakers speakers={card.speakers} /> : null}
      {card.intermission ? <Text>Intermission: On</Text> : null}
      {card.topic || card.speakers || card.interpretation ? (
        card.interpretation ? (
          <Text>Interpretation: On</Text>
        ) : (
          <Text>Interpretation: Off</Text>
        )
      ) : null}
      {card.topic || card.speakers ? <CardPreview card={card} /> : null}

      <Box>
        {card.control_colleration ? (
          <Tag colorScheme="blue" size="sm">
            {card.control_colleration.description}
          </Tag>
        ) : null}
      </Box>
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

const CardRemoveAction: React.FC<{ card: ControlTrackCard }> = ({ card }) => {
  if (card.control_colleration) {
    return <CardRemoveActionColleration card={card} />;
  } else {
    return <CardRemoveActionSingle card={card} />;
  }
};
const CardRemoveActionColleration: React.FC<{ card: ControlTrackCard }> = ({ card }) => {
  const disclosure = useDisclosure();
  const { onOpen } = disclosure;
  const onRemoveSingle = () => {
    return ControlApi.deleteTrackCard(card);
  };
  return (
    <>
      <IconButton
        background="transparent"
        icon={<DeleteIcon boxSize="14px" />}
        minW="30px"
        w="30px"
        h="30px"
        aria-label="Delete"
        type="submit"
        onClick={onOpen}
      />

      <ControlCollerationRemovalPrompt
        itemType="trackCard"
        item={card}
        disclosure={disclosure}
        onRemoveSingle={onRemoveSingle}
      >
        <ControlTrackCardView isActionable={false} card={card} />
      </ControlCollerationRemovalPrompt>
    </>
  );
};
const CardRemoveActionSingle: React.FC<{ card: ControlTrackCard }> = ({ card }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const toast = useToast();
  const perform = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    ControlApi.deleteTrackCard(card)
      .then(() => {
        setIsRequesting(false);
      })
      .catch((e) => {
        setIsRequesting(false);
        toast(errorToToast(e));
      });
  };
  return (
    <Popover closeOnBlur matchWidth>
      <PopoverTrigger>
        <IconButton
          background="transparent"
          icon={<DeleteIcon boxSize="14px" />}
          minW="30px"
          w="30px"
          h="30px"
          aria-label="Delete"
          type="submit"
        />
      </PopoverTrigger>
      <PopoverContent w="100px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Sure?</PopoverHeader>
        <PopoverBody>
          <Button colorScheme="red" size="sm" onClick={perform} isLoading={isRequesting}>
            Remove
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const CardCopyAction: React.FC<{ card: ControlTrackCard }> = ({ card }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const disclosureProps = useDisclosure({ defaultIsOpen: true });
  // XXX: useCallback is not required anymore (it _was_ required)
  const onOpen = useCallback(() => {
    if (shouldRender) {
      disclosureProps.onOpen();
    } else {
      setShouldRender(true);
    }
  }, [shouldRender]);

  return (
    <>
      <IconButton
        background="transparent"
        icon={<CopyIcon boxSize="14px" />}
        minW="30px"
        w="30px"
        h="30px"
        aria-label="Duplicate"
        onClick={onOpen}
      />
      {shouldRender ? (
        <ControlTrackCardForm initialValue={card} trackSlug={card.track} disclosureProps={disclosureProps} />
      ) : null}
    </>
  );
};

export default ControlTrackCardView;

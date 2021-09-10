import React from "react";
import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";
import type { Dayjs } from "dayjs";
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";

import { Center } from "@chakra-ui/react";

import { Api, ScreenControl, ScreenNextSchedule, UpcomingTopic, Speaker } from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";

import { ScreenHeroFiller } from "./ScreenHeroFiller";

import { SpeakerAvatar } from "./SpeakerAvatar";
import { GitHubIcon } from "./GitHubIcon";
import { TwitterIcon } from "./TwitterIcon";

export const ScreenAnnounceView: React.FC = () => {
  const { data, mutate } = Api.useConference();

  // XXX: i know i can use useSWR refreshInterval
  React.useEffect(() => {
    const interval = setInterval(() => mutate(), 1000);
    return () => clearInterval(interval);
  }, []);

  const card = data?.conference?.tracks?._screen?.card;

  const fillerElem = (
    <Box w="45vw" h="100%" p="4vw">
      <ScreenHeroFiller />
    </Box>
  );

  if (card?.screen?.filler) return fillerElem;
  if (!card) return fillerElem;

  const screen = card.screen ?? {};

  return (
    <Flex w="45vw" h="100%" direction="column">
      <Box css={{ "& svg": { height: "2.5vw", width: "auto" } }}>
        <Logo />
      </Box>
      <Box w="100%" flexGrow={1} flexShrink={0} flexBasis={0}>
        {card?.upcoming_topics ? (
          <AnnounceUpcomingTopics upcoming_topics={card.upcoming_topics} />
        ) : (
          <AnnounceBasic screen={screen} />
        )}
      </Box>
    </Flex>
  );
};

const AnnounceBasic: React.FC<{ screen: ScreenControl }> = ({ screen }) => {
  return (
    <Flex w="100%" h="100%" direction="column" justify="space-around" color={Colors.main} textAlign="center">
      {screen.heading ? (
        <Text fontWeight="700" fontSize="4vw" lineHeight="6vw">
          {returnToBr(screen.heading)}
        </Text>
      ) : null}
      {screen.next_schedule ? <AnnounceNextSchedule schedule={screen.next_schedule} /> : null}
      {screen.footer ? (
        <Text fontWeight="500" fontSize="1.7vw" lineHeight="2vw">
          {returnToBr(screen.footer)}
        </Text>
      ) : null}
    </Flex>
  );
};

function getRelativeTime(t: number) {
  const x = dayjs.unix(t);
  const now = dayjs();
  if (now.isAfter(x)) {
    return "";
  } else {
    return x.from(now);
  }
}

function useRelativeTime(t: number) {
  const [relativeTime, setRelativeTime] = React.useState(getRelativeTime(t));
  React.useEffect(() => {
    setRelativeTime(getRelativeTime(t));
    const interval = setInterval(() => setRelativeTime(getRelativeTime(t)), 1000);
    return () => clearInterval(interval);
  }, [t]);

  return relativeTime;
}

const TIME_ZONES = [
  ["PT", "America/Los_Angeles"],
  ["ET", "America/New_York"],
  ["BST", "Europe/London"],
  ["CET", "Europe/Madrid"],
];

const AnnounceTime: React.FC<{ unix: number }> = ({ unix }) => {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % TIME_ZONES.length;
      setIdx(i);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [tzName, tz] = TIME_ZONES[idx]!;

  const t = dayjs.unix(unix);
  return (
    <VStack>
      <HStack spacing="2vw">
        <AnnounceTimeItem tz={tzName} t={t.tz(tz)} />
        <AnnounceTimeItem tz={"UTC"} t={t.utc()} />
        <AnnounceTimeItem tz={"JST"} t={t.tz("Asia/Tokyo")} />
      </HStack>
    </VStack>
  );
};

const AnnounceTimeItem: React.FC<{ tz: string; t: Dayjs }> = ({ tz, t }) => {
  return (
    <VStack spacing="0.6vw">
      <Text fontWeight="500" fontSize="1.6vw" lineHeight="1.8vw">
        {tz}
      </Text>
      <Text fontWeight="700" fontSize="3.2vw" lineHeight="3.8vw">
        {t.format("HH:mm")}
      </Text>
    </VStack>
  );
};

const AnnounceNextSchedule: React.FC<{ schedule: ScreenNextSchedule }> = ({ schedule }) => {
  const relativeTime = useRelativeTime(schedule.at);
  return (
    <VStack w="100%" spacing="2.6vw">
      <Text fontWeight="500" fontSize="2.3vw" lineHeight="2.8vw">
        {schedule.absolute_only ? (
          schedule.title
        ) : (
          <>
            {schedule.title} {relativeTime}
          </>
        )}
      </Text>

      <AnnounceTime unix={schedule.at} />
    </VStack>
  );
};

const AnnounceUpcomingTopics: React.FC<{ upcoming_topics: UpcomingTopic[] }> = ({ upcoming_topics }) => {
  const earliestStartUnix = Math.min(...upcoming_topics.map((t) => t.at));
  const relativeTime = useRelativeTime(earliestStartUnix);

  return (
    <Flex w="100%" h="100%" direction="column" justify="space-around" color={Colors.main} textAlign="center">
      <VStack w="100%" spacing="2.6vw">
        <Text fontWeight="500" fontSize="2.3vw" lineHeight="2.8vw">
          Next session will start {relativeTime}:
        </Text>

        <AnnounceTime unix={earliestStartUnix} />
      </VStack>

      {upcoming_topics.map((t, i) => (
        <AnnounceUpcomingTopic key={`${i}`} upcoming={t} />
      ))}
    </Flex>
  );
};

const AnnounceUpcomingTopic: React.FC<{ upcoming: UpcomingTopic }> = ({ upcoming }) => {
  const { data: conferenceData } = Api.useConference();
  const { topic, speakers } = upcoming;

  if (!topic) return <></>;
  const track = conferenceData?.conference?.tracks[upcoming.track];
  if (!track) return <></>;

  return (
    <Box textAlign="left">
      <Text fontWeight="500" fontSize="1.8vw" lineHeight="2.3vw" mb="1.1vw">
        {track.name}
      </Text>
      <HStack alignItems="top" spacing="0.7vw" textAlign="left">
        {speakers && speakers.length > 0 ? (
          <Box w="100%" maxW="7vw">
            <SpeakerAvatar speakers={speakers} />
          </Box>
        ) : null}
        <Box as="div">
          <Heading as="h2" fontSize="2.1vw" lineHeight="2.5vw" fontWeight="700">
            {topic.title}
          </Heading>
          {speakers && speakers.length > 0 ? (
            <Box>
              {speakers.map((s) => (
                <ScreenTopicSpeaker key={s.avatar_url} speaker={s} />
              ))}
            </Box>
          ) : null}
        </Box>
      </HStack>
    </Box>
  );
};

const ScreenTopicSpeaker: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const primaryAlias = speaker.github_id || speaker.twitter_id;
  const primaryIcon =
    (speaker.github_id && <GitHubIcon boxSize="1.55vw" m={0} />) ||
    (speaker.twitter_id && <TwitterIcon boxSize="1.55vw" m={0} />);
  return (
    <HStack
      as="p"
      spacing="1vw"
      fontWeight="500"
      fontSize="1.6vw"
      h="20px"
      lineHeight="2vw"
      mt="0.7vw"
      color={Colors.main}
    >
      <Text as="span">{speaker.name}</Text>
      {primaryIcon ? primaryIcon : null}
      {primaryAlias ? (
        <Text as="span" m={0}>
          @{primaryAlias}
        </Text>
      ) : null}
    </HStack>
  );
};

function returnToBr(text: string) {
  const elems = text
    .split("\n")
    .flatMap((v, i) => [<React.Fragment key={`${i}t`}>{v}</React.Fragment>, <br key={`${i}b`} />]);
  elems.pop();
  return elems;
}

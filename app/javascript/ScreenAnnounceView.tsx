import React from "react";
import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";
import type { Dayjs } from "dayjs";
dayjs.extend(relativeTime);

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";

import { Center } from "@chakra-ui/react";

import { Api, ScreenControl, ScreenNextSchedule } from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";

import { ScreenHeroFiller } from "./ScreenHeroFiller";

export const ScreenAnnounceView: React.FC = () => {
  const { data, mutate } = Api.useConference();

  // XXX: i know i can use useSWR refreshInterval
  React.useEffect(() => {
    const interval = setInterval(() => mutate(), 5000);
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
        <AnnounceBasic screen={screen} />
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

const AnnounceNextSchedule: React.FC<{ schedule: ScreenNextSchedule }> = ({ schedule }) => {
  const getRelativeTime = (t: number) => {
    const x = dayjs.unix(t);
    const now = dayjs();
    if (now.isAfter(x)) {
      return "";
    } else {
      return x.from(now);
    }
  };

  const [relativeTime, setRelativeTime] = React.useState(getRelativeTime(schedule.at));
  React.useEffect(() => {
    setRelativeTime(getRelativeTime(schedule.at));
    const interval = setInterval(() => setRelativeTime(getRelativeTime(schedule.at)), 5000);
    return () => clearInterval(interval);
  }, [schedule.at]);

  return (
    <>
      <Text fontWeight="500" fontSize="2.3vw" lineHeight="2.8vw">
        {schedule.absolute_only ? (
          schedule.title
        ) : (
          <>
            {schedule.title} {relativeTime}
          </>
        )}
      </Text>
      <Text fontWeight="500" fontSize=""></Text>
    </>
  );
};

function returnToBr(text: string) {
  const elems = text
    .split("\n")
    .flatMap((v, i) => [<React.Fragment key={`${i}t`}>{v}</React.Fragment>, <br key={`${i}b`} />]);
  elems.pop();
  return elems;
}

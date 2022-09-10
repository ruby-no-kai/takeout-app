import React, { useCallback, useState, useEffect } from "react";

import dayjs from "dayjs";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { AspectRatio } from "@chakra-ui/react";

import Api, { consumeChatAdminControl } from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";

import { ScreenSponsorRotation } from "./ScreenSponsorRotation";
import { ScreenHeroFiller } from "./ScreenHeroFiller";
import { ScreenAnnounceView } from "./ScreenAnnounceView";

import { ChatProvider } from "./ChatProvider";
import { useChat } from "./ChatProvider";
import { ChatUpdate } from "./ChatSession";
import { KioskLogin } from "./KioskLogin";
import { useSearchParams } from "react-router-dom";

export const IntermissionScreen: React.FC = () => {
  return (
    <ChatProvider isKiosk>
      <KioskLogin />
      <Box w="100vw" h="auto">
        <AspectRatio ratio={16 / 9}>
          <Box bgColor={Colors.bg} bgImage="/assets/screen-bg.png" bgSize="contain" w="100%" h="100%" p="2.5vw">
            <IntermissionScreenInner />
          </Box>
        </AspectRatio>
      </Box>
    </ChatProvider>
  );
};

export const IntermissionScreenInner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSignage = (searchParams.get("signage") ?? "").length > 0;
  const chat = useChat();
  const systemsChannel = chat.systems_channel_arn;

  const onMessage = useCallback((update: ChatUpdate) => {
    console.log(update);
    const adminControl = update.message?.adminControl;
    if (adminControl) {
      consumeChatAdminControl(adminControl);
    }
  }, []);

  React.useEffect(() => {
    if (!chat.session) return;
    if (!systemsChannel) return;

    console.log("TrackChat: subscribeMessageUpdate");

    const unsubscribe = chat.session.subscribeMessageUpdate(systemsChannel, onMessage);

    return () => {
      console.log("TrackChat: subscribeMessageUpdate; unsubscribing");
      unsubscribe();
    };
  }, [chat.session, systemsChannel, onMessage]);

  return (
    <Flex h="100%" w="100%" justify="space-between" direction="row">
      <Box h="100%">{isSignage ? <ScreenSignageRotation /> : <ScreenAnnounceView />}</Box>
      <Box h="100%">
        <ScreenSponsorRotation />
      </Box>
    </Flex>
  );
};

const TICK_INTERVAL = 1;
const ROTATE_INTERVAL = 12;
const ScreenSignageRotation: React.FC = () => {
  const [tick, setTick] = useState(dayjs().unix());
  const { data } = Api.useVenueAnnouncements();
  useEffect(() => {
    setTick(dayjs().unix());
    const timer = setInterval(() => {
      setTick(dayjs().unix());
    }, TICK_INTERVAL * 1000);
    return () => clearInterval(timer);
  }, []);
  if (!data) return <></>;

  console.log("useVenueAnnouncements", data);

  const entries = data.venue_announcements.filter((v) => !v.only_subscreen);
  console.log("useVenueAnnouncements/entries", entries);

  const now = tick === -1 ? dayjs().unix() : tick;
  const idx = Math.floor(now / ROTATE_INTERVAL) % (entries.length + 1);
  const ann = idx == 0 ? null : entries[idx - 1];

  console.log("ann", ann);
  return (
    <>
      {ann ? (
        <Flex w="45vw" h="100%" direction="column">
          <Box css={{ "& svg": { height: "2.5vw", width: "auto" } }}>
            <Logo />
          </Box>
          <Box w="100%" flexGrow={1} flexShrink={0} flexBasis={0}>
            <Flex
              w="100%"
              h="100%"
              direction="column"
              justify="space-around"
              color={Colors.textDefault}
              textAlign="center"
            >
              <Text fontWeight="500" fontSize="3vw" lineHeight="5vw">
                {returnToBr(ann.content)}
              </Text>
            </Flex>
          </Box>
        </Flex>
      ) : (
        <ScreenAnnounceView />
      )}
    </>
  );
};

// XXX: returnToBr dupe
function returnToBr(text: string) {
  const elems = text
    .split("\n")
    .flatMap((v, i) => [<React.Fragment key={`${i}t`}>{v}</React.Fragment>, <br key={`${i}b`} />]);
  elems.pop();
  return elems;
}

export default IntermissionScreen;

import React, { useCallback } from "react";

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
      <Box h="100%">
        <ScreenAnnounceView />
      </Box>
      <Box h="100%">
        <ScreenSponsorRotation />
      </Box>
    </Flex>
  );
};

export default IntermissionScreen;

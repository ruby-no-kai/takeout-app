import React, { useCallback } from "react";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { AspectRatio } from "@chakra-ui/react";

import Api, { consumeChatAdminControl, TrackSlug } from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";

import { ChatProvider } from "./ChatProvider";
import { useChat } from "./ChatProvider";
import { ChatUpdate } from "./ChatSession";
import { KioskLogin } from "./KioskLogin";
import { useParams } from "react-router-dom";

import { SubScreenChatView } from "./SubScreenChatView";
import { SubScreenCaptionView } from "./SubScreenCaptionView";

export const SubScreen: React.FC = () => {
  const { slug: trackSlug }: Readonly<Partial<{ slug: TrackSlug }>> = useParams();
  return (
    <ChatProvider isKiosk>
      <KioskLogin />
      <Box w="100vw" h="auto">
        <AspectRatio ratio={16 / 9}>
          <Box bgColor={Colors.bg} bgImage="/assets/screen-bg.png" bgSize="contain" w="100%" h="100%" p="2.5vw">
            <SubScreenInner trackSlug={trackSlug!} />
          </Box>
        </AspectRatio>
      </Box>
    </ChatProvider>
  );
};

export const SubScreenInner: React.FC<{ trackSlug: TrackSlug }> = ({ trackSlug }) => {
  const { data: conferenceData, error: conferenceError, mutate: mutateConferenceData } = Api.useConference();
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

  if (!conferenceData) return <p>Loading</p>;

  if (!conferenceData) return <p>Loading..</p>;
  const track = conferenceData.conference.tracks[trackSlug ?? ""];
  if (!track) return <p>four-oh-four, track not exists</p>;

  return (
    <Flex h="100%" w="100%" justify="space-between" direction="row">
      <Box h="100%" flex={1}>
        <SubScreenChatView track={track} />
      </Box>
      <Box h="100%" flex={1}>
        {<SubScreenCaptionView track={track} />}
      </Box>
    </Flex>
  );
};

export default SubScreen;

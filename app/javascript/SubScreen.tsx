import React, { useCallback } from "react";

import { HStack, VStack, Heading, Flex, Box, Container, Image, Text } from "@chakra-ui/react";
import { AspectRatio } from "@chakra-ui/react";

import Api, { consumeChatAdminControl, TrackSlug } from "./Api";
import { Colors } from "./theme";
import { Logo } from "./Logo";

import { useChat } from "./ChatProvider";
import { ChatUpdate } from "./ChatSession";
import { useParams } from "react-router-dom";

import { SubScreenChatView } from "./SubScreenChatView";
import { SubScreenCaptionView } from "./SubScreenCaptionView";
import { SubScreenAnnouncementsView } from "./SubScreenAnnouncementsView";
import { SubScreenLightningTimerView } from "./SubScreenLightningTimerView";
import { KioskProvider } from "./KioskProvider";

export const SubScreen: React.FC = () => {
  const { slug: trackSlug }: Readonly<Partial<{ slug: TrackSlug }>> = useParams();
  return (
    <KioskProvider>
      <Box w="100vw" h="auto">
        <AspectRatio ratio={16 / 9}>
          <Box bgColor={Colors.bg} bgSize="contain" w="100%" h="100%" p="0.7vw">
            <SubScreenInner trackSlug={trackSlug!} />
          </Box>
        </AspectRatio>
      </Box>
    </KioskProvider>
  );
};

type InfoMode = "announcement" | "lightning_timer" | "caption";

export const SubScreenInner: React.FC<{ trackSlug: TrackSlug }> = ({ trackSlug }) => {
  const { data: conferenceData } = Api.useConference();
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

  const infoMode = ((): InfoMode => {
    if (track.card?.lightning_timer) return "lightning_timer";
    if (track.card?.intermission) return "announcement";
    return "caption";
  })();

  return (
    <Flex h="100%" w="100%" justify="space-between" direction="column">
      <Box w="100%" h="30%" overflow="hidden">
        {infoMode === "announcement" ? <SubScreenAnnouncementsView track={track} /> : null}
        {infoMode === "lightning_timer" ? <SubScreenLightningTimerView track={track} /> : null}
        {infoMode === "caption" ? <SubScreenCaptionView track={track} /> : null}
      </Box>
      <Box w="100%" flexGrow={2}>
        <SubScreenChatView track={track} />
      </Box>
    </Flex>
  );
};

export default SubScreen;

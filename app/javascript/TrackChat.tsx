import React, { useEffect, useMemo, useState } from "react";

import { Box, Flex, Skeleton } from "@chakra-ui/react";

import type { Track, ChatMessage, ChatMessagePin } from "./Api";
import { Api, consumeChatAdminControl } from "./Api";
import { Colors } from "./theme";
import { useChat } from "./ChatProvider";
import { ChatLog } from "./ChatLog";
import type { ChatStatus, ChatUpdate } from "./ChatSession";

import { ChatStatusView } from "./ChatStatusView";
import { ChatHistoryView } from "./ChatHistoryView";
import { ChatForm } from "./ChatForm";
import dayjs from "dayjs";

export type Props = {
  track: Track;

  disableAdminControl?: boolean;
  disableSponsorPromo?: boolean;
  hideForm?: boolean;
};

export type ChatSessionStatusTuple = [ChatStatus | undefined, Error | null | undefined];
type ChatHistoryLoadingStatus =
  | { status: "LOADING"; error?: null }
  | { status: "LOADED"; error?: null }
  | { status: "ERRORED"; error: Error };

export const TrackChat: React.FC<Props> = ({ track, disableAdminControl, disableSponsorPromo, hideForm }) => {
  const chat = useChat();
  const { data: session } = Api.useSession();
  const [[chatSessionStatus, chatSessionError], setChatSessionStatusTuple] = React.useState<ChatSessionStatusTuple>([
    chat?.session?.status,
    chat?.session?.error,
  ]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState<ChatHistoryLoadingStatus>({ status: "LOADING" });

  const [chatLog] = React.useState(new ChatLog());
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const trackChannel = track.chat ? chat.tracks?.[track.slug]?.channel_arn ?? null : null;

  const [chatCallbacks] = React.useState({
    onStatus(status: ChatStatus, error: Error | null) {
      console.log("onStatusChange", status, error);
      setChatSessionStatusTuple([status, error]);
    },
    onMessage(update: ChatUpdate) {
      const adminControl = update.message?.adminControl;
      if (adminControl && !disableAdminControl) {
        consumeChatAdminControl(adminControl);
      }
      chatLog.append(update);
    },
  });

  React.useEffect(() => {
    chatLog.onUpdate = (h) => setChatHistory(h);
  }, [chatLog]);

  React.useEffect(() => {
    if (!chat.session) return;
    return chat.session.subscribeStatus(chatCallbacks.onStatus);
  }, [chat.session]);

  React.useEffect(() => {
    if (!chat.session) return;
    if (!trackChannel) return;

    console.log("TrackChat: subscribeMessageUpdate");

    const unsubscribe = chat.session.subscribeMessageUpdate(trackChannel, chatCallbacks.onMessage);

    return () => {
      console.log("TrackChat: subscribeMessageUpdate; unsubscribing");
      unsubscribe();
    };
  }, [chat.session, trackChannel]);

  React.useEffect(() => {
    if (!chat.session) return;
    if (!chatSessionStatus || chatSessionStatus === "INIT") return;
    if (!trackChannel) {
      console.warn("No trackChannel from chatSession");
      setIsLoadingHistory({ status: "LOADED" });
      return;
    }

    const onChatHistory = (messages: ChatMessage[]) => {
      console.log("onChatHistory", messages);
      setIsLoadingHistory({ status: "LOADED" });
      chatLog.reverseMerge(messages);
    };

    chat.session
      .getHistory(trackChannel)
      .then(onChatHistory)
      .catch((e) => {
        console.error(e);
        setIsLoadingHistory({ status: "ERRORED", error: e });
      });
  }, [chat.session, chatSessionStatus, trackChannel]);

  const chatMessagePin = useChatMessagePinOrSponsorshipPromo(track, disableSponsorPromo === true);

  if (!track.chat) {
    console.warn("TrackChat: NO TRACK CHAT PRESENT");
    return <></>;
  }

  // TODO: disable ChatForm until obtain session

  return (
    <Flex direction="column" h="100%" w="100%" border="1px solid" borderColor={Colors.chatBorder2}>
      <ChatStatusView
        status={chatSessionStatus}
        loading={isLoadingHistory.status === "LOADING"}
        error={chat?.error || chatSessionError || isLoadingHistory.error}
      />
      <Box flexGrow={1} flexShrink={0} flexBasis={0} w="100%" overflowX="hidden" overflowY="hidden" bg={Colors.chatBg}>
        {trackChannel ? (
          <ChatHistoryView
            track={track}
            messages={chatHistory}
            loading={isLoadingHistory.status === "LOADING"}
            showAdminActions={session?.attendee?.is_staff ?? false}
            pinnedMessage={chatMessagePin?.message ?? null}
          />
        ) : (
          <Skeleton flexGrow={1} flexShrink={0} flexBasis={0} />
        )}
      </Box>
      {hideForm ? null : (
        <Box w="100%">
          <ChatForm track={track} channel={trackChannel} />
        </Box>
      )}
    </Flex>
  );
};

const SPONSORSHIP_PROMO_TICK_INTERVAL = 5;
const SPONSORSHIP_PROMO_ROTATE_INTERVAL = 20;

function useChatMessagePinOrSponsorshipPromo(track: Track, disableSponsorPromo: boolean): ChatMessagePin | null {
  const { data: serverPin } = Api.useChatMessagePin(track.slug);
  const { data: sponsorships } = Api.useConferenceSponsorships();
  const promoEntries = useMemo(() => sponsorships?.conference_sponsorships.filter((v) => v.promo), [sponsorships]);

  const shouldShowPromo = track.card?.show_promo && !disableSponsorPromo;
  const [tick, setTick] = useState(-1);

  useEffect(() => {
    if (shouldShowPromo) {
      setTick(dayjs().unix());
      const timer = setInterval(() => {
        setTick(dayjs().unix());
      }, SPONSORSHIP_PROMO_TICK_INTERVAL * 1000);
      return () => clearInterval(timer);
    } else {
      setTick(-1);
      return undefined;
    }
  }, [shouldShowPromo]);

  //console.log("useChatMessagePinOrSponsorshipPromo", { shouldShowPromo, tick, promoEntries, serverPin });

  if (shouldShowPromo && promoEntries) {
    const now = tick === -1 ? dayjs().unix() : tick;
    const sponsor = promoEntries[Math.floor(now / SPONSORSHIP_PROMO_ROTATE_INTERVAL) % promoEntries.length];
    //console.log("useChatMessagePinOrSponsorshipPromo", { now, sponsor });
    if (sponsor?.promo) {
      const pseudoPinMessage: ChatMessagePin = {
        at: now,
        track: "PROMO",
        message: {
          channel: "PROMO",
          id: `PROMO-${sponsor.id}`,
          content: sponsor.promo,
          sender: { handle: `ps_${sponsor.sponsor_app_id}`, version: "0", name: sponsor.name },
          timestamp: now * 1000,
          redacted: false,
          adminControl: { promo: true },
        },
      };
      return pseudoPinMessage;
    }
  }
  return serverPin?.pin ?? null;
}

export default TrackChat;

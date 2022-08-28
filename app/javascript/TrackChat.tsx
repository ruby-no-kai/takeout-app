import React from "react";

import { Box, Flex, Skeleton } from "@chakra-ui/react";

import type { Track, ChatMessage } from "./Api";
import { Api, consumeChatAdminControl } from "./Api";
import { Colors } from "./theme";
import { useChat } from "./ChatProvider";
import { ChatLog } from "./ChatLog";
import type { ChatStatus, ChatUpdate } from "./ChatSession";

import { ChatStatusView } from "./ChatStatusView";
import { ChatHistoryView } from "./ChatHistoryView";
import { ChatForm } from "./ChatForm";

export type Props = {
  track: Track;
}

export type ChatSessionStatusTuple = [ChatStatus | undefined, Error | null | undefined];
type ChatHistoryLoadingStatus =
  | { status: "LOADING"; error?: null }
  | { status: "LOADED"; error?: null }
  | { status: "ERRORED"; error: Error };

export const TrackChat: React.FC<Props> = ({ track }) => {
  const chat = useChat();
  const { data: session } = Api.useSession();
  const { data: chatMessagePin } = Api.useChatMessagePin(track.slug);
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
      if (adminControl) {
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
    if (!trackChannel) return;

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
        error={chatSessionError || isLoadingHistory.error}
      />
      <Box flexGrow={1} flexShrink={0} flexBasis={0} w="100%" overflowX="hidden" overflowY="hidden">
        {trackChannel ? (
          <ChatHistoryView
            track={track}
            messages={chatHistory}
            loading={isLoadingHistory.status === "LOADING"}
            showAdminActions={session?.attendee?.is_staff ?? false}
            pinnedMessage={chatMessagePin?.pin?.message ?? null}
          />
        ) : (
          <Skeleton flexGrow={1} flexShrink={0} flexBasis={0} />
        )}
      </Box>
      <Box w="100%">
        <ChatForm track={track} channel={trackChannel} />
      </Box>
    </Flex>
  );
};

export default TrackChat;

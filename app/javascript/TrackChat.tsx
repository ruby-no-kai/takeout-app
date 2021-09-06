import React from "react";

import { Box, Flex } from "@chakra-ui/react";

import type { Track, ChatMessage } from "./Api";
import { Api, consumeChatAdminControl } from "./Api";
import { Colors } from "./theme";
import { useChat } from "./ChatProvider";
import type { ChatStatus, ChatUpdate } from "./ChatSession";

import { ChatStatusView } from "./ChatStatusView";
import { ChatHistoryView } from "./ChatHistoryView";
import { ChatForm } from "./ChatForm";

export interface Props {
  track: Track;
}

const HISTORY_LENGTH = 100;

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
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const trackChannel = track.chat ? chat.tracks?.[track.slug]?.channel_arn ?? null : null;

  // XXX: たまたま中で同じ配列を破壊しながら進んでいるので助かっているだけ1
  const [chatCallbacks, _setChatCallbacks] = React.useState({
    onStatusChange(status: ChatStatus, error: Error | null) {
      console.log("onStatusChange", status, error);
      setChatSessionStatusTuple([status, error]);
    },
    onChatUpdate(update: ChatUpdate) {
      console.log("onChatUpdate", update);
      if (update.message?.content) {
        setChatHistory(updateChatHistory(chatHistory, update));
      }
      const adminControl = update.message?.adminControl;
      if (adminControl) {
        consumeChatAdminControl(adminControl);
      }
    },
  });

  React.useEffect(() => {
    if (!chat.session) return;
    return chat.session.subscribeStatus(chatCallbacks.onStatusChange);
  }, [chat.session]);

  React.useEffect(() => {
    if (!chat.session) return;
    if (!trackChannel) return;

    console.log("subscribing", trackChannel);

    const unsubscribeMessage = chat.session.subscribeMessageUpdate(trackChannel, chatCallbacks.onChatUpdate);

    console.log("subscribed", trackChannel);

    return () => {
      console.log("unsubscribing", trackChannel);
      unsubscribeMessage();
    };
  }, [chat.session, trackChannel]);

  React.useEffect(() => {
    if (!chat.session) return;
    if (!chatSessionStatus || chatSessionStatus === "INIT") return;
    if (!trackChannel) return;

    const onChatHistory = (messages: ChatMessage[]) => {
      console.log("onChatHistory", messages);
      setIsLoadingHistory({ status: "LOADED" });
      setChatHistory(mergeChatHistory(messages, chatHistory));
    };

    chat.session
      .getHistory(trackChannel)
      .then(onChatHistory)
      .catch((e) => {
        console.error(e);
        setIsLoadingHistory({ status: "ERRORED", error: e });
      });
  }, [chat.session, chatSessionStatus, trackChannel]);

  if (!trackChannel) return <></>;

  // TODO: disable ChatForm until obtain session
  // TODO: pinned ChatMessageView

  return (
    <Flex direction="column" h="100%" w="100%" border="1px solid" borderColor={Colors.chatBorder2}>
      <ChatStatusView
        status={chatSessionStatus}
        loading={isLoadingHistory.status === "LOADING"}
        error={chatSessionError || isLoadingHistory.error}
      />
      <Box flexGrow={1} flexShrink={0} flexBasis={0} w="100%" overflowX="hidden" overflowY="hidden">
        <ChatHistoryView
          track={track}
          messages={chatHistory}
          loading={isLoadingHistory.status === "LOADING"}
          showAdminActions={session?.attendee?.is_staff ?? false}
          pinnedMessage={chatMessagePin?.pin?.message ?? null}
        />
      </Box>
      <Box minH="100px" w="100%">
        <ChatForm track={track} channel={trackChannel} />
      </Box>
    </Flex>
  );
};

function sortChatHistoryNewestFirst(a: ChatMessage, b: ChatMessage) {
  return b.timestamp - a.timestamp;
}

function mergeChatHistory(existingHistory: ChatMessage[], newHistory: ChatMessage[]): ChatMessage[] {
  const knownIDs = new Map<string, boolean>(newHistory.map((v) => [v.id, true]));
  console.log("mergeChatHistory", { existingHistory, knownIDs, newHistory });
  existingHistory.forEach((v) => {
    if (!knownIDs.has(v.id)) newHistory.push(v);
  });
  existingHistory.sort(sortChatHistoryNewestFirst);
  return existingHistory.slice(0, HISTORY_LENGTH);
}

// TODO: 元の配列を保持しつづけてるのでメモリリーク
function updateChatHistory(existingHistory: ChatMessage[], update: ChatUpdate): ChatMessage[] {
  if (!update.message) throw "updateChatHistory: ChatUpdate#message is falsy";
  const message = update.message;

  console.log("updateChatHistory", { existingHistory, update });
  switch (update.kind) {
    case "CREATE_CHANNEL_MESSAGE":
      existingHistory.splice(0, 0, message);
      break;
    case "DELETE_CHANNEL_MESSAGE":
      existingHistory.forEach((v, i) => {
        if (v.id === message.id) existingHistory[i].redacted = true;
      });
      break;
    case "REDACT_CHANNEL_MESSAGE":
    case "UPDATE_CHANNEL_MESSAGE":
      existingHistory.forEach((v, i) => {
        if (v.id === message.id) existingHistory[i] = v;
      });
      break;
    default:
      throw `updateChatHistory got unsupported update kind=${update.kind}`;
  }
  return existingHistory.slice(0, HISTORY_LENGTH);
}

export default TrackChat;

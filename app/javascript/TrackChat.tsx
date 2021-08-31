import React from "react";

import { Box, Flex } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";

import { Api, Track } from "./Api";
import { useChat } from "./ChatProvider";
import { ChatStatus, ChatMessage, ChatUpdate } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";
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
  const [[chatSessionStatus, chatSessionError], setChatSessionStatusTuple] = React.useState<ChatSessionStatusTuple>([
    chat?.session?.status,
    chat?.session?.error,
  ]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState<ChatHistoryLoadingStatus>({ status: "LOADING" });
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const trackChannel = track.chat ? chat.tracks?.[track.slug]?.channel_arn ?? null : null;

  const [chatCallbacks, _setChatCallbacks] = React.useState({
    onStatusChange(status: ChatStatus, error: Error | null) {
      console.log("onStatusChange", status, error);
      setChatSessionStatusTuple([status, error]);
    },
    onChatUpdate(update: ChatUpdate) {
      console.log("onChatUpdate", update);
      setChatHistory(updateChatHistory(chatHistory, update));
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

  return (
    <Flex direction="column" h="100%" w="100%">
      <ChatStatusView
        status={chatSessionStatus}
        loading={isLoadingHistory.status === "LOADING"}
        error={chatSessionError || isLoadingHistory.error}
      />
      <Box flexGrow={1} flexShrink={0} flexBasis={0} w="100%" overflowX="hidden" overflowY="hidden">
        <ChatHistoryView messages={chatHistory} loading={isLoadingHistory.status === "LOADING"} />
      </Box>
      <Box minH="100px" w="100%">
        <ChatForm track={track} channel={trackChannel} />
      </Box>
    </Flex>
  );
};

function sortChatHistoryNewestFirst(a: ChatMessage, b: ChatMessage) {
  return b.timestamp.unix() - a.timestamp.unix();
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

function updateChatHistory(existingHistory: ChatMessage[], update: ChatUpdate): ChatMessage[] {
  console.log("updateChatHistory", { existingHistory, update });
  switch (update.kind) {
    case "CREATE_CHANNEL_MESSAGE":
      existingHistory.splice(0, 0, update.message);
      break;
    case "DELETE_CHANNEL_MESSAGE":
      existingHistory.forEach((v, i) => {
        if (v.id === update.message.id) existingHistory[i].redacted = true;
      });
      break;
    case "REDACT_CHANNEL_MESSAGE":
    case "UPDATE_CHANNEL_MESSAGE":
      existingHistory.forEach((v, i) => {
        if (v.id === update.message.id) existingHistory[i] = v;
      });
      break;
    default:
      throw `updateChatHistory got unsupported update kind=${update.kind}`;
  }
  return existingHistory.slice(0, HISTORY_LENGTH);
}
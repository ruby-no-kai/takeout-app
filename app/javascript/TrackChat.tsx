import React from "react";

import { Box, Container, Button, Link, FormControl, FormLabel, FormHelperText, Input } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { Api, Track } from "./Api";
import { useChat } from "./ChatProvider";
import { ChatStatus, ChatUpdate } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";
import { ChatForm } from "./ChatForm";

export interface Props {
  track: Track;
}

type ChatSessionStatusTuple = [ChatStatus | null, Error | null];

export const TrackChat: React.FC<Props> = ({ track }) => {
  const chat = useChat();
  const [[chatSessionStatus, chatSessionError], setChatSessionStatusTuple] = React.useState<ChatSessionStatusTuple>([
    null,
    null,
  ]);
  const trackChannel = track.chat ? chat.tracks?.[track.slug]?.channel_arn ?? null : null;

  const onStatusChange = (status: ChatStatus, error: Error | null) => {
    console.log("onStatusChange", status, error);
    setChatSessionStatusTuple([status, error]);
  };
  const onChatUpdate = (update: ChatUpdate) => {
    console.log("onChatUpdate", update);
  };

  React.useEffect(() => {
    if (!chat.session) return;
    if (!trackChannel) return;

    const unsubscribeStatus = chat.session.subscribeStatus(onStatusChange);
    const unsubscribeMessage = chat.session.subscribeMessageUpdate(trackChannel, onChatUpdate);
    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
    };
  }, [chat.session, trackChannel]);

  if (!trackChannel) return <></>;

  return (
    <Box>
      <p>ch: {trackChannel}</p>
      <p>status: {chatSessionStatus ?? "unknown"}</p>
      <p>err: {chatSessionError ?? "N/A"}</p>
      {trackChannel ? <ChatForm track={track} channel={trackChannel} /> : null}
    </Box>
  );
};

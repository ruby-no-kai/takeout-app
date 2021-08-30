import React from "react";

import { Box, Container, Button, Link, FormControl, FormLabel, FormHelperText, Input } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { ChatMessage } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";
import { ChatMessageView } from "./ChatMessageView";

export interface Props {
  messages: ChatMessage[];
  loading: boolean;
}

export const ChatHistoryView: React.FC<Props> = ({ messages, loading }) => {
  const messageViews = messages
    .slice(0)
    .reverse()
    .map((v) => <ChatMessageView key={v.id} message={v} />);
  return (
    <Box>
      {loading ? <p>Loading..</p> : null}
      {messageViews}
    </Box>
  );
};

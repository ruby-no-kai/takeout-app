import React from "react";

import { Box, Container, Button, Link, FormControl, FormLabel, FormHelperText, Input } from "@chakra-ui/react";
import { Center, Circle, Image } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { Api, Track } from "./Api";
import { ChatStatus, ChatMessage, ChatUpdate } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";
import { ChatForm } from "./ChatForm";

export interface Props {
  message: ChatMessage;
}

export const ChatMessageView: React.FC<Props> = ({ message }) => {
  return (
    <Box>
      <span>{message.sender.name}</span>
      {": "}
      {message.redacted ? <i>[message removed]</i> : <span>{message.content}</span>}
    </Box>
  );
};

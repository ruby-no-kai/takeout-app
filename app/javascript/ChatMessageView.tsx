import React from "react";

import { Box, Container } from "@chakra-ui/react";
import { Text, Badge, Tooltip, Center, Circle, Image } from "@chakra-ui/react";
import { Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";

import { Api, Track } from "./Api";
import { ChatStatus, ChatMessage, ChatSender, ChatUpdate } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";
import { ChatForm } from "./ChatForm";

export interface Props {
  message: ChatMessage;
}

export const ChatMessageView: React.FC<Props> = ({ message }) => {
  return (
    <Box>
      <ChatMessageAuthor author={message.sender} />{" "}
      {message.redacted ? <i>[message removed]</i> : <span>{message.content}</span>}
    </Box>
  );
};

const AUTHOR_NAME_COLOR = "#828282";

const ChatMessageAuthor: React.FC<{ author: ChatSender }> = ({ author }) => {
  const badges = [
    author.isStaff ? (
      <Tooltip label="Staff" key="staff">
        <Badge>staff</Badge>
      </Tooltip>
    ) : null,
    author.isSpeaker ? (
      <Tooltip label="Speaker" key="speaker">
        <Badge>speaker</Badge>
      </Tooltip>
    ) : null,
    author.isCommitter ? (
      <Tooltip label="committer" key="committer">
        <Badge>committer</Badge>
      </Tooltip>
    ) : null,
  ];

  if (author.isAdmin) {
    // TODO: isAdmin style
    return (
      <span>
        <Text as="span" color={AUTHOR_NAME_COLOR} fontWeight="bold">
          RubyKaigi
        </Text>
      </span>
    );
  } else if (author.isAnonymous) {
    return (
      <span>
        <Tooltip label={`Anonymous ${author.handle}`}>
          <Text as="span" color={AUTHOR_NAME_COLOR}>
            Anonymous
          </Text>{" "}
          <Text as="span" color={AUTHOR_NAME_COLOR} fontWeight="bold">
            {author.handle.slice(0, 5)}
          </Text>
        </Tooltip>
        {badges}
      </span>
    );
  } else {
    return (
      <span>
        <Text as="span" color={AUTHOR_NAME_COLOR} fontWeight="bold">
          {author.name}
        </Text>
        {badges}
      </span>
    );
  }
};

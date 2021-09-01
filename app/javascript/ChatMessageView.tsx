import React from "react";

import { Flex, Box, Container } from "@chakra-ui/react";
import { Text, Badge, Tooltip, Center, Circle } from "@chakra-ui/react";
import { Avatar, Image } from "@chakra-ui/react";

import { DEFAULT_AVATAR_URL } from "./meta";

import { Api, Track } from "./Api";
import { ChatStatus, ChatMessage, ChatSender, ChatUpdate } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";
import { ChatForm } from "./ChatForm";

export interface Props {
  message: ChatMessage;
}

export const ChatMessageView: React.FC<Props> = ({ message }) => {
  return (
    <Flex mt={2} direction="row" alignItems="center">
      <ChatMessageAvatar author={message.sender} />
      <Box ml={2}>
        <Text p={0} m={0} fontSize="sm">
          <ChatMessageAuthor author={message.sender} />{" "}
          {message.redacted ? <i>[message removed]</i> : <span>{message.content}</span>}
        </Text>
      </Box>
    </Flex>
  );
};

const ChatMessageAvatar: React.FC<{ author: ChatSender }> = ({ author }) => {
  return <Avatar size="xs" bg="#868E96" src={`/avatars/${author.handle}?v=${author.version}`} />;
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
        <Text as="span" color={AUTHOR_NAME_COLOR} fontWeight="bold" fontSize="sm">
          RubyKaigi
        </Text>
      </span>
    );
  } else if (author.isAnonymous) {
    return (
      <span>
        <Tooltip label={`Anonymous ${author.handle}`}>
          <Text as="span" color={AUTHOR_NAME_COLOR} fontSize="sm">
            Anonymous
          </Text>{" "}
          <Text as="span" color={AUTHOR_NAME_COLOR} fontWeight="bold" fontSize="sm">
            {author.handle.slice(0, 5)}
          </Text>
        </Tooltip>
        {badges}
      </span>
    );
  } else {
    return (
      <span>
        <Text as="span" color={AUTHOR_NAME_COLOR} fontWeight="bold" fontSize="sm">
          {author.name}
        </Text>
        {badges}
      </span>
    );
  }
};

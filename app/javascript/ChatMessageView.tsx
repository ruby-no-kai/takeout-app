import React from "react";

import { Flex, Box, Container } from "@chakra-ui/react";
import { Text, Badge, Tooltip } from "@chakra-ui/react";
import { Icon, Avatar } from "@chakra-ui/react";

import { Portal, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";

import type { Track, ChatMessage, ChatSender } from "./Api";
import { Api } from "./Api";

import { Colors } from "./theme";
import { MicIcon } from "./MicIcon";
import { CampaignIcon } from "./CampaignIcon";
import { LunchDiningIcon } from "./LunchDiningIcon";
import { CommitterIcon } from "./CommitterIcon";

export interface Props {
  track: Track;
  message: ChatMessage;
  pinned: boolean;
  showAdminActions: boolean;
}

export const ChatMessageView: React.FC<Props> = (props) => {
  const { track, message, pinned, showAdminActions } = props;
  const [showMenuButton, setShowMenuButton] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Flex
      w="100%"
      mb={2}
      direction="row"
      alignItems="center"
      bg={pinned ? Colors.baseLight : Colors.backgroundColor}
      onMouseEnter={() => setShowMenuButton(true)}
      onMouseLeave={() => setShowMenuButton(false)}
      onTouchEnd={(e) => {
        e.preventDefault();
        setShowMenuButton(!!showMenuButton);
      }}
    >
      <ChatMessageAvatar author={message.sender} />
      <Box ml={2} flexGrow={1} flexShrink={0} flexBasis={0}>
        <ChatMessageAuthor author={message.sender} pinned={pinned} />
        <Text p={0} m={0} ml={1} fontSize="sm" as="span">
          {message.redacted ? <i>[message removed]</i> : <span>{message.content}</span>}
        </Text>
      </Box>
      {(showAdminActions && showMenuButton) || isMenuOpen ? (
        <ChatMessageMenu {...props} onOpen={() => setIsMenuOpen(true)} onClose={() => setIsMenuOpen(false)} />
      ) : null}
    </Flex>
  );
};

const ChatMessageAvatar: React.FC<{ author: ChatSender }> = ({ author }) => {
  if (author.isAdmin) {
    // TODO: webp
    return <Avatar size="xs" bg="#ffffff" src="/assets/hamburger.jpg" loading="lazy" />;
  } else {
    return (
      <Avatar
        size="xs"
        bg={Colors.defaultAvatarBg}
        src={`/avatars/${author.handle}?v=${author.version}`}
        loading="lazy"
      />
    );
  }
};

const ChatMessageAuthor: React.FC<{ author: ChatSender; pinned: boolean }> = ({ author, pinned }) => {
  const highlight = true; // TODO:
  const { bg, fg } = [
    author.isAdmin ? Colors.nameHighlightOrgz : null,
    highlight && author.isSpeaker ? Colors.nameHighlightSpeaker : null,
    highlight && author.isCommitter ? Colors.nameHighlightCore : null,
    pinned ? { bg: Colors.baseLight, fg: Colors.dark } : null,
  ].filter((v) => !!v)[0] || { bg: Colors.backgroundColor, fg: Colors.textMuted };

  const icons: JSX.Element[] = [];
  if (author.isAdmin) icons.push(<CampaignIcon key="admin" color={fg} />);
  if (author.isStaff) icons.push(<LunchDiningIcon key="staff" color={fg} />);
  if (author.isSpeaker) icons.push(<MicIcon key="speaker" color={fg} />);
  if (author.isCommitter) icons.push(<CommitterIcon key="committer" color={fg} />);

  const tooltipContents: string[] = [];
  if (author.isAdmin) tooltipContents.push("Official Announcement");
  if (author.isStaff) tooltipContents.push("RubyKaigi Staff");
  if (author.isSpeaker) tooltipContents.push("Speaker");
  if (author.isCommitter) tooltipContents.push("Ruby Committer");
  if (author.isAnonymous) tooltipContents.push(`Anonymous ${author.handle}`);

  return (
    <Tooltip label={tooltipContents.length > 0 ? tooltipContents.join(", ") : undefined} display="inline-block">
      <Flex display="inline" alignItems="center" direction="row" bgColor={bg} borderRadius="4px" px={1} py="1px">
        <ChatAuthorName author={author} fg={fg} />
        {icons.length > 0 ? (
          <Text as="span" ml={1}>
            {icons}
          </Text>
        ) : null}
      </Flex>
    </Tooltip>
  );
};

const ChatAuthorName: React.FC<{ author: ChatSender; fg: string }> = ({ author, fg }) => {
  const fontWeight = "bold";
  const fontSize = "sm";
  if (author.isAdmin) {
    return (
      <Text as="span" color={fg} fontWeight={fontWeight} fontSize={fontSize}>
        RubyKaigi
      </Text>
    );
  } else if (author.isAnonymous) {
    return (
      <>
        <Text as="span" color={fg} fontSize={fontSize}>
          Anonymous
        </Text>{" "}
        <Text as="span" color={fg} fontWeight={fontWeight} fontSize={fontSize}>
          {author.handle.slice(0, 5)}
        </Text>
      </>
    );
  } else {
    return (
      <Text as="span" color={fg} fontWeight={fontWeight} fontSize={fontSize}>
        {author.name}
      </Text>
    );
  }
};

interface ChatMessageMenuProps extends Props {
  onOpen: () => void;
  onClose: () => void;
}

const ChatMessageMenu: React.FC<ChatMessageMenuProps> = ({ track, message, pinned, onOpen, onClose }) => {
  return (
    <Menu onOpen={onOpen} onClose={onClose}>
      <MenuButton>Menu</MenuButton>
      <Portal>
        <MenuList zIndex="1501">
          {pinned ? (
            <MenuItem onClick={() => Api.pinChatMessage(track.slug, null)}>Unpin</MenuItem>
          ) : (
            <MenuItem onClick={() => Api.pinChatMessage(track.slug, message)}>Pin</MenuItem>
          )}
        </MenuList>
      </Portal>
    </Menu>
  );
};

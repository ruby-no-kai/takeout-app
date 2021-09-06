import React from "react";
import dayjs from "dayjs";
import Autolinker from "autolinker";
import { truncateSmart } from "autolinker/dist/es2015/truncate/truncate-smart";
import { UrlMatch } from "autolinker";

import { Flex, Box, Container } from "@chakra-ui/react";
import { Text, Link, Badge, Tooltip } from "@chakra-ui/react";
import { Icon, Avatar } from "@chakra-ui/react";

import { Portal, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";

import type { Track, ChatMessage, ChatSender } from "./Api";
import { Api, ChatSpotlight, ChatHandle } from "./Api";

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

  const hasSpotlight = React.useMemo(() => isMessageSpotlighted(message, track.spotlights), [track.spotlights]);

  return (
    <Flex
      w="100%"
      direction="row"
      alignItems="center"
      bg={pinned ? Colors.baseLight : message.sender.isAdmin ? "#ffffff" : Colors.backgroundColor}
      py={pinned ? "10px" : "4px"}
      px="15px"
      onMouseEnter={() => setShowMenuButton(true)}
      onMouseLeave={() => setShowMenuButton(false)}
      onTouchEnd={(e) => {
        e.preventDefault();
        setShowMenuButton(!!showMenuButton);
      }}
    >
      <ChatMessageAvatar author={message.sender} />
      <Box ml="8px" flexGrow={1} flexShrink={0} flexBasis={0}>
        <ChatMessageAuthor author={message.sender} pinned={pinned} highlight={hasSpotlight} />
        <Text p={0} m={0} ml={1} fontSize="sm" as="span">
          {message.redacted ? (
            <i>[message removed]</i>
          ) : (
            React.useMemo(() => <ChatMessageText content={message.content || ""} />, [message.content])
          )}
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

const ChatMessageAuthor: React.FC<{ author: ChatSender; highlight: boolean; pinned: boolean }> = ({
  author,
  highlight,
  pinned,
}) => {
  const defaultBg = pinned ? Colors.baseLight : Colors.backgroundColor;
  const { bg, fg } = [
    author.isAdmin ? Colors.nameHighlightOrgz : null,
    highlight && author.isSpeaker ? Colors.nameHighlightSpeaker : null,
    highlight && author.isCommitter ? Colors.nameHighlightCore : null,
    highlight ? Colors.nameHighlightSpeaker : null,
    author.isSpeaker ? { bg: defaultBg, fg: Colors.nameSpeaker } : null,
    author.isCommitter ? { bg: defaultBg, fg: Colors.nameCore } : null,
    pinned ? { bg: defaultBg, fg: Colors.dark } : null,
  ].filter((v) => !!v)[0] || { bg: defaultBg, fg: Colors.textMuted };

  const icons: JSX.Element[] = [];
  if (author.isAdmin) icons.push(<CampaignIcon key="admin" color={fg} />);
  if (author.isStaff) icons.push(<LunchDiningIcon key="staff" color={fg} />);
  if (author.isSpeaker) icons.push(<MicIcon key="speaker" color={fg} />);
  if (author.isCommitter) icons.push(<CommitterIcon key="committer" color={fg} boxSize="12px" />);

  const tooltipContents: string[] = [];
  if (author.isAdmin) tooltipContents.push("Official Announcement");
  if (author.isStaff) tooltipContents.push("RubyKaigi Staff");
  if (author.isSpeaker) tooltipContents.push("Speaker");
  if (author.isCommitter) tooltipContents.push("Ruby Committer");
  if (author.isAnonymous) tooltipContents.push(`Anonymous ${author.handle}`);

  return (
    <Tooltip label={tooltipContents.length > 0 ? tooltipContents.join(", ") : undefined} display="inline-block">
      <Flex
        display="inline"
        alignItems="center"
        direction="row"
        bgColor={bg}
        borderRadius="4px"
        ml="-4px"
        px="4px"
        py="1px"
      >
        <ChatAuthorName author={author} fg={fg} />
        {icons.length > 0 ? (
          <Text as="span" ml={1} color={fg}>
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

const ChatMessageText: React.FC<{ content: string }> = ({ content }) => {
  const result: JSX.Element[] = [];
  const matches = Autolinker.parse(content, {
    urls: true,
    email: false,
    phone: false,
    mention: false,
    hashtag: false,
    stripPrefix: false,
    truncate: { length: 20, location: "middle" },
  });
  let lastIndex = 0;
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    result.push(<React.Fragment key={`${i}a`}>{content.substring(lastIndex, m.getOffset())}</React.Fragment>);
    if (m instanceof UrlMatch) {
      result.push(
        <Link key={`${i}b`} textDecoration="underline" rel="nofollow">
          {truncateSmart(m.getAnchorText(), 30, "…")}
        </Link>,
      );
    } else {
      result.push(<React.Fragment key={`${i}c`}>{m.getMatchedText()}</React.Fragment>);
    }
    lastIndex = m.getOffset() + m.getMatchedText().length;
  }
  result.push(<React.Fragment key="last">{content.substring(lastIndex)}</React.Fragment>);
  return <span>{result}</span>;
};

function isMessageSpotlighted(message: ChatMessage, spotlights: ChatSpotlight[]): boolean {
  const ts = dayjs(message.timestamp).unix();
  const handle = message.sender.handle;
  return (
    spotlights.findIndex((spotlight) => {
      return (
        spotlight.starts_at <= ts &&
        (spotlight.ends_at ? ts < spotlight.ends_at : true) &&
        spotlight.handles.indexOf(handle) !== -1
      );
    }) !== -1
  );
}

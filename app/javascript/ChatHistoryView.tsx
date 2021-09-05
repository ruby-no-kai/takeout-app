import React from "react";

import { Flex, VStack, HStack, Stack, Box, Button, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

import type { Track, ChatMessage } from "./Api";

import { ChatMessageView } from "./ChatMessageView";

export interface Props {
  track: Track;
  messages: ChatMessage[];
  pinnedMessage: ChatMessage | null;
  loading: boolean;

  showAdminActions: boolean;
}

export const ChatHistoryView: React.FC<Props> = ({ track, messages, pinnedMessage, loading, showAdminActions }) => {
  const [autoscrollEnabled, setAutoscrollEnabled] = React.useState(true);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const box = React.useRef<HTMLDivElement>(null);

  const messageViews = messages
    .filter((v) => v.content !== undefined && v.content !== null)
    .map((v) => (
      <ChatMessageView key={v.id} track={track} message={v} pinned={false} showAdminActions={showAdminActions} />
    ))
    .reverse();
  const latestMessageAt = messages[0]?.timestamp;
  const lastLatestMessageAt = usePrevious(latestMessageAt);

  React.useEffect(() => {
    if (!loading) return;
    if (!box.current) return;
    const el = box.current;

    el.addEventListener("scroll", function () {
      //const flag = el.scrollTop === el.scrollHeight;
      //console.log("setAutoscrollEnabled on scroll", flag, el.scrollTop, el.scrollHeight);
      setAutoscrollEnabled(false);
    });
  }, [loading, box.current]);

  //React.useEffect(() => {
  //  if (autoscrollEnabled) return;
  //  if (lastLatestMessageAt && latestMessageAt && latestMessageAt.isSame(lastLatestMessageAt)) return;

  //  setShowScrollButton(true);
  //}, [box.current, autoscrollEnabled, latestMessageAt, lastLatestMessageAt]);

  React.useEffect(() => {
    console.log("autoscroll chance");
    if (!autoscrollEnabled) return;
    if (!box.current) return;
    console.log("autoscroll do");
    const el = box.current;
    el.scrollTop = el.scrollHeight;
  }, [loading, autoscrollEnabled, box.current, messages]);

  if (loading) {
    return (
      <Flex h="100%" overflowY="hidden" direction="column-reverse">
        <SkeletonText noOfLines={18} spacing="4" />
      </Flex>
    );
  }

  return (
    <Box h="100%" overflowX="hidden" overflowY="scroll" wordBreak="break-word" ref={box}>
      {pinnedMessage ? (
        <Box position="sticky" top="0px" zIndex="1500">
          <ChatMessageView track={track} message={pinnedMessage} pinned={true} showAdminActions={showAdminActions} />
        </Box>
      ) : null}
      {showScrollButton ? <Button onClick={() => setAutoscrollEnabled(true)}>bottom</Button> : null}
      {loading ? <p>Loading..</p> : null}
      {messageViews}
    </Box>
  );
};

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

import React from "react";

import { Flex, VStack, HStack, Stack, Box, Button, Skeleton } from "@chakra-ui/react";

import type { Track, ChatMessage } from "./Api";

import { ChatMessageView } from "./ChatMessageView";

export type Props = {
  track: Track;
  messages: ChatMessage[];
  pinnedMessage: ChatMessage | null;
  loading: boolean;

  showAdminActions: boolean;
}

export const ChatHistoryView: React.FC<Props> = ({ track, messages, pinnedMessage, loading, showAdminActions }) => {
  const [autoscrollEnabled, setAutoscrollEnabled] = React.useState(true);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  const [box, setBox] = React.useState<HTMLDivElement | null>(null);
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const boxCb = React.useCallback(
    (el: HTMLDivElement) => {
      boxRef.current = el;
      setBox(el);
    },
    [setBox],
  );

  const messageViews = messages
    .filter((v) => v.content !== undefined && v.content !== null)
    .map((v) => (
      <ChatMessageView key={v.id} track={track} message={v} pinned={false} showAdminActions={showAdminActions} />
    ))
    .reverse();
  const latestMessageAt = messages[0]?.timestamp;
  const lastLatestMessageAt = usePrevious(latestMessageAt);

  //React.useEffect(() => {
  //  if (!loading) return;
  //  if (!box.current) return;
  //  const el = box.current;

  //  el.addEventListener("scroll", function () {
  //    //const flag = el.scrollTop === el.scrollHeight;
  //    //console.log("setAutoscrollEnabled on scroll", flag, el.scrollTop, el.scrollHeight);
  //    setAutoscrollEnabled(false);
  //  });
  //}, [loading, box]);

  //React.useEffect(() => {
  //  if (autoscrollEnabled) return;
  //  if (lastLatestMessageAt && latestMessageAt && latestMessageAt.isSame(lastLatestMessageAt)) return;

  //  setShowScrollButton(true);
  //}, [box.current, autoscrollEnabled, latestMessageAt, lastLatestMessageAt]);

  React.useEffect(() => {
    console.log("autoscroll chance");
    if (!autoscrollEnabled) return;
    if (!box) return;
    console.log("autoscroll do");
    box.scrollTop = box.scrollHeight;
  }, [box, loading, autoscrollEnabled, messages.length, messages[messages.length - 1]?.id]);

  //if (loading) {
  //  return (
  //    <Flex h="100%" overflowY="hidden" direction="column-reverse">
  //      <Skeleton w="100%" h="100%" />
  //    </Flex>
  //  );
  //}

  return (
    <Box h="100%" overflowX="hidden" overflowY="scroll" wordBreak="break-word" ref={boxCb}>
      {pinnedMessage ? (
        <Box position="sticky" left="0" top="0" zIndex="1500" w="100%">
          <ChatMessageView track={track} message={pinnedMessage} pinned={true} showAdminActions={showAdminActions} />
        </Box>
      ) : null}
      {showScrollButton ? <Button onClick={() => setAutoscrollEnabled(true)}>bottom</Button> : null}
      <VStack w="100%" spacing="2px" my="8px">
        {messageViews}
      </VStack>
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

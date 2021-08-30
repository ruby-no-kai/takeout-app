import React from "react";

import { Box, Button } from "@chakra-ui/react";

import { ChatMessage } from "./ChatSession";

import { ErrorAlert } from "./ErrorAlert";
import { ChatMessageView } from "./ChatMessageView";

export interface Props {
  messages: ChatMessage[];
  loading: boolean;
}

export const ChatHistoryView: React.FC<Props> = ({ messages, loading }) => {
  const [autoscrollEnabled, setAutoscrollEnabled] = React.useState(true);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const box = React.useRef<HTMLDivElement>(null);

  const messageViews = messages.map((v) => <ChatMessageView key={v.id} message={v} />).reverse();
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

  return (
    <Box h="100%" overflowX="hidden" overflowY="scroll" wordBreak="break-word" ref={box}>
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

import React from "react";

import { Box, Text } from "@chakra-ui/react";

import { Colors } from "./theme";

import type { Track } from "./Api";
import { Api, ChatCaption } from "./Api";
import { useChat } from "./ChatProvider";
import type { ChatStatus, ChatUpdate } from "./ChatSession";

export interface Props {
  track: Track;
}

export const TrackCaption: React.FC<Props> = ({ track }) => {
  const chat = useChat();
  const [chatSessionStatus, setChatSessionStatus] = React.useState(chat?.session?.status);
  const captionChannel = track.chat ? chat.tracks?.[track.slug]?.caption_channel_arn ?? null : null;

  const [completeCaptions, setCompleteCaptions] = React.useState<ChatCaption[]>([]);
  const [partialCaptionCand, setPartialCaption] = React.useState<ChatCaption | null>(null);

  const box = React.useRef<HTMLDivElement>(null);

  const [chatCallbacks, _setChatCallbacks] = React.useState({
    onStatusChange(status: ChatStatus, _error: Error | null) {
      setChatSessionStatus(status);
    },
    onChatUpdate(update: ChatUpdate) {
      const caption = update.message?.adminControl?.caption;
      if (!caption) return;
      if (caption.is_partial) {
        setPartialCaption(caption);
      } else {
        setCompleteCaptions([caption, ...completeCaptions].slice(0, 2));
      }
    },
  });

  React.useEffect(() => {
    if (!chat.session) return;
    return chat.session.subscribeStatus(chatCallbacks.onStatusChange);
  }, [chat.session]);

  React.useEffect(() => {
    if (!chat.session) return;
    if (!captionChannel) return;

    console.log("subscribing caption", captionChannel);
    const unsubscribeMessage = chat.session.subscribeMessageUpdate(captionChannel, chatCallbacks.onChatUpdate);
    console.log("subscribed caption", captionChannel);

    console.log("createMembership caption", captionChannel);
    Api.createCaptionChatMembership(track.slug); // TODO: reduce requests

    return () => {
      console.log("unsubscribing", captionChannel);
      unsubscribeMessage();
      console.log("deleteMembership caption", captionChannel);
      chat.session?.deleteChannelMembership(captionChannel);
    };
  }, [chat.session, captionChannel]);

  const lastCompleteCaption = completeCaptions[0];
  const partialCaption =
    partialCaptionCand && lastCompleteCaption?.result_id !== partialCaptionCand.result_id ? partialCaptionCand : null;

  React.useEffect(() => {
    console.log("caption autoscroll chance");
    if (!box.current) return;
    console.log("caption autoscroll do");
    const el = box.current;
    el.scrollTop = el.scrollHeight;
  }, [box.current, lastCompleteCaption, partialCaption]);

  if (!captionChannel) return <></>;

  return (
    <Box
      h="80px"
      w="100%"
      overflowX="hidden"
      overflowY="hidden"
      wordBreak="break-word"
      bgColor={Colors.dark}
      px="8px"
      py="12px"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        "&": { scrollbarWidth: "none" },
      }}
      ref={box}
    >
      <Text color="#FFFFFF">
        {completeCaptions.map((v) => <span key={v.result_id}>{v.transcript} </span>).reverse()}
        <span> {partialCaption?.transcript}</span>
      </Text>
    </Box>
  );
};
export default TrackCaption;

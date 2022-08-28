import React from "react";

import { Box, Text } from "@chakra-ui/react";

import { Colors } from "./theme";

import type { Track } from "./Api";
import { Api, ChatCaption } from "./Api";
import { useChat } from "./ChatProvider";
import type { ChatStatus, ChatUpdate } from "./ChatSession";

export type Props = {
  track: Track;
  onUnsubscribe: () => void;
}

export const TrackCaption: React.FC<Props> = ({ track, onUnsubscribe }) => {
  const chat = useChat();
  const [chatSessionStatus, setChatSessionStatus] = React.useState(chat?.session?.status);
  const captionChannel = track.chat ? chat.tracks?.[track.slug]?.caption_channel_arn ?? null : null;

  const [captions, setCaptions] = React.useState<ChatCaption[]>([]);
  const [lastCompleteId, setLastCompleteId] = React.useState<string | null>(null);

  const box = React.useRef<HTMLDivElement>(null);

  // XXX: たまたま中で同じ配列を破壊しながら進んでいるので助かっているだけ2
  const [chatCallbacks, _setChatCallbacks] = React.useState({
    onStatusChange(status: ChatStatus, _error: Error | null) {
      setChatSessionStatus(status);
    },
    onChatUpdate(update: ChatUpdate) {
      if (update.kind == "DELETE_CHANNEL_MEMBERSHIP" && update.member!.Arn === chat.session?.getSelfArn()) {
        onUnsubscribe();
      }

      const caption = update.message?.adminControl?.caption;
      if (!caption) return;

      if (update.kind === "CREATE_CHANNEL_MESSAGE") {
        captions.splice(0, 0, caption);
        setCaptions([...captions]);
        setLastCompleteId(null);
      } else {
        // TODO: 元の配列を保持しつづけてるのでメモリリーク & 過去のを消せていない
        const idx = captions.findIndex((c) => (c.result_id === caption.result_id ? caption : c));
        if (idx !== -1) {
          captions[idx] = caption;
        } else {
          captions.splice(0, 0, caption);
        }
        if (!caption.is_partial) setLastCompleteId(caption.result_id);
        setCaptions([...captions]);
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
      Api.deleteCaptionChatMembership(track.slug);
    };
  }, [chat.session, captionChannel]);

  React.useEffect(() => {
    console.log("caption autoscroll chance");
    if (!box.current) return;
    console.log("caption autoscroll do");
    const el = box.current;
    el.scrollTop = el.scrollHeight;
  }, [box.current, captions]);

  if (!captionChannel) return <></>;

  // TODO: Colors.textMuted is inappropriate

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
        {captions
          .map((v) => (
            <Text
              as="span"
              color={v.is_partial || lastCompleteId === v.result_id ? "inherit" : Colors.textMuted}
              key={v.result_id}
            >
              {v.transcript}{" "}
            </Text>
          ))
          .reverse()}
      </Text>
    </Box>
  );
};
export default TrackCaption;

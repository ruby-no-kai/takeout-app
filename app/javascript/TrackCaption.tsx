import React from "react";

import { Box } from "@chakra-ui/react";

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

  const [completeCaption, setCompleteCaption] = React.useState<ChatCaption | null>(null);
  const [partialCaptionCand, setPartialCaption] = React.useState<ChatCaption | null>(null);

  const partialCaption =
    partialCaptionCand && completeCaption?.result_id !== partialCaptionCand.result_id ? partialCaptionCand : null;

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
        setCompleteCaption(caption);
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

  if (!captionChannel) return <></>;

  return (
    <Box minH="100px" w="100%">
      <p>{completeCaption?.transcript}</p>
      <p>{partialCaption?.transcript}</p>
    </Box>
  );
};
export default TrackCaption;

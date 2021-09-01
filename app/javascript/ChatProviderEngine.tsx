import React from "react";
import { Api } from "./Api";
import type { ChatProviderContextData } from "./ChatProviderTypes";

import { ChatSession } from "./ChatSession";

export const ChatProviderEngine: React.FC<{ set: (x: ChatProviderContextData) => void }> = ({ set }) => {
  const { data: sessionData } = Api.useSession();
  const { data: chatSessionData, error: chatSessionError } = Api.useChatSession(sessionData?.attendee?.id);

  const [chatSession, _setChatSession] = React.useState(new ChatSession());

  React.useEffect(() => {
    return () => chatSession.disconnect();
  }, []);

  React.useEffect(() => {
    console.log(chatSession);
    if (chatSessionData) chatSession.setSessionData(chatSessionData);
    if (chatSession.status === "READY") chatSession.connect();
  }, [chatSessionData?.app_arn, chatSessionData?.user_arn, chatSessionData?.expiry]);

  React.useEffect(() => {
    const sess = {
      session: chatSession,
      tracks: chatSessionData?.tracks,
      error: chatSessionError,
    };
    console.log("ChatProviderEngine", sess);
    set(sess);
  }, [chatSession, chatSessionData, chatSessionError]);

  return <></>;
};
export default ChatProviderEngine;

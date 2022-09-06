import React from "react";
import dayjs from "dayjs";
import { Api } from "./Api";
import type { ChatProviderContextData } from "./ChatProviderTypes";

import { ChatSession } from "./ChatSession";

export const ChatProviderEngine: React.FC<{ set: (x: ChatProviderContextData) => void; isKiosk: boolean }> = ({
  set,
  isKiosk,
}) => {
  const { data: sessionData } = Api.useSession();
  const {
    data: chatSessionData,
    mutate: mutateChatSession,
    error: chatSessionError,
  } = Api.useChatSession(sessionData?.attendee?.id, isKiosk, (sessionData?.kiosk ?? null) !== null);

  const [chatSession, _setChatSession] = React.useState(new ChatSession());

  React.useEffect(() => {
    return () => chatSession.disconnect();
  }, []);

  React.useEffect(() => {
    if (!chatSessionData) return;

    const checkSessionExpiration = () => {
      const now = dayjs().unix();
      const remainingLifetime = chatSessionData.expiry - now;
      const gracePeriod = chatSessionData.grace || 300;
      if (remainingLifetime < gracePeriod) {
        console.log("Request renewal of chatSessionData");
        mutateChatSession();
      }
    };

    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, 30 * 1000);
    return () => clearInterval(interval);
  }, [chatSessionData?.expiry]);

  React.useEffect(() => {
    if (chatSessionData) {
      const now = dayjs().unix();
      if (chatSessionData.expiry <= now) {
        console.warn("chatSessionData is expired, waiting mutate");
        return;
      }
      chatSession.setSessionData(chatSessionData);
    }
    if (chatSession.status === "READY") chatSession.connect();
  }, [chatSessionData?.app_arn, chatSessionData?.user_arn, chatSessionData?.expiry]);

  React.useEffect(() => {
    const sess = {
      session: chatSession,
      tracks: chatSessionData?.tracks,
      systems_channel_arn: chatSessionData?.systems_channel_arn,
      error: chatSessionError,
    };
    console.log("ChatProviderEngine", sess);
    set(sess);
  }, [chatSession, chatSessionData, chatSessionError]);

  return <></>;
};
export default ChatProviderEngine;

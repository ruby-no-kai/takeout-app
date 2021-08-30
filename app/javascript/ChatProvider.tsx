import React from "react";
import { Api, ChatSessionTracksBag } from "./Api";

import { ChatSession } from "./ChatSession";

export interface ChatProviderContextData {
  session?: ChatSession;
  tracks?: ChatSessionTracksBag;
  error?: Error;
}
const ChatProviderContext = React.createContext<ChatProviderContextData>({});

export const ChatProvider: React.FC = ({ children }) => {
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

  const data = {
    session: chatSession,
    tracks: chatSessionData?.tracks,
    error: chatSessionError,
  };

  return <ChatProviderContext.Provider value={data}>{children}</ChatProviderContext.Provider>;
};

export function useChat() {
  const ctx = React.useContext(ChatProviderContext);
  if (!ctx) throw "useChatSession() outside of ChatProvider";
  return ctx;
}

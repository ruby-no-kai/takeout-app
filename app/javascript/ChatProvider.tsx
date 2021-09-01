import React from "react";
import loadable from "@loadable/component";

import type { ChatProviderContextData } from "./ChatProviderTypes";

const ChatProviderEngine = loadable(() => import("./ChatProviderEngine"));

const ChatProviderContext = React.createContext<ChatProviderContextData>({});

export const ChatProvider: React.FC = ({ children }) => {
  const [val, set] = React.useState<ChatProviderContextData>({});

  return (
    <>
      <ChatProviderContext.Provider value={val}>{children}</ChatProviderContext.Provider>
      <ChatProviderEngine set={set} />
    </>
  );
};

export function useChat() {
  const ctx = React.useContext(ChatProviderContext);
  if (!ctx) throw "useChatSession() outside of ChatProvider";
  return ctx;
}

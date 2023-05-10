import React from "react";
import { ChatProvider } from "./ChatProvider";
import { KioskLogin } from "./KioskLogin";
import { KioskHeartbeat } from "./KioskHeartbeat";

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <ChatProvider isKiosk>
        <KioskLogin />
        <KioskHeartbeat />
        <>{children}</>
      </ChatProvider>
    </>
  );
};

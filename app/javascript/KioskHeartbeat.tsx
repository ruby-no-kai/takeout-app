import React, { useCallback, useState } from "react";
import Api, { GetSessionResponse, KioskControlReload } from "./Api";
import { useChat } from "./ChatProvider";
import { ChatUpdate } from "./ChatSession";
import { COMMIT } from "./meta";

const respondPing = async (hb: number) => {
  try {
    await Api.updateKioskHeartbeat({ last_heartbeat_at: hb, version: COMMIT });
  } catch (e) {
    console.warn(e);
  }
};

const handleReload = async (session: GetSessionResponse, reload: KioskControlReload) => {
  if (session?.kiosk === reload.name || reload.all) {
    location.reload();
  }
};

export const KioskHeartbeat: React.FC = () => {
  const { data: session } = Api.useSession();
  const chat = useChat();
  const [_lastHeartbeat, setLastHeartbeat] = useState(-1);
  const systemsChannel = chat.systems_channel_arn;

  const onMessage = useCallback(
    (update: ChatUpdate) => {
      if (!session) return null;
      if (!session.kiosk) return null;

      console.log("KioskHeartbeat: onMessage", update);
      const kioskControl = update.message?.adminControl?.kiosk_control;
      if (!kioskControl) return;

      if (kioskControl.reload) handleReload(session, kioskControl.reload);

      if (kioskControl.ping) {
        const t = kioskControl.ping;
        setLastHeartbeat(t);
        setTimeout(() => respondPing(t), Math.floor(Math.random() * 15000));
      }
    },
    [session],
  );

  React.useEffect(() => {
    if (!session) return;
    if (!session.kiosk) return;
    if (!chat.session) return;
    if (!systemsChannel) return;

    console.log("KioskHeartbeat: subscribeMessageUpdate");

    const unsubscribe = chat.session.subscribeMessageUpdate(systemsChannel, onMessage);

    return () => {
      console.log("KioskHeartbeat: subscribeMessageUpdate; unsubscribing");
      unsubscribe();
    };
  }, [chat.session, systemsChannel, onMessage]);

  if (!session) return null;
  if (!session.kiosk) return null;

  return null;
};

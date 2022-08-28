import type { ChatSessionTracksBag } from "./Api";
import type { ChatSession } from "./ChatSession";

export type ChatProviderContextData = {
  session?: ChatSession;
  tracks?: ChatSessionTracksBag;
  error?: Error;
}

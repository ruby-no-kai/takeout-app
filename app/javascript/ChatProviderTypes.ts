import type { ChatSessionTracksBag } from "./Api";
import type { ChatSession } from "./ChatSession";

export interface ChatProviderContextData {
  session?: ChatSession;
  tracks?: ChatSessionTracksBag;
  error?: Error;
}

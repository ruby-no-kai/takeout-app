import type { ChatMessage } from "./Api";
import type { ChatUpdate } from "./ChatSession";

const HISTORY_LENGTH = 100;

export class ChatLog {
  messages: ChatMessage[];
  onUpdate: (history: ChatMessage[]) => void;

  constructor() {
    this.messages = [];
    this.onUpdate = (_) => {};
  }

  public reverseMerge(newHistory: ChatMessage[]) {
    const existingHistory = this.messages;
    const messages = newHistory.slice(0);

    const knownIDs = new Map<string, boolean>(messages.map((v) => [v.id, true]));
    console.log("mergeChatHistory", { existingHistory, knownIDs, newHistory });

    existingHistory.forEach((v) => {
      if (!knownIDs.has(v.id)) messages.push(v);
    });

    messages.sort(sortChatHistoryNewestFirst);
    this.messages = messages;

    this.mayFlush();
    this.inform();
  }

  public append(update: ChatUpdate) {
    console.log("chatLog#append", update);

    if (!update.message) throw "updateChatHistory: ChatUpdate#message is falsy";
    const message = update.message;

    console.log("updateChatHistory", { existingHistory: this.messages, update });
    switch (update.kind) {
      case "CREATE_CHANNEL_MESSAGE":
        const present =
          this.messages.findIndex((v) => {
            v.id === message.id;
          }) !== -1;
        if (!present && update.message.content !== "") {
          this.messages.splice(0, 0, message);
        }
        break;
      case "DELETE_CHANNEL_MESSAGE":
        this.messages.forEach((v, i) => {
          if (v.id === message.id) this.messages[i].redacted = true;
        });
        break;
      case "REDACT_CHANNEL_MESSAGE":
      case "UPDATE_CHANNEL_MESSAGE":
        this.messages.forEach((v, i) => {
          if (v.id === message.id) {
            this.messages[i] = message;
          }
        });
        break;
      default:
        throw `updateChatHistory got unsupported update kind=${update.kind}`;
    }
    if (update.message?.adminControl?.flush) {
      this.mayFlush();
    } else {
      this.messages = this.messages.slice(0, HISTORY_LENGTH);
    }
    this.inform();
  }

  inform() {
    this.onUpdate(this.messages);
  }

  mayFlush() {
    const mergedTrimedHistory = this.messages.slice(0, HISTORY_LENGTH);
    const flushIndex = mergedTrimedHistory.findIndex((v) => v.adminControl?.flush);

    if (flushIndex === -1) {
      this.messages = mergedTrimedHistory;
    } else {
      this.messages = mergedTrimedHistory.slice(0, flushIndex);
    }
  }
}

function sortChatHistoryNewestFirst(a: ChatMessage, b: ChatMessage) {
  return b.timestamp - a.timestamp;
}

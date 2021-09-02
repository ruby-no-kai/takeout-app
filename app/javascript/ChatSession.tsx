import { Credentials as AWSCredentials } from "@aws-sdk/types";
import {
  ChimeClient,
  ListChannelMessagesCommand,
  SendChannelMessageCommand,
  GetMessagingSessionEndpointCommand,
  ChannelMessageSummary,
} from "@aws-sdk/client-chime";

//import * as Chime from "aws-sdk/clients/chime";
//import * as AWS from "aws-sdk/global";

import dayjs from "dayjs";

import { ChimeSigV4Null } from "./polyfill/chimesigv4";
import { ChimeV4MessagingSession } from "./polyfill/chimesession";

import { ConsoleLogger, Message as ChimeMessage, LogLevel, MessagingSessionConfiguration } from "amazon-chime-sdk-js";
import type { DefaultMessagingSession } from "amazon-chime-sdk-js";

import { ChannelArn, GetChatSessionResponse, ChatMessage, ChatAdminControl, ChatSender, ChatSenderFlags } from "./Api";
import { makeWeakCallback } from "./weakcallback";

// https://docs.aws.amazon.com/chime/latest/APIReference/API_ChannelMessage.html
// ChannelMessageSummary & {ChannelArn + Persistence}
interface ChimeChannelMessage extends ChannelMessageSummary {
  ChannelArn: ChannelArn;
}

export const ADMIN_NAME = "RubyKaigi";

export type ChatStatus = "INIT" | "READY" | "CONNECTING" | "CONNECT_ERROR" | "CONNECTED" | "SHUTTING_DOWN";

export type ChatUpdateKind =
  | "CREATE_CHANNEL_MESSAGE"
  | "UPDATE_CHANNEL_MESSAGE"
  | "DELETE_CHANNEL_MESSAGE"
  | "REDACT_CHANNEL_MESSAGE";

export interface ChatUpdate {
  kind: ChatUpdateKind;
  message: ChatMessage;
}

interface AdminMessage {
  message?: string;
  control?: ChatAdminControl;
}

export class ChatSession {
  public status: ChatStatus;
  public error: Error | null;
  sessionData: GetChatSessionResponse | null;
  sessionDataEpoch: number;
  sessionDataEpochConnected: number | null;
  adminArn?: string;

  chime?: ChimeClient;
  messagingSession: DefaultMessagingSession | null;

  statusSubscribers: Array<(status: ChatStatus, error: Error | null) => void>;
  messageSubscribers: Map<ChannelArn, Array<(update: ChatUpdate) => void>>;

  constructor() {
    this.status = "INIT";
    this.error = null;
    this.sessionData = null;
    this.sessionDataEpoch = 0;
    this.sessionDataEpochConnected = null;
    this.messagingSession = null;
    this.statusSubscribers = [];
    this.messageSubscribers = new Map();
  }

  // Note: Updated session data will be used for any reconnections
  public setSessionData(sessionData: GetChatSessionResponse) {
    console.log("ChatSession: updated sessionData", sessionData);
    this.sessionData = sessionData;
    this.adminArn = sessionData.app_user_arn;
    this.sessionDataEpoch++;
    this.generateChimeClient();
    //console.log({ sessionData, sessionDataEpoch: this.sessionDataEpoch });
    if (this.sessionDataEpoch === 1) this.updateStatus("READY");
  }

  public subscribeStatus(callback: (status: ChatStatus, error: Error | null) => void) {
    const cb = makeWeakCallback(callback);
    this.statusSubscribers.push(cb);
    return () => {
      this.statusSubscribers = this.statusSubscribers.filter((v) => v !== cb);
    };
  }

  public subscribeMessageUpdate(channel: ChannelArn, callback: (update: ChatUpdate) => void) {
    const cb = makeWeakCallback(callback);
    if (!this.messageSubscribers.has(channel)) this.messageSubscribers.set(channel, []);
    this.messageSubscribers.get(channel)!.push(cb);
    console.log("subs", channel, this.messageSubscribers.get(channel));
    return () => {
      const newSubs = this.messageSubscribers.get(channel)!.filter((v) => v !== cb);
      if (newSubs) this.messageSubscribers.set(channel, newSubs);
    };
  }

  // Returns last 50 messages (descending order based on time created)
  public async getHistory(channel: ChannelArn) {
    if (!this.chime) throw "cannot retrieve history without session data";
    if (!this.sessionData) throw "cannot retrieve history without session data";

    const resp = await this.chime.send(
      new ListChannelMessagesCommand({
        ChimeBearer: this.sessionData.user_arn,
        ChannelArn: channel,
        SortOrder: "DESCENDING",
        MaxResults: 50,
      }),
    );
    const updates = (resp.ChannelMessages ?? []).map((v) => this.mapChannelMessage(channel, v));
    return updates.filter((v): v is ChatMessage => !!v);
  }

  public async postMessage(channel: ChannelArn, content: string) {
    if (!this.chime) throw "cannot post without session data";
    if (!this.sessionData) throw "cannot post without session data";

    const resp = await this.chime.send(
      new SendChannelMessageCommand({
        ChimeBearer: this.sessionData.user_arn,
        ChannelArn: channel,
        Content: content,
        Type: "STANDARD",
        Persistence: "PERSISTENT",
      }),
    );
    return resp.MessageId;
  }

  // Returns promise that is resolved after connection attempt has been initiated
  public async connect() {
    if (!this.sessionData || !this.chime) throw "cannot initiate connection without session data";
    if (this.status !== "READY" && this.status !== "SHUTTING_DOWN") throw "cannot connect at this moment";

    this.updateStatus("CONNECTING");
    this.sessionDataEpochConnected = this.sessionDataEpoch;
    const sessionData = this.sessionData;
    try {
      const logger = new ConsoleLogger("SDK", LogLevel.INFO);
      const endpoint = await this.chime.send(new GetMessagingSessionEndpointCommand({}));

      const config = new MessagingSessionConfiguration(
        sessionData.user_arn,
        null, // generate session id on SDK
        endpoint.Endpoint!.Url!,
        null, //new Chime({ region: "us-east-1", credentials: new AWS.Credentials(this.buildAwsCredentials()) }),
        null, //AWS,
      );
      const sigv4 = new ChimeSigV4Null(this.buildAwsCredentials());
      this.messagingSession = new ChimeV4MessagingSession(config, logger, undefined, undefined, sigv4);
      //this.messagingSession = new DefaultMessagingSession(config, logger);

      this.messagingSession.addObserver({
        messagingSessionDidStart: this.onStart.bind(this),
        messagingSessionDidStartConnecting: this.onConnecting.bind(this),
        messagingSessionDidStop: this.onStop.bind(this),
        messagingSessionDidReceiveMessage: this.onMessage.bind(this),
      });

      this.messagingSession.start();
    } catch (e) {
      this.updateStatus("CONNECT_ERROR", e);
    }
  }

  public disconnect() {
    if (!this.messagingSession) return;
    this.updateStatus("SHUTTING_DOWN");
    this.messagingSession.stop();
  }

  updateStatus(status: ChatStatus, error?: Error | null) {
    this.status = status;
    if (error !== undefined) this.error = error;

    this.statusSubscribers = this.statusSubscribers.filter((fn) => fn(this.status, this.error));
  }

  buildAwsCredentials(): AWSCredentials {
    if (!this.sessionData) throw "cannot build credentials without session data";
    return {
      accessKeyId: this.sessionData.aws_credentials.access_key_id,
      secretAccessKey: this.sessionData.aws_credentials.secret_access_key,
      sessionToken: this.sessionData.aws_credentials.session_token,
      expiration: new Date(this.sessionData.expiry * 1000),
    };
  }

  generateChimeClient() {
    this.chime = new ChimeClient({
      region: "us-east-1",
      credentials: this.buildAwsCredentials(),
    });
  }

  onStart() {
    this.updateStatus("CONNECTED", null);
  }

  onConnecting(reconnecting: boolean) {
    if (reconnecting && this.sessionDataEpoch !== this.sessionDataEpochConnected) {
      this.disconnect();
      this.connect();
    }
    const e = reconnecting ? new Error("Reconnecting...") : null;
    this.updateStatus("CONNECTING", e);
  }

  // Note: CloseEvent given by WebSocket, but SDK ensures callback called only on explicit close action
  onStop(_e: CloseEvent) {
    if (this.status === "SHUTTING_DOWN") this.updateStatus("READY", null);
  }

  onMessage(message: ChimeMessage) {
    try {
      const messageType = message.headers["x-amz-chime-event-type"];
      const record = JSON.parse(message.payload);
      console.log("Incoming Message", message);
      // https://docs.aws.amazon.com/chime/latest/dg/websockets.html#receive-messages
      switch (messageType) {
        case "CREATE_CHANNEL_MESSAGE":
        case "REDACT_CHANNEL_MESSAGE":
        case "UPDATE_CHANNEL_MESSAGE":
        case "DELETE_CHANNEL_MESSAGE":
          // https://docs.aws.amazon.com/chime/latest/APIReference/API_ChannelMessage.html
          const channelMessage = record as ChimeChannelMessage;
          this.onChannelMessage(messageType, channelMessage);
          break;
        default:
          console.log(`Ignoring messageType=${messageType}`);
      }
    } catch (e) {
      // TODO: raven
      console.error("Error while handling message", e);
    }
  }

  onChannelMessage(kind: ChatUpdateKind, message: ChimeChannelMessage) {
    if (message.Type !== "STANDARD") {
      console.warn("Ignoring message.Type!=STANDARD", { kind, message });
      return;
    }
    if (!message.ChannelArn) {
      console.warn("Ignoring !message.ChannelArn", { kind, message });
      return;
    }

    const channel = message.ChannelArn;
    const chatMessage = this.mapChannelMessage(channel, message);
    if (!chatMessage) return;

    const update = { message: chatMessage, kind };

    const subs = this.messageSubscribers.get(channel);
    console.log("Publishing message update", { channel, update, subs });
    if (subs) {
      this.messageSubscribers.set(
        channel,
        subs.filter((v) => v(update)),
      );
    }
  }

  mapChannelMessage(channel: ChannelArn, message: ChannelMessageSummary) {
    if (!message.MessageId) {
      console.warn("message missing ID", channel, message);
      return null;
    }
    if (!message.Content) {
      console.warn("message missing content", channel, message);
      return null;
    }
    if (!message.Sender || !message.Sender.Arn || !message.Sender.Name) {
      console.warn("message missing sender", channel, message);
      return null;
    }

    const isAdmin = message.Sender.Arn == this.adminArn;
    const { name, version, flags } = isAdmin
      ? { name: ADMIN_NAME, version: "0", flags: { isAdmin: true } }
      : parseChimeName(message.Sender.Name);

    const sender: ChatSender = {
      handle: message.Sender.Arn.replace(/^.+\/user\//, ""),
      version,
      name,
      ...flags,
    };

    const [content, adminControl] = isAdmin ? parseAdminMessage(message.Content) : [message.Content, null];

    const update: ChatMessage = {
      channel,
      id: message.MessageId,
      content: content,
      sender,
      timestamp: dayjs(message.CreatedTimestamp ? new Date(message.CreatedTimestamp) : new Date()),
      redacted: message.Redacted === true,
      adminControl,
    };

    return update;
  }
}

const CHIME_NAME_PATTERN = /^a!([tf]+)!([a-zA-Z0-9]+)\|(.*)$/;
// Parse ChimeUser#chime_name back to structure
function parseChimeName(chimeName: string): { name: string; version: string; flags: ChatSenderFlags } {
  const match = CHIME_NAME_PATTERN.exec(chimeName);
  if (!match) {
    console.warn("Cannot parse chimeName", chimeName);
    return { name: chimeName, version: "-", flags: {} };
  } else {
    const flagsStr = match[1];
    const version = match[2];
    const name = match[3];

    return {
      name,
      version,
      flags: {
        isAnonymous: name === "", // !attendee.ready? may have this name
        isStaff: flagsStr[0] == "t",
        isSpeaker: flagsStr[1] == "t",
        isCommitter: flagsStr[2] == "t",
      },
    };
  }
}

function parseAdminMessage(message: string): [string | null, ChatAdminControl | null] {
  const adminMessage: AdminMessage = JSON.parse(message);
  return [adminMessage.message ?? null, adminMessage.control ?? null];
}

export default ChatSession;

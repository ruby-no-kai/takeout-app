import useSWR from "swr";
import { mutate } from "swr";
import * as Rails from "@rails/ujs";
import dayjs from "dayjs";

import { CACHE_BUSTER } from "./meta";

import { useState, useEffect, useMemo } from "react";

const API_CONFERENCE = `/api/conference?p=${CACHE_BUSTER}`;
const PSEUDO_TRACK_SLUGS: TrackSlug[] = ["_screen"];

export class ApiError extends Error {
  public localError: Error;
  public remoteError: object | null;

  constructor(localError: Error, remoteError: object | null, ...params: any[]) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
    const j = JSON.stringify(remoteError);
    this.name = localError.name;
    this.message = `${localError.message}, ${j}`;
    this.localError = localError;
    this.remoteError = remoteError;
  }
}

export async function request(path: string, method: string, query: object | null, payload: object | null) {
  let url = path;

  const headers = new Headers();
  const opts: RequestInit = {
    method: method,
    headers: headers,
    credentials: "include",
  };
  if (query) {
    const queryParams = [];
    for (const [k, v] of Object.entries(query)) {
      const snakeK = k.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
      queryParams.push(`${snakeK}=${encodeURIComponent(v as string)}`);
    }
    url += `?${queryParams.join("&")}`;
  }

  headers.append("X-Csrf-Token", Rails.csrfToken() || "");
  headers.append("Accept", "application/json");
  if (payload) {
    opts.body = JSON.stringify(payload);
    headers.append("Content-Type", "application/json");
  }
  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const contentType = resp.headers.get("Content-Type");

    let err;
    if (contentType && contentType.match(/^application\/json(;.+)?$/)) {
      err = new ApiError(new Error(`${path} returned error ${resp.status}`), await resp.json());
    } else {
      const text = (await resp.text()).slice(0, 280);
      err = new ApiError(new Error(`${path} returned error ${resp.status}: ${text}`), null);
    }
    console.error(err.localError, err.remoteError);
    throw err;
  }
  return resp;
}

function determineEarliestCandidateActivationAt(data: GetConferenceResponse) {
  const timestamps = data.conference.track_order
    .map((slug) => data.conference.tracks[slug]?.card_candidate?.at)
    .filter((v): v is number => !!v);
  if (timestamps.length < 1) return undefined;
  const at = Math.min(...timestamps);
  if (at == Infinity || at == NaN) return undefined;
  return at;
}

export function consumeIvsMetadata(metadata: IvsMetadata) {
  console.log("consumeIvsMetadata", metadata);
  // TODO: viewerCount
  if (metadata.outpost) {
    consumeOutpostNotification(metadata.outpost);
  }
}

export function consumeChatAdminControl(adminControl: ChatAdminControl) {
  console.log("consumeChatAdminControl", adminControl);
  if (adminControl.pin) {
    mutate(
      `/api/tracks/${encodeURIComponent(adminControl.pin.track)}/chat_message_pin`,
      { track: adminControl.pin.track, pin: adminControl.pin },
      false,
    );
  }
  if (adminControl.outpost) {
    consumeOutpostNotification(adminControl.outpost);
  }
}

function consumeOutpostNotification(outpost: OutpostNotification) {
  if (outpost.conference) {
    console.log("outpost.conference", outpost.conference);
    mutate(
      API_CONFERENCE,
      async (_known: GetConferenceResponse) => {
        const resp = await request(`/outpost/${outpost.conference}`, "GET", null, null);
        console.log("outpost.conference/mutate", outpost.conference);
        return (await resp.json()) as GetConferenceResponse;
      },
      {
        revalidate: false,
      },
    );
  }
}

function activateCandidateTrackCard(data: GetConferenceResponse) {
  console.log("Start activating candidate TrackCard");
  const now = dayjs().unix();
  let updated = false;
  for (const [, track] of Object.entries(data.conference.tracks)) {
    const candidate = track.card_candidate;
    if (!candidate) continue;
    if (now >= candidate.at) {
      console.log(`Activating candidate TrackCard for track=${track.slug}`, track.card_candidate);
      updated = true;
      track.card = candidate;
      track.card_candidate = null;
    } else {
      console.log(`Skipping candidate activation for track=${track.slug}`, track.card_candidate);
    }
  }
  if (updated) {
    console.log("Mutating /api/conference due to candidate TrackCard activation");
    mutate(API_CONFERENCE, { ...data }, false);
  }
}

export async function swrFetcher(url: string) {
  return (await request(url, "GET", null, null)).json();
}

export type Attendee = {
  id: number;
  name: string;
  avatar_url: string;
  is_ready: boolean;
  is_staff: boolean;
  is_speaker: boolean;
  is_committer: boolean;

  is_sponsor?: boolean;
  presentation_slugs?: string[];
};

export type Conference = {
  default_track: string;
  track_order: TrackSlug[];
  tracks: { [key: TrackSlug]: Track };
};

export type TrackSlug = string;

export type Track = {
  slug: TrackSlug;
  name: string;
  interpretation: boolean;
  chat: boolean;
  card: TrackCard | null;
  card_candidate: TrackCard | null;
  spotlights: ChatSpotlight[];
  presences: { [key in TrackStreamKind]: StreamPresence }; // key:kind
  viewerCount?: ViewerCount;
};

export type TrackCard = TrackCardHeader & TrackCardContent;

export type TrackCardHeader = {
  track: TrackSlug;
  at: number; // activation at
  ut: number; // updated at
};
export type TrackCardContent = {
  interpretation?: boolean;
  topic?: Topic | null;
  speakers?: Speaker[] | null;

  screen?: ScreenControl;
  upcoming_topics?: UpcomingTopic[];
};

export type Topic = {
  title: string | null;
  author: string | null;
  description: string | null;
  labels: string[];
};

export type Speaker = {
  name: string;
  github_id: string | null;
  twitter_id: string | null;
  avatar_url: string;
};

export type ScreenControl = {
  filler?: boolean;
  heading?: string;
  next_schedule?: ScreenNextSchedule;
  footer?: string;
};

export type ScreenNextSchedule = {
  at: number;
  title: string;
  absolute_only?: boolean;
};

export type UpcomingTopic = {
  track: TrackSlug;
  at: number;
  topic?: Topic | null;
  speakers: Speaker[] | null;
};

export type ChatSpotlight = {
  id: number;
  track: TrackSlug;
  starts_at: number;
  ends_at: number | null;
  handles: ChatHandle[];
  updated_at: number;

  _removed?: boolean;
};

export type ChatSpotlightRemoval = { id: number };

export type TrackStreamOptions = {
  interpretation: boolean;
  caption: boolean;
  chat: boolean;
};

export type TrackStreamOptionsState = [TrackStreamOptions, (x: TrackStreamOptions) => void];

export type StreamInfo = {
  slug: TrackSlug;
  type: string;
  url: string;
  expiry: number;
};

export type ChannelArn = string;

export type TrackChatInfo = {
  channel_arn: ChannelArn;
  caption_channel_arn?: ChannelArn;
};

export type AwsCredentials = {
  access_key_id: string;
  secret_access_key: string;
  session_token: string;
};

export type GetSessionResponse = {
  attendee: Attendee | null;
  control: boolean;
};

export type GetAppVersionResponse = {
  commit: string;
  release: string;
};

export type ChatSessionTracksBag = { [key: TrackSlug]: TrackChatInfo | null };

export type GetChatSessionResponse = {
  expiry: number;
  grace: number;
  app_arn: string;
  user_arn: string;
  app_user_arn: string;
  aws_credentials: AwsCredentials;
  tracks: ChatSessionTracksBag;
};

export type GetConferenceResponse = {
  requested_at: number;
  stale_after: number;
  conference: Conference;
};

export type CreateSessionResponse = {
  attendee: Attendee;
};

export type UpdateAttendeeResponse = {
  attendee: Attendee;
};

export type GetStreamResponse = {
  stream?: StreamInfo;
};

export type GetChatMessagePinResponse = {
  track: TrackSlug;
  pin: ChatMessagePin | null;
};

export type ChatMessage = {
  channel: ChannelArn;
  content: string | null;
  sender: ChatSender;
  timestamp: number; // millis
  id: string;
  redacted: boolean;

  adminControl: ChatAdminControl | null;
};

export type ChatAdminControl = {
  flush?: boolean;
  pin?: ChatMessagePin;
  caption?: ChatCaption;
  promo?: boolean;

  outpost?: OutpostNotification;
};

export type OutpostNotification = {
  conference?: string;
};

export type ChatCaption = {
  result_id: string;
  is_partial: boolean;
  transcript: string;
};

// XXX: Determined and given at ChatSession
export type ChatSenderFlags = {
  isAdmin?: boolean;
  isAnonymous?: boolean;
  isStaff?: boolean;
  isSpeaker?: boolean;
  isCommitter?: boolean;
};

export type ChatHandle = string;

export interface ChatSender extends ChatSenderFlags {
  handle: ChatHandle;
  name: string;
  version: string;
}

export type ChatMessagePin = {
  at: number;
  track: TrackSlug;
  message: ChatMessage | null;
};

export type IvsMetadata = {
  outpost?: OutpostNotification;
};
type IvsMetadataItem = {
  n?: ViewerCount; // TODO:
};

export type IvsCardUpdate = {
  candidate?: boolean;
  clear?: TrackSlug;
  card: TrackCard | null;
};

export type TrackStreamKind = "main" | "interpretation";

export type StreamPresence = {
  track: TrackSlug;
  kind: TrackStreamKind;
  online: boolean;
  at: number;
};

export type ViewerCount = {
  track: TrackSlug;
  count: number;
  expiry: number;
};

export type GetConferenceSponsorshipsResponse = {
  conference_sponsorships: ConferenceSponsorship[];
};

export type ConferenceSponsorship = {
  id: number;
  sponsor_app_id: string;
  avatar_url: string;
  name: string;
  large_display: boolean;
  promo: string | null;
};

export const Api = {
  useSession() {
    return useSWR<GetSessionResponse, ApiError>("/api/session", swrFetcher, {
      revalidateOnFocus: false,
    });
  },

  useAppVersion() {
    return useSWR<GetAppVersionResponse, ApiError>("/api/app_version", swrFetcher, {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      focusThrottleInterval: 60000,
      refreshInterval: 90 * 1000, // TODO:
    });
  },

  useConference() {
    // TODO: Error handling
    console.log("useConference");
    const swr = useSWR<GetConferenceResponse, ApiError>(API_CONFERENCE, swrFetcher, {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      //focusThrottleInterval: 15 * 1000, // TODO:
    });
    let data = swr.data;

    // Schedule candidate TrackCard activation
    const overlayCardActivation = useSWR<{ timestamp: number }, ApiError>(
      "/outpost/.virtual/conference/overlay/activation",
      async (_x) => {
        return { timestamp: -1 };
      },
      { revalidateOnFocus: false, revalidateOnReconnect: false },
    );
    console.log("overlayCardActivation", overlayCardActivation.data);
    useEffect(() => {
      if (!data) return;
      const earliestCandidateActivationAt = determineEarliestCandidateActivationAt(data);
      if (!earliestCandidateActivationAt) return;
      const timeout = (earliestCandidateActivationAt - dayjs().unix()) * 1000 + 500;
      console.log(
        `Scheduling candidate TrackCard activation; earliest will happen at ${dayjs(
          new Date(earliestCandidateActivationAt * 1000),
        ).toISOString()}, in ${timeout / 1000}s`,
      );
      const timer = setTimeout(
        () =>
          mutate("/outpost/.virtual/conference/overlay/activation", async (_: unknown) => ({
            timestamp: earliestCandidateActivationAt,
          })),
        timeout,
      );
      return () => clearTimeout(timer);
    }, [data]);

    const data1: typeof swr.data = useMemo(() => {
      if (!swr.data) return swr.data;
      let now = dayjs().unix();
      const trackSlugs = [...swr.data.conference.track_order, ...PSEUDO_TRACK_SLUGS];
      let found = new Map<TrackSlug, boolean>();
      for (let i = 0; i < trackSlugs.length; i++) {
        let track = swr.data.conference.tracks[trackSlugs[i]];
        if (!track?.card_candidate) continue;
        if (track.card_candidate.at >= now) {
          found.set(trackSlugs[i], true);
        }
      }
      if (found) {
        const patched: GetConferenceResponse = JSON.parse(JSON.stringify(swr.data));
        found.forEach((_, trackSlug) => {
          const track = patched.conference.tracks[trackSlug]!;
          patched.conference.tracks[trackSlug]!.card = track.card_candidate!;
          patched.conference.tracks[trackSlug]!.card_candidate = null;
        });
        return patched;
      } else {
        return swr.data;
      }
    }, [swr.data, overlayCardActivation.data?.timestamp]);

    return { ...swr, data: data1 };
  },

  // XXX: this is not an API
  useTrackStreamOptions(): TrackStreamOptionsState {
    const browserStateKey = "rk-takeout-app--TrackStreamOption";
    let options: TrackStreamOptions = { interpretation: false, caption: false, chat: true };

    const browserState = window.localStorage?.getItem(browserStateKey);
    if (browserState) {
      try {
        options = JSON.parse(browserState);
      } catch (e) {
        console.warn(e);
      }
      if (!options.hasOwnProperty("chat")) {
        options.chat = true;
      }
    } else {
      const acceptJapanese = navigator.languages.findIndex((v) => /^ja($|-)/.test(v)) !== -1;
      options.interpretation = !acceptJapanese;
    }

    const [state, setState] = useState(options);

    return [
      state,
      (x: TrackStreamOptions) => {
        try {
          window.localStorage?.setItem(browserStateKey, JSON.stringify(x));
        } catch (e) {
          console.warn(e);
        }
        setState(x);
      },
    ];
  },

  async createSession(email: string, reference: string): Promise<CreateSessionResponse> {
    const resp = await request("/api/session", "POST", null, {
      email,
      reference,
    });
    mutate("/api/session");
    return resp.json();
  },

  async updateAttendee(name: string, gravatar_email: string): Promise<UpdateAttendeeResponse> {
    const resp = await request("/api/attendee", "PUT", null, {
      name,
      gravatar_email,
    });
    mutate("/api/session");
    return resp.json();
  },

  useStream(slug: TrackSlug, interpretation: boolean) {
    return useSWR<GetStreamResponse, ApiError>(
      `/api/streams/${slug}?interpretation=${interpretation ? "1" : "0"}`,
      swrFetcher,
      {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        focusThrottleInterval: 60 * 15 * 1000,
        compare(knownData, newData) {
          // Accept new data only if expired
          if (!knownData?.stream || !newData?.stream) return false;
          const now = dayjs().unix() + 180;

          return !(knownData.stream.expiry < newData.stream.expiry && knownData.stream.expiry <= now);
        },
      },
    );
  },

  useChatSession(attendeeId: number | undefined) {
    // attendeeId for cache buster
    return useSWR<GetChatSessionResponse, ApiError>(
      attendeeId ? `/api/chat_session?i=${attendeeId}&p=${CACHE_BUSTER}` : null,
      swrFetcher,
      {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        focusThrottleInterval: 60 * 40 * 1000,
        refreshInterval: 60 * 80 * 1000,
        refreshWhenHidden: false,
        refreshWhenOffline: false,
      },
    );
  },

  useChatMessagePin(track: TrackSlug | undefined) {
    return useSWR<GetChatMessagePinResponse, ApiError>(
      track ? `/api/tracks/${encodeURIComponent(track)}/chat_message_pin` : null,
      swrFetcher,
      {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        focusThrottleInterval: 60 * 1000,
      },
    );
  },

  async sendChatMessage(track: TrackSlug, message: string, asAdmin?: boolean) {
    const resp = await request(`/api/tracks/${encodeURIComponent(track)}/chat_messages`, "POST", null, {
      message,
      as_admin: !!asAdmin,
    });
    return resp.json();
  },

  async pinChatMessage(track: TrackSlug, chatMessage: ChatMessage | null) {
    const resp = await request(`/api/tracks/${encodeURIComponent(track)}/chat_admin_message_pin`, "PUT", null, {
      chat_message: chatMessage,
    });
    return resp.json();
  },

  async createCaptionChatMembership(track: TrackSlug) {
    const resp = await request(`/api/tracks/${encodeURIComponent(track)}/caption_chat_membership`, "POST", null, {});
    return resp.json();
  },

  async deleteCaptionChatMembership(track: TrackSlug) {
    const resp = await request(`/api/tracks/${encodeURIComponent(track)}/caption_chat_membership`, "DELETE", null, {});
    return resp.json();
  },

  useConferenceSponsorships() {
    return useSWR<GetConferenceSponsorshipsResponse, ApiError>(
      `/api/conference_sponsorships?p=${CACHE_BUSTER}`,
      swrFetcher,
    );
  },
};

export default Api;

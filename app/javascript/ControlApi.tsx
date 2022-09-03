import {
  request,
  swrFetcher,
  ApiError,
  TrackSlug,
  TrackCard,
  Attendee,
  StreamPresence,
  TrackStreamKind,
  ChatSpotlight,
} from "./Api";
import useSWR from "swr";
import { mutate } from "swr";

export type ConferencePresentationSlug = string;
export type ConferenceSpeakerSlug = string;
export type ConferencePresentationKind = "keynote" | "presentation";
export type ConferencePresentationLanguage = "EN" | "JA" | "EN & JA";

export type ConferencePresentation = {
  slug: ConferencePresentationSlug;
  title: string;
  kind: ConferencePresentationKind;
  language: ConferencePresentationLanguage;
  description: string;
  speaker_slugs: ConferenceSpeakerSlug[];
};

export type ConferenceSpeaker = {
  slug: ConferenceSpeakerSlug;
  name: string;
  github_id: string | null;
  twitter_id: string | null;
  avatar_url: string;
};

export type Ticket = {
  id: number;
  tito_id: number;
  slug: string;
  reference: string;
  state: string;
  first_name: string;
  last_name: string;
  release_slug: string;
  release_title: string;
  admin_url: string;
  tito_updated_at: number;
};

export type ChimeUser = {};

export type ControlGetConferenceResponse = {
  presentations: { [key: string]: ConferencePresentation };
  speakers: { [key: string]: ConferenceSpeaker };
};

export type ControlColleration = {
  id: number;
  description: string;
};

export type ControlTrackCardHeader = {
  id: number;
  control_colleration?: ControlColleration | null;
};

export type ControlTrackCard = TrackCard & ControlTrackCardHeader;

export type ControlGetTrackCardsResponse = {
  track_cards: ControlTrackCard[];
};

export type ControlListAttendeesResponse = {
  items: ControlListAttendeeItem[];
};

export type ControlListAttendeeItem = {
  ticket: Ticket;
  attendee: Attendee;
  chime_user: ChimeUser | null;
};
export type ControlGetAttendeeResponse = ControlListAttendeeItem;

export type ControlUpdateAttendeeRequest = {
  attendee: ControlUpdateAttendeeRequestAttendee;
};
export type ControlUpdateAttendeeRequestAttendee = {
  name: string;
  is_staff: boolean;
  is_speaker: boolean;
  is_committer: boolean;
  presentation_slugs: string[];
};

// https://docs.aws.amazon.com/ivs/latest/APIReference/API_Stream.html
export type ControlIvsStream = {
  channel_arn: string;
  health: "HEALTHY" | "STARVING" | "UNKNOWN";
  playback_url: string;
  start_time: string;
  state: "LIVE" | "OFFLINE";
  stream_id: string;
  viewer_count: number;
};
export type ControlGetTrackStreamPresencesResponse = {
  at: number;
  // value is null when a ivs channel for a kind is not configured.
  stream_presences: { [key in TrackStreamKind]: StreamPresence | null };
  // value is null when a IVS GetChannel API responded ChannelNotBroadcasting error.
  stream_statuses: { [key in TrackStreamKind]: ControlIvsStream | null };
};

export type ControlChatSpotlightHeader = {
  control_colleration?: ControlColleration | null;
};
export type ControlChatSpotlight = ChatSpotlight & ControlChatSpotlightHeader;

export type ControlGetControlCollerationResponse = {
  colleration: ControlColleration;
  track_cards: ControlTrackCard[];
  chat_spotlights: ControlChatSpotlight[];
};
export type ControlDeleteControlCollerationResponse = {
  track_cards: ControlTrackCard[];
  chat_spotlights: ControlChatSpotlight[];
};

export type ControlGetChatSpotlightsResponse = {
  chat_spotlights: ControlChatSpotlight[];
};

export type ControlCreateNextSessionRequest = {
  next_sessions: { track: TrackSlug; presentation: ConferencePresentationSlug }[];
  activation_at: number;
  description: string;
};
export type ControlCreateNextSessionResponse = {
  ok: boolean;
  control_colleration: ControlColleration;
  track_cards: ControlTrackCard[];
  chat_spotlights: ControlChatSpotlight[];
};

export const ControlApi = {
  useConference() {
    return useSWR<ControlGetConferenceResponse, ApiError>("/api/control/conference", swrFetcher, {
      revalidateOnFocus: false,
    });
  },

  async createControlSession(password: string) {
    const resp = await request("/api/session/take_control", "POST", null, {
      password,
    });
    mutate("/api/session");
    return resp.json();
  },

  // returns current and candidate trackcards
  useTrackCards(slug: TrackSlug) {
    return useSWR<ControlGetTrackCardsResponse, ApiError>(
      `/api/control/tracks/${encodeURIComponent(slug)}/cards`,
      swrFetcher,
    );
  },

  async createTrackCard(card: TrackCard) {
    const url = `/api/control/tracks/${encodeURIComponent(card.track)}/cards`;
    const resp = await request(url, "POST", null, {
      track_card: card,
    });
    mutate(url);
    return resp.json();
  },

  async deleteTrackCard(card: ControlTrackCard) {
    const url = `/api/control/tracks/${encodeURIComponent(card.track)}/cards/${encodeURIComponent(card.id)}`;
    const resp = await request(url, "DELETE", null, {});
    mutate(`/api/control/tracks/${encodeURIComponent(card.track)}/cards`);
    return resp.json();
  },

  useAttendeeList(query: string | null) {
    return useSWR<ControlListAttendeesResponse, ApiError>(
      query !== null ? `/api/control/attendees?query=${encodeURIComponent(query)}` : null,
      swrFetcher,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );
  },

  useAttendee(id: number) {
    return useSWR<ControlGetAttendeeResponse, ApiError>(id ? `/api/control/attendees/${id}` : null, swrFetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });
  },

  async updateAttendee(id: number, params: ControlUpdateAttendeeRequestAttendee) {
    const url = `/api/control/attendees/${id}`;
    const resp = await request(url, "PUT", null, { attendee: params });
    mutate(`/api/control/attendees/${id}`);
    return resp.json();
  },

  useTrackStreamPresence(slug: TrackSlug) {
    return useSWR<ControlGetTrackStreamPresencesResponse, ApiError>(
      `/api/control/tracks/${encodeURIComponent(slug)}/stream_presence`,
      swrFetcher,
      {
        refreshInterval: 30000,
        focusThrottleInterval: 30000,
      },
    );
  },

  async updateTrackStreamPresence(slug: TrackSlug, kind: TrackStreamKind, online: boolean) {
    const url = `/api/control/tracks/${encodeURIComponent(slug)}/stream_presence?kind=${encodeURIComponent(kind)}`;
    const resp = await request(url, "PUT", null, { online });
    mutate(`/api/control/tracks/${encodeURIComponent(slug)}/stream_presence`);
    return resp.json();
  },

  useControlColleration(id: number | undefined | null) {
    return useSWR<ControlGetControlCollerationResponse, ApiError>(
      id ? `/api/control/control_collerations/${id}` : null,
      swrFetcher,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
    );
  },

  async deleteControlColleration(id: number) {
    //return useSWR<ControlDeleteControlCollerationResponse, ApiError
    const url = `/api/control/control_collerations/${id}`;
    const resp = await request(url, "DELETE", null, {});
    const data = (await resp.json()) as ControlDeleteControlCollerationResponse;

    const cardTracks = new Map<TrackSlug, boolean>();
    data.track_cards.forEach((v) => {
      cardTracks.set(v.track, true);
    });
    cardTracks.forEach((_, slug) => {
      mutate(`/api/control/tracks/${encodeURIComponent(slug)}/cards`);
    });
    const spotlightTracks = new Map<TrackSlug, boolean>();
    data.chat_spotlights.forEach((v) => {
      spotlightTracks.set(v.track, true);
    });
    spotlightTracks.forEach((_, slug) => {
      mutate(`/api/control/tracks/${encodeURIComponent(slug)}/spotlights`);
    });
    return data;
  },

  useChatSpotlights(slug: TrackSlug) {
    return useSWR<ControlGetChatSpotlightsResponse, ApiError>(
      `/api/control/tracks/${encodeURIComponent(slug)}/chat_spotlights`,
      swrFetcher,
    );
  },
  async deleteChatSpotlight(spotlight: ControlChatSpotlight) {
    const url = `/api/control/tracks/${encodeURIComponent(spotlight.track)}/chat_spotlights/${encodeURIComponent(
      spotlight.id,
    )}`;
    const resp = await request(url, "DELETE", null, {});
    mutate(`/api/control/tracks/${encodeURIComponent(spotlight.track)}/chat_spotlights`);
    return resp.json();
  },

  async createNextSession(req: ControlCreateNextSessionRequest) {
    const url = `/api/control/next_session`;
    const resp = await request(url, "POST", null, req);
    return resp.json() as Promise<ControlCreateNextSessionResponse>;
  },
};
export default ControlApi;

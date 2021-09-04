import { request, swrFetcher, ApiError, TrackSlug, TrackCard, Attendee } from "./Api";
import useSWR from "swr";
import { mutate } from "swr";

export type ConferencePresentationSlug = string;
export type ConferenceSpeakerSlug = string;
export type ConferencePresentationKind = "keynote" | "presentation";
export type ConferencePresentationLanguage = "EN" | "JA" | "EN & JA";

export interface ConferencePresentation {
  slug: ConferencePresentationSlug;
  title: string;
  kind: ConferencePresentationKind;
  language: ConferencePresentationLanguage;
  description: string;
  speaker_slugs: ConferenceSpeakerSlug[];
}

export interface ConferenceSpeaker {
  slug: ConferenceSpeakerSlug;
  name: string;
  github_id: string | null;
  twitter_id: string | null;
  avatar_url: string;
}

export interface Ticket {
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
}

export interface ChimeUser {}

export interface ControlGetConferenceResponse {
  presentations: { [key: string]: ConferencePresentation };
  speakers: { [key: string]: ConferenceSpeaker };
}

export interface ControlGetTrackCardsResponse {
  track_cards: TrackCard[];
}

export interface ControlListAttendeesResponse {
  items: ControlListAttendeeItem[];
}

export interface ControlListAttendeeItem {
  ticket: Ticket;
  attendee: Attendee;
  chime_user: ChimeUser | null;
}
export type ControlGetAttendeeResponse = ControlListAttendeeItem;

export interface ControlUpdateAttendeeRequest {
  attendee: ControlUpdateAttendeeRequestAttendee;
}
export interface ControlUpdateAttendeeRequestAttendee {
  name: string;
  is_staff: boolean;
  is_speaker: boolean;
  is_committer: boolean;
  presentation_slugs: string[];
}

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
};
export default ControlApi;

import { request, swrFetcher, ApiError, TrackSlug, TrackCard } from "./Api";
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

export interface ControlGetConferenceResponse {
  presentations: { [key: string]: ConferencePresentation };
  speakers: { [key: string]: ConferenceSpeaker };
}

export interface ControlGetTrackCardsResponse {
  track_cards: TrackCard[];
}

export const ControlApi = {
  useConference() {
    return useSWR<ControlGetConferenceResponse, ApiError>("/api/control/conference", swrFetcher, {
      revalidateOnFocus: false,
    });
  },

  useTrackCards(slug: TrackSlug) {
    return useSWR<ControlGetTrackCardsResponse, ApiError>(
      `/api/control/tracks/${encodeURIComponent(slug)}/cards`,
      swrFetcher,
    );
  },

  async createControlSession(password: string) {
    const resp = await request("/api/session/take_control", "POST", null, {
      password,
    });
    mutate("/api/session");
    return resp.json();
  },
};
export default ControlApi;

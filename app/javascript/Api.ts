import useSWR from "swr";
import { mutate } from "swr";
import * as Rails from "@rails/ujs";

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

async function request(
  path: string,
  method: string,
  query: object | null,
  payload: object | null
) {
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
      err = new ApiError(
        new Error(`${path} returned error ${resp.status}`),
        await resp.json()
      );
    } else {
      const text = (await resp.text()).slice(0, 280);
      err = new ApiError(
        new Error(`${path} returned error ${resp.status}: ${text}`),
        null
      );
    }
    console.error(err.localError, err.remoteError);
    throw err;
  }
  return resp;
}

async function swrFetcher(url: string) {
  return (await request(url, "GET", null, null)).json();
}

export interface Attendee {
  name: string;
  avatar_url: string;
  is_ready: boolean;
  is_staff: boolean;
  is_speaker: boolean;
  is_committer: boolean;
  is_sponsor: boolean;
}

export interface GetSessionResponse {
  attendee: Attendee | null;
}

export interface CreateSessionResponse {
  attendee: Attendee;
}

export const Api = {
  useSession() {
    const { data, error } = useSWR<GetSessionResponse, ApiError>(
      "/api/session",
      swrFetcher
    );
    return { session: data, error: error };
  },

  async createSession(
    email: string,
    reference: string
  ): Promise<CreateSessionResponse> {
    const resp = await request("/api/session", "POST", null, {
      email: email,
      reference: reference,
    });
    mutate("/api/session");
    return resp.json();
  },
};

export default Api;

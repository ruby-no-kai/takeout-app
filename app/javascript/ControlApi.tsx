import { request, swrFetcher, ApiError } from "./Api";
import useSWR from "swr";
import { mutate } from "swr";

export const ControlApi = {
  //useSession() {
  //  return useSWR<GetSessionResponse, ApiError>("/api/session", swrFetcher, {
  //    revalidateOnFocus: false,
  //  });
  //},

  async createControlSession(password: string) {
    const resp = await request("/api/session/take_control", "POST", null, {
      password,
    });
    mutate("/api/session");
    return resp.json();
  },
};
export default ControlApi;

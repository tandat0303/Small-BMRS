import type { LoginPayload } from "@/types";
import axiosConfig from "./axios";

export const authAPI = {
  login: async (payload: LoginPayload) => {
    const data = {
      ...payload,
      exponentPushToken: "NO_ACCESS_TO_NOTIFY",
      DeviceInfo: "web_meeting_room",
    };

    const res = await axiosConfig.post(`/auth/login`, data);

    const accessToken = res?.data.accessToken;

    const user = res?.data.user;

    const authenticated = res?.data.authenticated;

    if (!accessToken || !user || authenticated === false) {
      throw new Error("LOGIN_FAILED");
    }

    return { accessToken, user, authenticated };
  },
};

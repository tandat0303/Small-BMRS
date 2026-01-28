import type { LoginPayload } from "@/types";
import axiosConfig from "./axios";
import storage from "@/lib/storage";

export const login = async (payload: LoginPayload) => {
  const data = {
    ...payload,
    exponentPushToken: "NO_ACCESS_TO_NOTIFY",
    DeviceInfo: "web_meeting_room",
  };

  const res = await axiosConfig.post(`/auth/login`, data);

  const accessToken = res?.data.accessToken;

  const user = res?.data.user;

  if (!accessToken || !user) {
    throw new Error("LOGIN_FAILED");
  }

  storage.set("accessToken", accessToken);
  storage.set("user", user);

  return { accessToken, user };
};

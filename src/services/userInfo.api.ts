import type { UserInfoPayload } from "@/types";
import axiosConfig from "./axios";

export const userInfoAPI = {
  getUserInfo: async (payload: UserInfoPayload) => {
    try {
      const res = await axiosConfig.get(
        `/${payload.factory}/user/getUserInfo/${payload.userId}`,
      );
      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.message);
    }
  },
};

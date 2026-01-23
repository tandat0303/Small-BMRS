import type { Room } from "@/types";
import axiosConfig from "./axios";

const API_URL = import.meta.env.VITE_API_URL;

export const roomAPI = {
  getAllRooms: async (factory: string): Promise<Room[]> => {
    try {
      const res = await axiosConfig.get(
        `${API_URL}/bookmeeting/${factory}/getallroom`,
      );
      return res.data;
    } catch (error) {
      console.log("Lỗi khi lấy danh sách phòng", error);
      throw error;
    }
  },

  bookRoom: async (data: {
    roomId: number,
    userId: number,
    fullName: string,
    startTime: string,
    endTime: string,
    meetingName: string,
    meetingPurpose: string,
    department: string,
    hostName: string,
    substituteCard: string,
    substituteName: string,
    bpmNumber: string,
    daysOfWeek: string[],
  }): Promise<any> => {
    try {
      const response = await axiosConfig.post(`/bookmeeting/create`, data);
      return response.data;
    } catch (error) {
      console.error("Error booking room:", error);
      throw error;
    }
  },
};

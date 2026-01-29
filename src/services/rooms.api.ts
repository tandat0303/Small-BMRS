import type { BookingFormData, Room } from "@/types";
import axiosConfig from "./axios";

export const roomAPI = {
  getAllRooms: async (factory: string): Promise<Room[]> => {
    try {
      const res = await axiosConfig.get(`/bookmeeting/${factory}/getallroom`);
      return res.data;
    } catch (error) {
      console.log("Lỗi khi lấy danh sách phòng", error);
      throw error;
    }
  },

  bookRoom: async (data: BookingFormData): Promise<any> => {
    try {
      const response = await axiosConfig.post(`/bookmeeting/addmeeting/`, {
        meeting: data,
      });
      return response.data;
    } catch (error) {
      console.error("Error booking room:", error);
      throw error;
    }
  },

  checkBPMSign: async (bpmId: string): Promise<any> => {
    try {
      const response = await axiosConfig.get(
        `/bookmeeting/checkbpmsign/${bpmId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error checking bpm sign:", error);
      throw error;
    }
  },
};

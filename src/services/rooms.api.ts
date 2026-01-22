import type { Room, Meeting } from "@/types";
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
    roomId: number;
    userId: string;
    startTime: string;
    endTime: string;
    meetingName: string;
    department: string;
    hostName: string;
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

export const scheduleAPI = {
  getMySchedule: async (
    factory: string = 'LYV',
    userId: string
  ): Promise<Meeting[]> => {
    try {
      const response = await axiosConfig.get(
        `${API_URL}/bookmeeting/${factory}/${userId}/getmyschedule`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  },

  cancelSchedule: async (scheduleId: number): Promise<any> => {
    try {
      const response = await axiosConfig.delete(`/bookmeeting/cancel/${scheduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling schedule:', error);
      throw error;
    }
  },
};

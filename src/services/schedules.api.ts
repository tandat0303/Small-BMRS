import { setTimeToday } from "@/lib/helpers";
import axiosConfig from "./axios";
import type { Schedule } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

export const scheduleAPI = {
  getAllSchedulesOfRoom: async (roomId: number, date?: string): Promise<Schedule[]> => {
    try {
      const selectedDate = date || new Date().toISOString();
        const res = await axiosConfig.post(
            `${API_URL}/bookmeeting/${roomId}/getschedule`, {
              date: selectedDate,
            }
        );
        return res.data;
    } catch (error) {
        console.log("Lỗi khi lấy danh sách lịch trình", error);
        throw error;
    }
  },

  getTodaySchedules: async (factory: string, datestart?: string, dateend?: string): Promise<Schedule[]> => {
    const startTimeISO = setTimeToday(7);
    const endTimeISO = setTimeToday(17);

    try {
      const res = await axiosConfig.post(
        `${API_URL}/bookmeeting/${factory}/getschedulesearch`, {
          datestart: startTimeISO,
          dateend: endTimeISO,
        }
      );

      return res.data;
    } catch (error) {
        console.log("Lỗi khi lấy danh sách lịch trình", error);
        throw error;
    }
  },

  getMySchedule: async (
    factory: string,
    userId: string,
  ): Promise<Schedule[]> => {
    try {
      const response = await axiosConfig.get(
        `${API_URL}/bookmeeting/${factory}/${userId}/getmyschedule`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw error;
    }
  },

  cancelSchedule: async (scheduleId: number): Promise<any> => {
    try {
      const response = await axiosConfig.delete(
        `/bookmeeting/cancel/${scheduleId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error canceling schedule:", error);
      throw error;
    }
  },
};

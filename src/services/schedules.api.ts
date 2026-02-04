import dayjs from "dayjs";
import axiosConfig from "./axios";
import type {
  Schedule,
  UpdateSchedulePayload,
  UpdateScheduleResponse,
} from "@/types";

export const scheduleAPI = {
  getAllSchedulesOfRoom: async (
    roomId: number,
    date?: string,
  ): Promise<Schedule[]> => {
    try {
      const base = date ? dayjs(date) : dayjs();

      const selectedDateISO = base
        .startOf("day")
        .subtract(base.utcOffset(), "minute")
        .toISOString();

      const res = await axiosConfig.post(`/bookmeeting/${roomId}/getschedule`, {
        date: selectedDateISO,
      });

      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.message);
    }
  },

  getTodaySchedules: async (factory: string): Promise<Schedule[]> => {
    try {
      const startTimeISO = dayjs()
        .hour(7)
        .minute(0)
        .second(0)
        .format("YYYY-MM-DD HH:mm:ss");
      const endTimeISO = dayjs()
        .hour(17)
        .minute(0)
        .second(0)
        .format("YYYY-MM-DD HH:mm:ss");

      const res = await axiosConfig.post(
        `/bookmeeting/${factory}/getschedulesearch`,
        {
          datestart: startTimeISO,
          dateend: endTimeISO,
        },
      );

      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.message);
    }
  },

  getSchedulesByRange: async (
    factory: string,
    startDateTime: string,
    endDateTime: string,
  ): Promise<Schedule[]> => {
    try {
      const start = dayjs(startDateTime).format("YYYY-MM-DD HH:mm:ss");
      const end = dayjs(endDateTime).format("YYYY-MM-DD HH:mm:ss");

      const res = await axiosConfig.post(
        `/bookmeeting/${factory}/getschedulesearch`,
        {
          datestart: start,
          dateend: end,
        },
      );

      return res.data;
    } catch (error: any) {
      throw new Error(error?.response?.message);
    }
  },

  getMySchedule: async (
    factory: string,
    userId: string,
  ): Promise<Schedule[]> => {
    try {
      const response = await axiosConfig.get(
        `/bookmeeting/${factory}/${userId}/getmyschedule`,
      );
      return response.data;
    } catch (error: any) {
      if (error.code === "ECONNABORTED") {
        return [];
      }
      throw error;
    }
  },

  cancelSchedule: async (scheduleId: number): Promise<any> => {
    try {
      const response = await axiosConfig.put(
        `/bookmeeting/cancelmeeting/${scheduleId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error canceling schedule:", error);
      throw error;
    }
  },

  updateSchedule: async (
    scheduleId: number,
    payload: UpdateSchedulePayload,
  ): Promise<UpdateScheduleResponse> => {
    try {
      const response = await axiosConfig.post(
        `/bookmeeting/editschedule/${scheduleId}`,
        {
          meeting: payload,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error canceling schedule:", error);
      throw error;
    }
  },
};

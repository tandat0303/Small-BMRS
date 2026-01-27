import type { Schedule, Room } from "./../types/index";
import { roomAPI } from "./rooms.api";
import { scheduleAPI } from "./schedules.api";

export const factoryFilterAPI = {
  getRoomDataByFactory: async (
    factory: string,
  ): Promise<{ rooms: Room[]; schedules: Schedule[] }> => {
    try {
      const rooms = await roomAPI.getAllRooms(factory);

      const schedulePromises = rooms.map((room) =>
        scheduleAPI.getAllSchedulesOfRoom(room.ID_Room),
      );

      const schedulesArrays = await Promise.all(schedulePromises);

      const schedules = schedulesArrays.flat();

      return { rooms, schedules };
    } catch (error) {
      console.error("Error fetching factory data:", error);
      throw error;
    }
  },
};

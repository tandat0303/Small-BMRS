import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { Room, FilterState } from "../types";
import { roomAPI } from "../services/rooms.api";
import RoomCard from "../components/RoomCard";
import { scheduleAPI } from "@/services/schedules.api";
import { isOverlapping } from "@/lib/helpers";
import storage from "@/lib/storage";

interface RoomListProps {
  filters: FilterState;
}

const RoomList: React.FC<RoomListProps> = ({ filters }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomsWithBookings, setRoomsWithBookings] = useState<any[]>([]);

  const user = JSON.parse(storage.get("user"));

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await roomAPI.getAllRooms(user.factory);
      setRooms(data);
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải danh sách phòng");
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rooms.length) return;

    const loadSchedules = async () => {
      const results = await Promise.all(
        rooms.map(async (room) => {
          const schedules = await scheduleAPI.getAllSchedulesOfRoom(
            room.ID_Room,
          );
          return {
            ...room,
            bookings: schedules.filter((b: any) => !b.Cancel),
          };
        }),
      );

      setRoomsWithBookings(results);
    };

    loadSchedules();
  }, [rooms]);

  let dayBase = new Date();

  if (filters.timeFilter.mode === "range" && filters.timeFilter.startDateTime) {
    dayBase = new Date(filters.timeFilter.startDateTime);
  }

  const startOfDay = new Date(dayBase);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dayBase);
  endOfDay.setHours(23, 59, 59, 999);

  const filteredRooms = roomsWithBookings.filter((room) => {
    if (filters.areas.length && !filters.areas.includes(room.Area))
      return false;

    if (filters.capacities.length) {
      const ok = filters.capacities.some((cap) => room.Capacity >= cap);
      if (!ok) return false;
    }

    const bookings = room.bookings || [];

    if (!filters.timeFilter.mode) {
      const today = new Date();
      const startToday = new Date(today.setHours(0, 0, 0, 0));
      const endToday = new Date(today.setHours(23, 59, 59, 999));

      const hasMeetingToday = bookings.some((b: any) =>
        isOverlapping(
          startToday,
          endToday,
          new Date(b.Time_Start),
          new Date(b.Time_End),
        ),
      );

      if (filters.roomStatus === "available") return !hasMeetingToday;
      if (filters.roomStatus === "occupied") return hasMeetingToday;
      return true;
    }

    if (filters.timeFilter.mode === "allDay") {
      const base = new Date();
      const startDay = new Date(base.setHours(0, 0, 0, 0));
      const endDay = new Date(base.setHours(23, 59, 59, 999));

      const hasMeeting = bookings.some((b: any) =>
        isOverlapping(
          startDay,
          endDay,
          new Date(b.Time_Start),
          new Date(b.Time_End),
        ),
      );

      if (filters.roomStatus === "available") return !hasMeeting;
      if (filters.roomStatus === "occupied") return hasMeeting;
      return hasMeeting;
    }

    if (
      filters.timeFilter.mode === "range" &&
      filters.timeFilter.startDateTime &&
      filters.timeFilter.endDateTime
    ) {
      const rangeStart = new Date(filters.timeFilter.startDateTime);
      const rangeEnd = new Date(filters.timeFilter.endDateTime);

      const startHour = rangeStart.getHours();
      const startMin = rangeStart.getMinutes();
      const endHour = rangeEnd.getHours();
      const endMin = rangeEnd.getMinutes();

      const days: Date[] = [];
      const cursor = new Date(rangeStart);
      cursor.setHours(0, 0, 0, 0);

      const lastDay = new Date(rangeEnd);
      lastDay.setHours(0, 0, 0, 0);

      while (cursor <= lastDay) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }

      let hasMeetingInSlot = false;

      for (const day of days) {
        const slotStart = new Date(day);
        slotStart.setHours(startHour, startMin, 0, 0);

        const slotEnd = new Date(day);
        slotEnd.setHours(endHour, endMin, 0, 0);

        for (const b of bookings) {
          const start = new Date(b.Time_Start);
          const end = new Date(b.Time_End);

          if (isOverlapping(slotStart, slotEnd, start, end)) {
            hasMeetingInSlot = true;
            break;
          }
        }
        if (hasMeetingInSlot) break;
      }

      if (filters.roomStatus === "available") return !hasMeetingInSlot;
      if (filters.roomStatus === "occupied") return hasMeetingInSlot;
      return hasMeetingInSlot;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm sm:text-base">
        {error}
      </div>
    );
  }

  if (filteredRooms.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20">
        <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-sm sm:text-base">
          Không tìm thấy phòng họp phù hợp
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {filteredRooms.map((room) => (
        <RoomCard key={room.ID_Room} room={room} />
      ))}
    </div>
  );
};

export default RoomList;

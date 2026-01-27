import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { RoomListProps } from "../types";
import RoomCard from "../components/RoomCard";
import { isOverlapping } from "@/lib/helpers";
import { useTranslation } from "react-i18next";

const RoomList: React.FC<RoomListProps> = ({
  filters,
  rooms,
  schedules,
  loading,
  error,
}) => {
  const { t } = useTranslation();

  const [roomsWithBookings, setRoomsWithBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!rooms.length) {
      setRoomsWithBookings([]);
      return;
    }

    const results = rooms.map((room) => {
      const roomSchedules = schedules.filter(
        (schedule) => schedule.ID_Room === room.ID_Room && !schedule.Cancel,
      );

      return {
        ...room,
        bookings: roomSchedules,
      };
    });

    setRoomsWithBookings(results);
  }, [rooms, schedules]);

  let dayBase = new Date();

  if (filters.timeFilter.mode === "range" && filters.timeFilter.startDateTime) {
    dayBase = new Date(filters.timeFilter.startDateTime);
  }

  const startOfDay = new Date(dayBase);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dayBase);
  endOfDay.setHours(23, 59, 59, 999);

  const filteredRooms = roomsWithBookings.filter((room) => {
    if (filters.factories && filters.factories.length > 0) {
      if (!filters.factories.includes(room.Factory)) {
        return false;
      }
    }

    if (filters.areas.length && !filters.areas.includes(room.Area))
      return false;

    // if (filters.capacities.length) {
    //   const ok = filters.capacities.some((cap) => room.Capacity >= cap);
    //   if (!ok) return false;
    // }

    if (filters.capacities.length) {
      const cap = filters.capacities[0];
      if (room.Capacity < cap) return false;
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
          {t("rooms_list.no_note_found")}
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

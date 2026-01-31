import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { RoomListProps } from "../types";
import RoomCard from "../components/RoomCard";
import { isOverlapping } from "@/lib/helpers";
import { useTranslation } from "react-i18next";
import { scheduleAPI } from "@/services/schedules.api";
import storage from "@/lib/storage";

const RoomList: React.FC<RoomListProps> = ({
  filters,
  rooms,
  loading,
  error,
}) => {
  const { t } = useTranslation();
  const user = JSON.parse(storage.get("user") || "{}");

  const [schedules, setSchedules] = useState<any[]>([]);
  const [roomsWithBookings, setRoomsWithBookings] = useState<any[]>([]);
  const [fetchingSchedules, setFetchingSchedules] = useState(false);

  const currentFactory = filters.factories?.[0] || user.factory;

  // Fetch schedules based on time filter
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!currentFactory) return;

      setFetchingSchedules(true);
      try {
        let data;

        if (
          filters.timeFilter?.mode === "range" &&
          filters.timeFilter.startDateTime &&
          filters.timeFilter.endDateTime
        ) {
          data = await scheduleAPI.getSchedulesByRange(
            currentFactory,
            filters.timeFilter.startDateTime,
            filters.timeFilter.endDateTime,
          );
        } else {
          data = await scheduleAPI.getTodaySchedules(currentFactory);
        }

        setSchedules(data);
      } catch (e) {
        console.error("Fetch schedules error", e);
        setSchedules([]);
      } finally {
        setFetchingSchedules(false);
      }
    };

    fetchSchedules();

    if (filters.timeFilter?.mode !== "range") {
      const interval = setInterval(fetchSchedules, 600000);
      return () => clearInterval(interval);
    }
  }, [
    currentFactory,
    filters.timeFilter?.mode,
    filters.timeFilter?.startDateTime,
    filters.timeFilter?.endDateTime,
  ]);

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

  const filteredRooms = roomsWithBookings.filter((room) => {
    // Factory filter
    if (filters.factories?.length && !filters.factories.includes(room.Factory))
      return false;

    // Area filter
    if (filters.areas?.length && !filters.areas.includes(room.Area))
      return false;

    // Capacity filter
    if (filters.capacities?.length) {
      const cap = filters.capacities[0];
      if (room.Capacity < cap) return false;
    }

    const bookings = room.bookings || [];

    // Room status filter based on time filter mode
    const now = new Date();

    // Case 1: No time filter - check if room has any meeting today
    if (!filters.timeFilter?.mode) {
      if (filters.roomStatus === null) return true;

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const hasMeetingToday = bookings.some((b: any) =>
        isOverlapping(
          startOfDay,
          endOfDay,
          new Date(b.Time_Start),
          new Date(b.Time_End),
        ),
      );

      if (filters.roomStatus === "available") return !hasMeetingToday;
      if (filters.roomStatus === "occupied") return hasMeetingToday;
      return true;
    }

    // Case 2: All Day mode - check if room is currently occupied (at this moment)
    if (filters.timeFilter.mode === "allDay") {
      if (filters.roomStatus === null) return true;

      const isCurrentlyOccupied = bookings.some((b: any) => {
        const meetingStart = new Date(b.Time_Start);
        const meetingEnd = new Date(b.Time_End);
        return now >= meetingStart && now <= meetingEnd;
      });

      if (filters.roomStatus === "available") return !isCurrentlyOccupied;
      if (filters.roomStatus === "occupied") return isCurrentlyOccupied;
      return true;
    }

    // Case 3: Range mode - check if room is occupied during the specified time range
    if (
      filters.timeFilter.mode === "range" &&
      filters.timeFilter.startDateTime &&
      filters.timeFilter.endDateTime
    ) {
      if (filters.roomStatus === null) return true;

      const rangeStart = new Date(filters.timeFilter.startDateTime);
      const rangeEnd = new Date(filters.timeFilter.endDateTime);

      const hasMeetingInRange = bookings.some((b: any) =>
        isOverlapping(
          rangeStart,
          rangeEnd,
          new Date(b.Time_Start),
          new Date(b.Time_End),
        ),
      );

      if (filters.roomStatus === "available") return !hasMeetingInRange;
      if (filters.roomStatus === "occupied") return hasMeetingInRange;
      return true;
    }

    return true;
  });

  if (loading || fetchingSchedules) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  // Don't render room list if range mode is selected but range is incomplete
  // const isIncompleteRangeMode =
  //   filters.timeFilter?.mode === "range" &&
  //   (!filters.timeFilter.startDateTime || !filters.timeFilter.endDateTime);

  if (filteredRooms.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{t("rooms_list.no_note_found")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {filteredRooms.map((room) => (
        <RoomCard key={room.ID_Room} room={room} filters={filters} />
      ))}
    </div>
  );
};

export default RoomList;

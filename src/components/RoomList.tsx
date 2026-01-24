import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import type { Room, FilterState } from '../types';
import { roomAPI } from '../services/rooms.api';
import RoomCard from '../components/RoomCard';
import { scheduleAPI } from '@/services/schedules.api';
import { isOverlapping } from '@/lib/helpers';

interface RoomListProps {
  filters: FilterState;
}

const RoomList: React.FC<RoomListProps> = ({ filters }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomsWithBookings, setRoomsWithBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await roomAPI.getAllRooms('LYV');
      setRooms(data);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải danh sách phòng');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRange = () => {
    if (filters.timeFilter.mode === 'allDay') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      return { start, end };
    }

    if (
      filters.timeFilter.mode === 'range' &&
      filters.timeFilter.startDateTime &&
      filters.timeFilter.endDateTime
    ) {
      return {
        start: new Date(filters.timeFilter.startDateTime),
        end: new Date(filters.timeFilter.endDateTime),
      };
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  useEffect(() => {
    if (!rooms.length) return;

    const loadSchedules = async () => {
      const results = await Promise.all(
        rooms.map(async (room) => {
          const schedules = await scheduleAPI.getAllSchedulesOfRoom(room.ID_Room);
          return {
            ...room,
            bookings: schedules.filter((b: any) => !b.Cancel),
          };
        })
      );

      setRoomsWithBookings(results);
    };

    loadSchedules();
  }, [rooms]);

  // Filter rooms based on filters
  const filteredRooms = roomsWithBookings.filter((room) => {
    if (filters.areas.length && !filters.areas.includes(room.Area)) return false;

    if (filters.capacities.length) {
      const ok = filters.capacities.some(
        (cap) => room.Capacity >= cap && room.Capacity < cap + 10
      );
      if (!ok) return false;
    }

    const bookings = room.bookings || [];
    const range = getTimeRange();

    const hasConflict = bookings.some((b: any) =>
      isOverlapping(range.start, range.end, new Date(b.Time_Start), new Date(b.Time_End))
    );

    if (filters.roomStatus === 'available') return !hasConflict;
    if (filters.roomStatus === 'occupied') return hasConflict;

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
        <p className="text-gray-500 text-sm sm:text-base">Không tìm thấy phòng họp phù hợp</p>
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

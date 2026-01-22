import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import type { Room, FilterState } from '../types';
import { roomAPI } from '../services/rooms.api';
import RoomCard from '../components/RoomCard';

interface RoomListProps {
  filters: FilterState;
}

const RoomList: React.FC<RoomListProps> = ({ filters }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Filter rooms based on filters
  const filteredRooms = rooms.filter((room) => {
    // Filter by area
    if (filters.areas.length > 0 && !filters.areas.includes(room.Area)) {
      return false;
    }

    // Filter by capacity
    if (filters.capacities.length > 0) {
      const hasMatchingCapacity = filters.capacities.some(
        (cap) => room.Capacity >= cap && room.Capacity < cap + 10
      );
      if (!hasMatchingCapacity) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
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

  if (filteredRooms.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không tìm thấy phòng họp phù hợp</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredRooms.map((room) => (
        <RoomCard key={room.ID_Room} room={room} />
      ))}
    </div>
  );
};

export default RoomList;
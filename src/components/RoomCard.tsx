import React, { useState } from 'react';
import { Users, MapPin } from 'lucide-react';
import type { Room } from '../types';
import BookingModal from '../components/BookingModal';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_API_URL;
  const imageUrl = `${IMAGE_URL}/assets/${room.imageRoom}`;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Room Image */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={room.Name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
            }}
          />
          <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {room.Capacity}
            </span>
          </div>
        </div>

        {/* Room Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{room.Name}</h3>
          <div className="flex items-start gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{room.Area} | Lầu {room.floor}</span>
          </div>

          {room.note && (
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{room.note}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Nhấn để đặt phòng
            </button>
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Chi tiết đặt lịch
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          room={room}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Chi tiết phòng - {room.Name}</h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Khu vực:</span> {room.Area}
              </div>
              <div>
                <span className="font-semibold">Tầng:</span> {room.floor}
              </div>
              <div>
                <span className="font-semibold">Sức chứa:</span> {room.Capacity} người
              </div>
              {room.note && (
                <div>
                  <span className="font-semibold">Ghi chú:</span> {room.note}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomCard;
import React, { useState, useRef, useEffect } from 'react';
import { Users, MapPin, MoreVertical, AlertTriangle } from 'lucide-react';
import type { Room } from '../types';
import BookingModal from '../components/BookingModal';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotePopover, setShowNotePopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_API_URL;
  const imageUrl = `${IMAGE_URL}/assets/${room.imageRoom}`;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotePopover(false);
      }
    };

    if (showNotePopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotePopover]);

  return (
    <>
      <div className="relative bg-white rounded-xl border border-gray-200 overflow-visible hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
        {/* Room Image */}
        <div className="relative h-40 sm:h-48 bg-gray-200 flex-shrink-0 overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={room.Name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
            }}
          />
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white rounded-full px-2.5 sm:px-3 py-1 flex items-center gap-1 shadow-md">
            <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {room.Capacity}
            </span>
          </div>
        </div>

        {/* Room Info */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow overflow-visible">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 flex-1">{room.Name}</h3>
            {room.note && (
              <div className="relative flex-shrink-0" ref={popoverRef}>
                <button
                  onClick={() => setShowNotePopover(!showNotePopover)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                  title="Xem ghi chú"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
                
                {showNotePopover && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg z-30 w-48 sm:w-56 p-3">
                    <div className="text-xs sm:text-sm text-gray-700 whitespace-normal">{room.note}</div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 w-2 h-2 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-start gap-1 text-xs sm:text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="truncate">{room.Area} | Lầu {room.floor}</span>
          </div>



          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-2">
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              Đặt phòng
            </button>
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 bg-white border border-orange-300 text-orange-600 hover:bg-orange-50 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              Chi tiết
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 truncate">Chi tiết phòng - {room.Name}</h2>
            <div className="space-y-3 sm:space-y-4 mb-6">
              <div className="flex justify-between items-start gap-4">
                <span className="font-semibold text-gray-700">Khu vực:</span>
                <span className="text-right text-gray-600">{room.Area}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-semibold text-gray-700">Tầng:</span>
                <span className="text-right text-gray-600">{room.floor}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-semibold text-gray-700">Sức chứa:</span>
                <span className="text-right text-gray-600">{room.Capacity} người</span>
              </div>
              {room.note && (
                <div className="flex justify-between items-start gap-4">
                  <span className="font-semibold text-gray-700">Ghi chú:</span>
                  <span className="text-right text-gray-600 max-w-xs">{room.note}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
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
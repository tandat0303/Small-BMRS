import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  AlertTriangle,
  Eye,
  User,
  Clock,
  Calendar,
  Warehouse,
  X,
} from "lucide-react";
import type { Room } from "@/types";
import BookingModal from "../components/BookingModal";
import { scheduleAPI } from "@/services/schedules.api.ts";
import { formatDateTimeRange } from "@/lib/helpers";
import Swal from "sweetalert2";

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotePopover, setShowNotePopover] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_API_URL;
  const imageUrl = `${IMAGE_URL}/assets/${room.imageRoom}`;

  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [modalBookings, setModalBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);

  // Fetch today's bookings for the card display
  useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        const data = await scheduleAPI.getAllSchedulesOfRoom(room.ID_Room);

        const now = new Date();

        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0,
        );

        const endOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );

        const filtered = data
          .filter((b: any) => {
            if (b.Cancel) return false;

            const start = new Date(b.Time_Start);
            const end = new Date(b.Time_End);

            return start <= endOfToday && end >= startOfToday;
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.Time_Start).getTime() -
              new Date(b.Time_Start).getTime(),
          );

        setTodayBookings(filtered);
      } catch (error) {
        Swal.fire({
          title: "Lỗi",
          text: "Lấy danh sách đặt phòng thất bại!",
          icon: "error",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#ff0000",
        });
      }
    };

    fetchTodaySchedule();
    const interval = setInterval(fetchTodaySchedule, 60000);
    return () => clearInterval(interval);
  }, [room.ID_Room]);

  useEffect(() => {
    const fetchModalSchedule = async () => {
      try {
        const data = await scheduleAPI.getAllSchedulesOfRoom(room.ID_Room);

        const [year, month, day] = selectedDate.split("-").map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        const filtered = data
          .filter((b: any) => {
            if (b.Cancel) return false;

            // Parse time without timezone to avoid conversion
            const cleanStart = b.Time_Start.replace("Z", "")
              .split("+")[0]
              .split(".")[0];
            const cleanEnd = b.Time_End.replace("Z", "")
              .split("+")[0]
              .split(".")[0];

            const start = new Date(cleanStart);
            const end = new Date(cleanEnd);

            return start <= endOfDay && end >= startOfDay;
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.Time_Start).getTime() -
              new Date(b.Time_Start).getTime(),
          );

        setModalBookings(filtered);
      } catch (error) {
        Swal.fire({
          title: "Lỗi",
          text: "Lấy danh sách đặt phòng thất bại!",
          icon: "error",
          confirmButtonText: "Đóng",
          confirmButtonColor: "#ff0000",
        });
      }
    };

    if (showDetailsModal) {
      fetchModalSchedule();
    }
  }, [room.ID_Room, selectedDate, showDetailsModal]);

  // Update filteredBookings when modalBookings change
  useEffect(() => {
    setFilteredBookings(modalBookings);
  }, [modalBookings]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowNotePopover(false);
      }
    };

    if (showNotePopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotePopover]);

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg hover:shadow-md transition flex flex-col h-full">
        {/* Room Image */}
        <div className="p-3">
          <div className="relative h-40 bg-gray-100 rounded-sm overflow-hidden">
            <div
              className="relative h-40 bg-gray-100 rounded-lg overflow-hidden group group-hover:scale-105 transition-transform cursor-pointer"
              onClick={() => setShowImagePreview(true)}
            >
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={room.Name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/api/placeholder/400/300";
                }}
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Eye className="w-4 h-4 mr-1 text-white" />
                <span className="text-white text-xs font-medium tracking-wide">
                  Preview
                </span>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center rounded-full px-2.5 py-1 text-xs bg-white/50 backdrop-opacity-75 border border-white/40 shadow-sm">
              <Users className="w-3.5 h-3.5 text-gray-700" />

              {/* separator */}
              <span className="mx-1 h-3 w-px bg-gray-400" />

              <span className="text-gray-800 font-medium">{room.Capacity}</span>
            </div>
          </div>
        </div>

        {/* Room Info */}
        <div className="px-3 pb-3 flex flex-col flex-grow">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-900 leading-snug">
              {room.Name}
            </h3>
            {room.note && (
              <div className="relative flex-shrink-0" ref={popoverRef}>
                <button
                  onClick={() => setShowNotePopover(!showNotePopover)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>

                {showNotePopover && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg z-30 w-48 sm:w-56 p-3">
                    <div className="text-xs sm:text-sm text-gray-700 whitespace-normal">
                      {room.note}
                    </div>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 w-2 h-2 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 opacity-0.2">
            {/* <MapPin className="w-3.5 h-3.5" /> */}
            <span>
              {room.Area} {room.floor != null && `| Lầu ${room.floor}`}
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-hidden flex flex-col">
            <div className="space-y-2 text-xs overflow-y-auto pr-1 max-h-48 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {todayBookings.length === 0 ? (
                <div className="text-gray-400 italic">
                  Hôm nay chưa có cuộc họp
                </div>
              ) : (
                todayBookings.map((b) => (
                  <div
                    key={b.ID_Schedule}
                    className="border-l-2 border-blue-500 pl-2"
                  >
                    <div className="font-bold text-red-600 uppercase">
                      {formatDateTimeRange(b.Time_Start, b.Time_End)} ·{" "}
                      {b.Topic}
                    </div>
                    <div className="text-red-500 truncate uppercase">
                      {b.DP_User}
                    </div>
                    <div className="text-gray-400">
                      {b.Name_User} - {b.ID_User}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-3">
            <div className="flex gap-2">
              <button
                className="flex-1 h-8 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-medium"
                onClick={() => setShowBookingModal(true)}
              >
                Nhấn để đặt phòng
              </button>

              <button
                className="flex-1 h-8 flex items-center justify-center border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-md text-xs font-medium"
                onClick={() => setShowDetailsModal(true)}
              >
                Chi tiết đặt lịch
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showImagePreview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowImagePreview(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.img
              src={imageUrl || "/placeholder.svg"}
              alt={room.Name}
              className="max-w-full max-h-[90vh] rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl will-change-transform"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div className="bg-white rounded-xl shadow-2xl relative z-10 [backface-visibility:hidden]">
                <BookingModal
                  room={room}
                  onClose={() => setShowBookingModal(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-9xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                <h2 className="text-lg font-bold truncate text-gray-800">
                  {room.Name} | {room.Area}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left side - Timeline */}
                <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-gray-50">
                  <div className="p-7">
                    {/* Date picker */}
                    <div className="mb-4 flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-fit">
                      <div className="flex items-center gap-2 flex-1">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-auto border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-sm text-sm font-medium shadow-sm transition whitespace-nowrap"
                        onClick={() => setShowBookingModal(true)}
                      >
                        Nhấn để đặt phòng
                      </button>
                    </div>

                    {/* Time slots */}
                    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {Array.from({ length: 11 }, (_, i) => i + 7).map(
                        (hour, index) => {
                          const timeStr = `${hour.toString().padStart(2, "0")}:00`;

                          return (
                            <div
                              key={hour}
                              className="flex items-center h-10 relative"
                            >
                              <div className="w-16 text-gray-600 text-xs font-medium text-right pr-3 flex-shrink-0">
                                {timeStr}
                              </div>
                              <div className="flex-1 h-full relative border-l-2 border-gray-300">
                                {/* Horizontal grid line */}
                                <div className="absolute top-0 left-0 right-0 border-t border-gray-200"></div>
                              </div>
                            </div>
                          );
                        },
                      )}

                      {/* Render bookings as absolute positioned elements */}
                      {modalBookings.map((booking) => {
                        // Parse as local time by removing timezone
                        const cleanStart = booking.Time_Start.replace("Z", "")
                          .split("+")[0]
                          .split(".")[0];
                        const cleanEnd = booking.Time_End.replace("Z", "")
                          .split("+")[0]
                          .split(".")[0];

                        const start = new Date(cleanStart);
                        const end = new Date(cleanEnd);

                        const startHour = start.getHours();
                        const startMin = start.getMinutes();
                        const endHour = end.getHours();
                        const endMin = end.getMinutes();

                        // Calculate position from 07:00 (40px per hour instead of 48px)
                        const topPosition =
                          (((startHour - 7) * 60 + startMin) / 60) * 40;
                        const duration =
                          ((endHour * 60 +
                            endMin -
                            (startHour * 60 + startMin)) /
                            60) *
                          40;

                        return (
                          <div
                            key={booking.ID_Schedule}
                            className="absolute bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-400 border-l-4 border-l-teal-600 p-2 rounded-lg shadow-md hover:shadow-lg transition"
                            style={{
                              left: "70px",
                              right: "8px",
                              top: `${topPosition}px`,
                              height: `${Math.max(duration, 32)}px`,
                              zIndex: 10,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-gray-900 text-xs flex-1 break-words leading-tight">
                                {booking.Topic} - {booking.DP_User}
                              </div>
                              <div className="text-teal-700 text-xs font-bold whitespace-nowrap flex-shrink-0">
                                {(() => {
                                  const cleanStart = booking.Time_Start.replace(
                                    "Z",
                                    "",
                                  )
                                    .split("+")[0]
                                    .split(".")[0];
                                  const cleanEnd = booking.Time_End.replace(
                                    "Z",
                                    "",
                                  )
                                    .split("+")[0]
                                    .split(".")[0];
                                  const start = new Date(cleanStart);
                                  const end = new Date(cleanEnd);
                                  return `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} - ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right side - Booking details */}
                <div className="w-100 bg-white overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                      <h3 className="font-bold text-base text-gray-800">
                        Chi tiết đặt lịch
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {modalBookings.map((booking) => (
                        <div
                          key={booking.ID_Schedule}
                          className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 border-l-4 border-l-blue-600 p-3 rounded-lg shadow-sm hover:shadow-md transition"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-gray-900 uppercase mb-1.5">
                                {booking.Topic}
                              </div>
                              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 w-fit">
                                <Clock className="w-4.5 h-4.5 text-yellow-500 flex-shrink-0" />
                                <span className="text-xs font-semibold">
                                  {formatDateTimeRange(
                                    booking.Time_Start,
                                    booking.Time_End,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 space-y-1.5 pt-2 border-t border-blue-100">
                            {/* <div className="flex items-center gap-2">
                              <PencilLine className="w-4.5 h-4.5 text-teal-400 flex-shrink-0" />
                              <span className="text-xs font-semibold uppercase">
                                {booking.Purpose}
                              </span>
                            </div> */}
                            <div className="flex items-center gap-2">
                              <Warehouse className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                              <span className="text-xs font-semibold uppercase">
                                {booking.DP_User}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
                              <span className="text-xs font-semibold">
                                {booking.Name_User} - {booking.ID_User}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {modalBookings.length === 0 && (
                        <div className="text-center py-12">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <div className="text-gray-400 text-sm italic">
                            Hôm nay chưa có cuộc họp
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RoomCard;

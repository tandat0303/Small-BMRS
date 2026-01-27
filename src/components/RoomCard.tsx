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
import { useTranslation } from "react-i18next";

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { t } = useTranslation();

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
          title: t("room_card.error.title"),
          text: t("room_card.error.fetch_failed"),
          icon: "error",
          confirmButtonText: t("room_card.error.confirm_btn"),
          confirmButtonColor: "#ff0000",
        });
      }
    };

    fetchTodaySchedule();
    const interval = setInterval(fetchTodaySchedule, 300000);
    return () => clearInterval(interval);
  }, [room.ID_Room, t]);

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
          title: t("room_card.error.title"),
          text: t("room_card.error.fetch_failed"),
          icon: "error",
          confirmButtonText: t("room_card.error.confirm_btn"),
          confirmButtonColor: "#ff0000",
        });
      }
    };

    if (showDetailsModal) {
      fetchModalSchedule();
    }
  }, [room.ID_Room, selectedDate, showDetailsModal, t]);

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
                  {t("room_card.preview")}
                </span>
              </div>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center rounded-full px-2.5 py-1 text-xs bg-white/50 backdrop-opacity-75 border border-white/40 shadow-sm">
              <Users className="w-3.5 h-3.5 text-gray-700" />

              {/* separator */}
              <span className="mx-1 h-3 w-px bg-gray-400" />

              <span className="text-gray-800 font-medium">{room.Capacity}</span>
            </div>

            {/* {todayBookings.length > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
                {todayBookings.length}
              </div>
            )} */}
          </div>
        </div>

        {/* Room Details */}
        <div className="px-3 pb-3 flex flex-col flex-grow">
          <div className="mb-3">
            <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
              {room.Name}
            </h3>

            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              {/* <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-500" />
                <span>
                  {t("room_card.capacity")}: {room.Capacity}{" "}
                  {t("room_card.people")}
                </span>
              </div> */}

              <div className="flex items-center gap-1">
                <Warehouse className="w-3 h-3 text-teal-500" />
                <span>
                  {t("room_card.area")}: {room.Area}
                </span>
              </div>
            </div>
          </div>

          {room.note && (
            <div className="mb-2 relative">
              <button
                onClick={() => setShowNotePopover(!showNotePopover)}
                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3" />
                <span className="font-medium">{t("room_card.note")}</span>
              </button>

              {showNotePopover && (
                <div
                  ref={popoverRef}
                  className="absolute z-50 mt-1 bg-orange-50 border-2 border-orange-200 rounded-lg p-3 shadow-lg max-w-xs"
                >
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {room.note}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Today's Bookings */}
          <div className="mb-3 flex-grow">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex">
              {t("room_card.today_bookings")}{" "}
              {todayBookings.length > 2 && (
                <div className="text-blue-600 font-bold">
                  (+
                  {todayBookings.length})
                </div>
              )}
            </h4>

            {todayBookings.length === 0 ? (
              <div className="text-xs text-gray-400 italic py-2 text-center border border-dashed border-gray-300 rounded-lg">
                {t("room_card.no_bookings_today")}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {todayBookings.slice(0, 2).map((booking) => (
                  <div
                    key={booking.ID_Schedule}
                    className=" border-blue-500 border-l-4 p-2 shadow-sm text-xs"
                  >
                    <div className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {booking.Topic}
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500">
                      <span className="font-medium text-xs">
                        {formatDateTimeRange(
                          booking.Time_Start,
                          booking.Time_End,
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                {todayBookings.length > 2 && (
                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium w-full text-center py-1"
                  >
                    + {todayBookings.length - 2} {t("room_card.see_more")}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
            >
              {t("room_card.view_details")}
            </button>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
            >
              {t("room_card.book_now")}
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImagePreview(false)}
          >
            <motion.div
              className="relative max-w-4xl max-h-[90vh]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImagePreview(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={imageUrl}
                alt={room.Name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
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
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              className="w-full max-w-2xl will-change-transform"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div className="bg-white rounded-xl shadow-2xl relative z-10">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full">
                {/* Left side - Timeline */}
                <div className="flex-1 bg-gray-50 overflow-y-auto border-r border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1 h-6 bg-teal-600 rounded-full"></div>
                      <h3 className="font-bold text-base text-gray-800">
                        {t("room_card.modal.room_details")} - {room.Name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
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
                        {t("room_card.modal.click_to_book")}
                      </button>
                    </div>

                    {/* Time slots */}
                    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {Array.from({ length: 11 }, (_, i) => i + 7).map(
                        (hour) => {
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
                        {t("room_card.modal.booking_details")}
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
                            {t("room_card.modal.no_meetings_today")}
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

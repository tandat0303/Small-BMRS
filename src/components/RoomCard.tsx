import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  AlertTriangle,
  User,
  Clock,
  Calendar,
  Warehouse,
  Eye,
  RefreshCcw,
} from "lucide-react";
import { Image, Popover } from "antd";
import type { Room } from "@/types";
import BookingModal from "./BookingModal";
import { scheduleAPI } from "@/services/schedules.api.ts";
import { formatDateTimeRange, parseLocalTime } from "@/lib/helpers";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "antd";

interface RoomCardProps {
  room: Room & { bookings?: any[] };
  filters?: {
    timeFilter?: {
      mode?: "allDay" | "range" | null;
      startDateTime?: string | null;
      endDateTime?: string | null;
    };
  };
}

const RoomCard: React.FC<RoomCardProps> = ({ room, filters }) => {
  const { t } = useTranslation();

  const START_HOUR = 7;
  const PIXELS_PER_HOUR = 40;
  const TIMELINE_TOP_PADDING = 28;

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_API_URL;
  const imageUrl = `${IMAGE_URL}/assets/${room.imageRoom}`;

  const todayBookings = room.bookings || [];

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const [modalBookings, setModalBookings] = useState<any[]>([]);

  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (showDetailsModal) {
      if (
        filters?.timeFilter?.mode === "range" &&
        filters?.timeFilter?.startDateTime
      ) {
        const rangeStartDate = dayjs(filters.timeFilter.startDateTime);
        setSelectedDate(rangeStartDate);
      } else {
        setSelectedDate(dayjs());
      }
    }
  }, [showDetailsModal, filters?.timeFilter]);

  const fetchModalSchedule = async () => {
    try {
      setModalBookings([]);

      const data = await scheduleAPI.getAllSchedulesOfRoom(
        room.ID_Room,
        selectedDate.format("YYYY-MM-DD"),
      );

      const startOfDay = selectedDate.startOf("day");
      const endOfDay = selectedDate.endOf("day");

      const filtered = data
        .filter((b: any) => {
          if (b.Cancel) return false;

          const start = dayjs(parseLocalTime(b.Time_Start));

          return start.isAfter(startOfDay) && start.isBefore(endOfDay);
        })
        .sort(
          (a: any, b: any) =>
            parseLocalTime(a.Time_Start).getTime() -
            parseLocalTime(b.Time_Start).getTime(),
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

  useEffect(() => {
    if (showDetailsModal) {
      fetchModalSchedule();
    }
  }, [room.ID_Room, selectedDate, showDetailsModal, t]);

  const handleRefreshDetail = () => {
    fetchModalSchedule();
  };

  return (
    <>
      <div
        className="bg-white border 
          border-gray-300 
          rounded-lg 
          transition-all 
          duration-200 
          ease-out 
          flex flex-col 
          h-full hover:shadow-2xl 
          hover:-translate-y-[2px] 
          hover:scale-[1.01]
        "
      >
        {/* Room Image */}
        <div className="p-3">
          <div className="relative h-40 bg-gray-100 rounded-sm overflow-hidden group">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={room.Name}
              width="100%"
              height="100%"
              style={{
                borderRadius: 6,
                objectFit: "cover",
                display: "block",
              }}
              fallback="/api/placeholder/400/300"
              preview={{
                open: previewVisible,
                onOpenChange: (v) => setPreviewVisible(v),
              }}
              onClick={() => {
                requestAnimationFrame(() => setPreviewVisible(true));
              }}
            />

            <div className="absolute text-white inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <Eye className="w-4 h-4 mr-1" />
              <span className="font-medium text-sm">
                {t("room_card.preview")}
              </span>
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
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-gray-900 line-clamp-1 flex-1">
                {room.Name}
              </h3>

              {room.note && (
                <Popover
                  content={
                    <div className="max-w-xs text-xs text-gray-700 whitespace-pre-wrap">
                      {room.note}
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2 text-orange-600">
                      <span className="font-semibold">
                        {t("room_card.note")}
                      </span>
                    </div>
                  }
                  trigger={["hover"]}
                  placement="right"
                >
                  <button className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition cursor-pointer">
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </Popover>
              )}
            </div>

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

          {/* Today's Bookings */}
          <div className="mb-12 flex-grow">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex">
              {t("room_card.today_bookings")}{" "}
              {todayBookings.length > 2 && (
                <div className="text-blue-600 font-bold">
                  (+
                  {todayBookings.length - 2})
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

                {/* {todayBookings.length > 2 && (
                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium w-full text-center py-1"
                  >
                    + {todayBookings.length - 2} {t("room_card.see_more")}
                  </button>
                )} */}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              {t("room_card.view_details")}
            </button>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              {t("room_card.book_now")}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence mode="wait">
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-70 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-t-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <BookingModal
                room={room}
                onClose={() => setShowBookingModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full max-h-[100vh]">
                {/* Left side - Timeline */}
                <div className="flex-1 bg-gray-50 overflow-y-auto border-r border-gray-200">
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white p-3 shadow-md z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{room.Name}</h2>
                        <div className="flex items-center gap-2 text-blue-100">
                          <Warehouse className="w-4 h-4" />
                          <span className="text-sm">
                            {room.Factory} - {room.Area}
                          </span>
                          <span className="mx-2">•</span>
                          <Users className="w-4 h-4" />
                          <span className="text-sm">
                            {t("room_card.modal.capacity")}: {room.Capacity}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="text-white hover:bg-white/20 rounded-full p-2 transition"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-teal-600 rounded-full"></div>
                        <h3 className="font-bold text-2xl text-gray-800">
                          {t("room_card.modal.timeline")}
                        </h3>
                      </div>
                      <DatePicker
                        value={selectedDate}
                        onChange={(date) => {
                          if (date) setSelectedDate(date);
                        }}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        className="!px-3 !py-1.5"
                      />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="flex bg-blue-500 hover:bg-blue-700 px-1 py-1.5 text-white rounded-full text-sm font-medium shadow-sm transition whitespace-nowrap cursor-pointer"
                        onClick={handleRefreshDetail}
                      >
                        <RefreshCcw className="w-5 h-5 mr-1" />{" "}
                        {t("room_card.modal.refresh")}
                      </div>
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-sm text-sm font-medium shadow-sm transition whitespace-nowrap cursor-pointer"
                        onClick={() => setShowBookingModal(true)}
                      >
                        {t("room_card.modal.click_to_book")}
                      </button>
                    </div>

                    {/* Time slots */}
                    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden pt-7">
                      {Array.from({ length: 11 }, (_, i) => i + 7).map(
                        (hour) => {
                          const timeStr = `${hour.toString().padStart(2, "0")}:00`;

                          return (
                            <div key={hour} className="relative h-10">
                              {/* Horizontal grid line */}
                              <div className="absolute top-0 left-16 right-0 border-t border-gray-200"></div>

                              {/* Time label */}
                              <div className="absolute -top-2 w-16 text-right pr-3 text-xs text-gray-600 font-medium">
                                {timeStr}
                              </div>
                            </div>
                          );
                        },
                      )}

                      {/* Render bookings as absolute positioned elements */}
                      {modalBookings.map((booking) => {
                        const start = parseLocalTime(booking.Time_Start);
                        const end = parseLocalTime(booking.Time_End);

                        const startHour = start.getHours();
                        const startMin = start.getMinutes();
                        const endHour = end.getHours();
                        const endMin = end.getMinutes();

                        const startTotalMinutes = startHour * 60 + startMin;
                        const endTotalMinutes = endHour * 60 + endMin;
                        const timelineStartMinutes = START_HOUR * 60;

                        const topPosition =
                          TIMELINE_TOP_PADDING +
                          ((startTotalMinutes - timelineStartMinutes) / 60) *
                            PIXELS_PER_HOUR;

                        const duration =
                          ((endTotalMinutes - startTotalMinutes) / 60) *
                          PIXELS_PER_HOUR;

                        const durationMinutes =
                          endTotalMinutes - startTotalMinutes;
                        const isShortDuration = durationMinutes <= 30;
                        const isMediumDuration =
                          durationMinutes > 30 && durationMinutes <= 40;
                        const minHeight = isShortDuration
                          ? 23
                          : isMediumDuration
                            ? 28
                            : 32;

                        return (
                          <div
                            key={booking.ID_Schedule}
                            className={`
                              absolute bg-gradient-to-br from-teal-50/50 to-teal-100/50
                              border-2 border-teal-400 border-l-4 border-l-teal-600
                              ${isShortDuration ? "p-0.5" : isMediumDuration ? "p-1" : "p-2"} 
                              ${isShortDuration ? "rounded-md" : "rounded-lg"} 
                              shadow-sm
                              transition-all duration-200 ease-out
                              hover:shadow-xl hover:-translate-y-[2px] hover:scale-[1.01]
                              active:scale-[0.98]
                              cursor-pointer
                            `}
                            style={{
                              left: "70px",
                              right: "8px",
                              top: `${topPosition}px`,
                              height: `${Math.max(duration, minHeight)}px`,
                              zIndex: 10,
                              animation: "fadeSlideIn 0.25s ease-out",
                            }}
                          >
                            <div
                              className={`flex items-start justify-between ${isShortDuration ? "gap-1" : "gap-2"}`}
                            >
                              <div
                                className={`font-semibold text-gray-900 ${isShortDuration ? "text-[10px]" : "text-xs"} flex-1 break-words leading-tight`}
                              >
                                {booking.Topic} - {booking.DP_User}
                              </div>
                              <div
                                className={`text-teal-700 ${isShortDuration ? "text-[10px]" : "text-xs"} font-bold whitespace-nowrap flex-shrink-0`}
                              >
                                {(() => {
                                  const start = parseLocalTime(
                                    booking.Time_Start,
                                  );
                                  const end = parseLocalTime(booking.Time_End);

                                  return `${start.getHours().toString().padStart(2, "0")}:${start
                                    .getMinutes()
                                    .toString()
                                    .padStart(
                                      2,
                                      "0",
                                    )} - ${end.getHours().toString().padStart(2, "0")}:${end
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0")}`;
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

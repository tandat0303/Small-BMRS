import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  List,
  Eye,
  Users,
} from "lucide-react";
import type { Schedule } from "../types";
import { scheduleAPI } from "../services/schedules.api";
import storage from "@/lib/storage";
import { AnimatePresence, motion } from "framer-motion";
import { formatDateTime, isUpcoming } from "@/lib/helpers";

const BookingHistory: React.FC = () => {
  const [meetings, setMeetings] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "upcoming" | "completed" | "cancelled"
  >("upcoming");

  const IMAGE_URL = import.meta.env.VITE_IMAGE_API_URL;

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = JSON.parse(storage.get("user"));
      const userId = user.userId;
      const data = await scheduleAPI.getMySchedule(user.factory, userId);
      setMeetings(data);
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải lịch sử");
      console.error("Error fetching schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (scheduleId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) {
      return;
    }

    try {
      await scheduleAPI.cancelSchedule(scheduleId);
      // Refresh the list
      fetchSchedule();
    } catch (err) {
      alert("Không thể hủy đặt phòng. Vui lòng thử lại.");
      console.error("Error canceling schedule:", err);
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const upcoming = isUpcoming(meeting.Time_Start);

    if (activeFilter === "upcoming") return upcoming && !meeting.Cancel;
    if (activeFilter === "completed") return !upcoming && !meeting.Cancel;
    if (activeFilter === "cancelled") return meeting.Cancel;

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

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
        <div className="flex justify-center gap-2 sm:gap-6 min-w-min sm:min-w-0">
          <button
            onClick={() => setActiveFilter("upcoming")}
            className={`pb-3 px-2 sm:px-0 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-2 ${
              activeFilter === "upcoming"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Cuộc họp sắp diễn ra</span>
            <span className="sm:hidden">Sắp diễn ra</span>
          </button>
          <button
            onClick={() => setActiveFilter("completed")}
            className={`pb-3 px-2 sm:px-0 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-2 ${
              activeFilter === "completed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Cuộc họp đã kết thúc</span>
            <span className="sm:hidden">Đã kết thúc</span>
          </button>
          <button
            onClick={() => setActiveFilter("cancelled")}
            className={`pb-3 px-2 sm:px-0 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-2 ${
              activeFilter === "cancelled"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Cuộc họp đã hủy</span>
            <span className="sm:hidden">Đã hủy</span>
          </button>
        </div>
      </div>

      {/* Meeting List */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            Không có lịch họp nào
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredMeetings.map((meeting) => {
            const startDateTime = formatDateTime(meeting.Time_Start);
            const endDateTime = formatDateTime(meeting.Time_End);
            const upcoming = isUpcoming(meeting.Time_Start);

            return (
              <div
                key={meeting.ID_Schedule}
                className="relative flex flex-col sm:flex-row bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="relative w-full sm:w-[200px] h-[140px]">
                    <div
                      className="w-full h-full bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
                      onClick={() => setShowImagePreview(true)}
                    >
                      <img
                        src={`${IMAGE_URL}/assets/${meeting.imageRoom}`}
                        alt={meeting.Name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/api/placeholder/400/300";
                        }}
                      />

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Eye className="w-4 h-4 mr-1 text-white" />
                        <span className="text-white text-xs font-medium">
                          Preview
                        </span>
                      </div>
                    </div>

                    {/* Capacity badge */}
                    <div className="absolute bottom-2 right-2 flex items-center rounded-full px-2.5 py-1 text-xs bg-white/70 backdrop-blur border shadow-sm">
                      <Users className="w-3.5 h-3.5 text-gray-700" />
                      <span className="mx-1 h-3 w-px bg-gray-400" />
                      <span className="text-gray-800 font-medium">
                        {meeting.Capacity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 flex-1 min-w-0">
                   <div className="flex-1 min-w-0">
                      {/* Meeting Title */}
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">
                        {meeting.Topic}
                      </h3>

                      {/* Room Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">{meeting.Name}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span>{meeting.Area}</span>
                      </div>

                      {/* Date and Time */}
                      <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{startDateTime.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {startDateTime.time} - {endDateTime.time}
                          </span>
                        </div>
                      </div>

                      {/* Meeting Details */}
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">Phòng ban:</span>{" "}
                          <span className="truncate">{meeting.DP_User}</span>
                        </div>
                        <div>
                          <span className="font-medium">Người chủ trì:</span>{" "}
                          <span className="truncate">
                            {meeting.Name_User} - {meeting.ID_User}
                          </span>
                        </div>
                      </div>

                      {/* Cancel Button - flex on mobile, absolute on desktop */}
                      {upcoming && !meeting.Cancel && (
                        <button
                          onClick={() => handleCancel(meeting.ID_Schedule)}
                          className="sm:absolute sm:top-3 sm:right-3 p-2 h-fit text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                          title="Hủy đặt phòng"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  <div className="absolute bottom-3 right-3">
                    {meeting.Cancel ? (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Đã hủy
                      </span>
                    ) : upcoming ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Sắp diễn ra
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        Đã kết thúc
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {showImagePreview && (
                      <motion.div
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
                        onClick={() => setShowImagePreview(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <button
                          onClick={() => setShowImagePreview(false)}
                          className="absolute top-6 right-6 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
                        >
                          ✕
                        </button>

                        <motion.img
                          src={`${IMAGE_URL}/assets/${meeting.imageRoom}`}
                          alt={meeting.Name}
                          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                          onClick={(e) => e.stopPropagation()}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 25,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;

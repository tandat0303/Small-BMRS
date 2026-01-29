import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  List,
  Users,
  Eye,
} from "lucide-react";
import { Image, Popconfirm, notification } from "antd";
import type { Schedule } from "../types";
import { scheduleAPI } from "../services/schedules.api";
import storage from "@/lib/storage";
import { formatDateTime, isUpcoming } from "@/lib/helpers";
import { useTranslation } from "react-i18next";

const BookingHistory: React.FC = () => {
  const { t } = useTranslation();

  const [meetings, setMeetings] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "upcoming" | "completed" | "cancelled"
  >("upcoming");

  const IMAGE_URL = import.meta.env.VITE_IMAGE_API_URL;

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3000);

    fetchSchedule();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = JSON.parse(storage.get("user"));
      const userId = user.userId;
      const data = await scheduleAPI.getMySchedule(user.factory, userId);

      setMeetings(data);
    } catch (err: any) {
      if (err.code === "ECONNABORTED") {
        setMeetings([]);
      } else {
        setError(t("booking_history.error.load_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (scheduleId: number) => {
    try {
      await scheduleAPI.cancelSchedule(scheduleId);

      notification.success({
        message: t("booking_history.notify.cancel_success_title"),
        description: t("booking_history.notify.cancel_success_desc"),
        placement: "topRight",
      });

      fetchSchedule();
    } catch (err) {
      notification.error({
        message: t("booking_history.notify.cancel_error_title"),
        description: t("booking_history.notify.cancel_error_desc"),
        placement: "topRight",
      });

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
            <span className="hidden sm:inline">
              {t("booking_history.tabs.upcoming")}
            </span>
            <span className="sm:hidden">
              {t("booking_history.tabs.upcoming_short")}
            </span>
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
            <span className="hidden sm:inline">
              {t("booking_history.tabs.completed")}
            </span>
            <span className="sm:hidden">
              {t("booking_history.tabs.completed_short")}
            </span>
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
            <span className="hidden sm:inline">
              {t("booking_history.tabs.cancelled")}
            </span>
            <span className="sm:hidden">
              {t("booking_history.tabs.cancelled_short")}
            </span>
          </button>
        </div>
      </div>

      {/* Meeting List */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            {t("booking_history.no_meetings")}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredMeetings.map((meeting) => {
            const startDateTime = formatDateTime(meeting.Time_Start);
            const endDateTime = formatDateTime(meeting.Time_End);
            const upcoming = isUpcoming(meeting.Time_Start);
            const imageURL = `${IMAGE_URL}/assets/${meeting.imageRoom}`;

            return (
              <div
                key={meeting.ID_Schedule}
                className="relative flex flex-col sm:flex-row bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="relative w-full sm:w-[200px] h-[140px] group">
                    <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imageURL}
                        alt={meeting.Name}
                        width="100%"
                        height="100%"
                        style={{
                          borderRadius: 6,
                          objectFit: "cover",
                          display: "block",
                        }}
                        fallback="/api/placeholder/400/300"
                      />
                    </div>

                    <div className="absolute text-white inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="font-medium text-sm">Preview</span>
                    </div>

                    {/* Capacity badge */}
                    <div className="absolute bottom-2 right-2 flex items-center rounded-full px-2.5 py-1 text-xs bg-white/70 backdrop-blur border shadow-sm pointer-events-none z-10">
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
                        <span className="font-medium">
                          {t("booking_history.department")}:
                        </span>{" "}
                        <span className="truncate">{meeting.DP_User}</span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("booking_history.host")}:
                        </span>{" "}
                        <span className="truncate">
                          {meeting.Name_User} - {meeting.ID_User}
                        </span>
                      </div>
                    </div>

                    {/* Cancel Button - absolute on desktop */}
                    {upcoming && !meeting.Cancel && (
                      <Popconfirm
                        title={t("booking_history.cancel_confirm")}
                        onConfirm={() => handleCancel(meeting.ID_Schedule)}
                        okText={t("common.yes")}
                        cancelText={t("common.no")}
                        placement="leftTop"
                      >
                        <button
                          className="sm:absolute sm:top-3 sm:right-3 p-2 h-fit text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 mt-3 sm:mt-0"
                          title={t("booking_history.cancel_booking")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    {meeting.Cancel ? (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {t("booking_history.status.cancelled")}
                      </span>
                    ) : upcoming ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {t("booking_history.status.upcoming")}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {t("booking_history.status.completed")}
                      </span>
                    )}
                  </div>
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

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  List,
  Users,
  Eye,
  Edit,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";
import { Image, Modal, notification } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import type { Schedule } from "../types";
import { scheduleAPI } from "../services/schedules.api";
import storage from "@/lib/storage";
import { formatDateTime, getMeetingStatus, isUpcoming } from "@/lib/helpers";
import { useTranslation } from "react-i18next";
import EditBookingModal from "./EditBookingModal";

const BookingHistory: React.FC = () => {
  const { t } = useTranslation();

  const [meetings, setMeetings] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "upcoming" | "completed" | "cancelled"
  >("upcoming");
  const [editingMeeting, setEditingMeeting] = useState<Schedule | null>(null);
  const [sortOrders, setSortOrders] = useState({
    upcoming: "desc",
    completed: "desc",
    cancelled: "desc",
  });

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
    }
  };

  const confirmCancel = (meeting: Schedule) => {
    const startObj = formatDateTime(meeting.Time_Start);
    const endObj = formatDateTime(meeting.Time_End);

    const startStr = startObj.time;
    const endStr = endObj.time;

    Modal.confirm({
      title: `${meeting.Name} | ${meeting.Area}`,
      content: `${t("booking_history.notify.cancel_confirm")} "${meeting.Topic}" - ${startStr} - ${endStr} ?`,
      okText: t("common.yes"),
      cancelText: t("common.no"),
      okType: "danger",
      centered: true,
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      onOk: () => handleCancel(meeting.ID_Schedule),
    });
  };

  const filteredMeetings = meetings
    .filter((meeting) => {
      const status = getMeetingStatus(meeting.Time_Start, meeting.Time_End);

      if (activeFilter === "upcoming")
        return (
          (status === "upcoming" || status === "ongoing") &&
          meeting.Cancel !== "1"
        );
      if (activeFilter === "completed")
        return status === "completed" && meeting.Cancel !== "1";
      if (activeFilter === "cancelled") return meeting.Cancel === "1";

      return true;
    })
    .sort((a, b) => {
      const statusA = getMeetingStatus(a.Time_Start, a.Time_End);
      const statusB = getMeetingStatus(b.Time_Start, b.Time_End);

      if (activeFilter === "upcoming") {
        if (statusA === "ongoing" && statusB !== "ongoing") return -1;
        if (statusB === "ongoing" && statusA !== "ongoing") return 1;
      }

      const timeA = new Date(a.Time_Start).getTime();
      const timeB = new Date(b.Time_Start).getTime();

      return sortOrders[activeFilter] === "asc" ? timeA - timeB : timeB - timeA;
    });

  const toggleSort = () => {
    setSortOrders((prev) => ({
      ...prev,
      [activeFilter]: prev[activeFilter] === "desc" ? "asc" : "desc",
    }));
  };

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
      <div className="relative mb-6 sm:mb-8 border-b border-gray-200">
        <div className="flex justify-center gap-2 sm:gap-6">
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

        <button
          onClick={toggleSort}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs sm:text-sm px-2 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          {sortOrders[activeFilter] === "asc" ? (
            <ArrowUpNarrowWide className="w-4.5 h-4.5" />
          ) : (
            <ArrowDownWideNarrow className="w-4.5 h-4.5" />
          )}
        </button>
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
            const status = getMeetingStatus(
              meeting.Time_Start,
              meeting.Time_End,
            );

            const colorClass =
              meeting.Cancel === "1"
                ? "text-gray-900 opacity-60 select-none cursor-no-drop"
                : status === "ongoing"
                  ? "text-red-600"
                  : status === "upcoming"
                    ? "text-green-600"
                    : "text-gray-900";

            const startDateTime = formatDateTime(meeting.Time_Start);
            const endDateTime = formatDateTime(meeting.Time_End);
            const upcoming = isUpcoming(meeting.Time_Start);
            const imageURL = `${IMAGE_URL}/assets/${meeting.imageRoom}`;

            return (
              <div
                key={meeting.ID_Schedule}
                className={`relative flex flex-col sm:flex-row bg-white rounded-lg border border-gray-200 p-4 sm:p-5 transition-shadow hover:shadow-lg hover:-translate-y-[2px] hover:scale-[1.01]
                             gap-4 ${colorClass}`}
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
                      <span className="font-medium text-sm">
                        {t("booking_history.preview")}
                      </span>
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
                    <h3 className="text-base sm:text-lg font-bold mb-2 truncate">
                      {meeting.Topic}
                    </h3>

                    {/* Room Info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{meeting.Name}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>{meeting.Area}</span>
                    </div>

                    {/* Date and Time */}
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm mb-3">
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
                    <div className="text-xs sm:text-sm space-y-1">
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

                    {/* Edit & Cancel Buttons - absolute on desktop */}
                    {upcoming && !meeting.Cancel && (
                      <div className="flex gap-2 mt-3 sm:mt-0 sm:absolute sm:top-3 sm:right-3">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingMeeting(meeting)}
                          className="p-2 h-fit text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
                          title={t("booking_history.edit_booking")}
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {/* Cancel Button */}
                        <button
                          onClick={() => confirmCancel(meeting)}
                          className="p-2 h-fit text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                          title={t("booking_history.cancel_booking")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    {meeting.Cancel ? (
                      <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                        {t("booking_history.status.cancelled")}
                      </span>
                    ) : status === "ongoing" ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        {t("booking_history.status.ongoing")}
                      </span>
                    ) : status === "upcoming" ? (
                      <span className="px-3 py-1 bg-green-100 text-green-500 text-xs rounded-full">
                        {t("booking_history.status.upcoming")}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
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

      {/* Edit Modal */}
      {editingMeeting && (
        <EditBookingModal
          meeting={editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onSuccess={() => {
            fetchSchedule();
            setEditingMeeting(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingHistory;

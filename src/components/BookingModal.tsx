"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import storage from "@/lib/storage";
import {
  timeToMinutes,
  getDaysInMonth,
  formatLocalDate,
  dayNames,
} from "@/lib/helpers";
import { roomAPI } from "@/services/rooms.api";
import type { BookingModalProps } from "@/types";

const BookingModal: React.FC<BookingModalProps> = ({ room, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    meetingName: "",
    meetingPurpose: "",
    substituteCard: "",
    substituteName: "",
    bpmNumber: "",
    daysOfWeek: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [selectingDate, setSelectingDate] = useState<"start" | "end">("start");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const hoursScrollRef = useRef<HTMLDivElement>(null);
  const minutesScrollRef = useRef<HTMLDivElement>(null);

  // Focus trap: lock focus inside modal when it opens
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const user = JSON.parse(storage.get("user") || "{}");
  const nameVal = `${user.fullName} ${user.level === "0" ? "- VPCT 業務室" : ""}`;

  const isInRange = (date: string) =>
    formData.startDate &&
    formData.endDate &&
    date > formData.startDate &&
    date < formData.endDate;

  const isSubmitDisabled =
    loading ||
    !formData.startDate ||
    !formData.startTime ||
    !formData.endDate ||
    !formData.endTime;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setLoading(true);
    setError(null);

    try {
      const startDateTime = `${formData.startDate} ${formData.startTime}:00`;
      const endDateTime = `${formData.endDate || formData.startDate} ${formData.endTime}:00`;

      await roomAPI.bookRoom({
        roomId: room.ID_Room,
        userId: user.userId,
        fullName: user.fullName,
        startTime: startDateTime,
        endTime: endDateTime,
        meetingName: formData.meetingName,
        meetingPurpose: formData.meetingPurpose,
        department: "",
        hostName: "",
        substituteCard: formData.substituteCard,
        substituteName: formData.substituteName,
        bpmNumber: formData.bpmNumber,
        daysOfWeek: formData.daysOfWeek,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đặt phòng thất bại");
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      daysOfWeek: formData.daysOfWeek.includes(day)
        ? formData.daysOfWeek.filter((d) => d !== day)
        : [...formData.daysOfWeek, day],
    });
  };

  const handleClearDateTime = () => {
    setFormData((p) => ({
      ...p,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      daysOfWeek: [],
    }));

    setSelectingDate("start");
  };

  const removeDayOfWeek = (day: string) => {
    setFormData({
      ...formData,
      daysOfWeek: formData.daysOfWeek.filter((d) => d !== day),
    });
  };

  const handleDateSelect = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const selectedDateObj = new Date(y, m, day);
    const selected = formatLocalDate(selectedDateObj);

    const today = formatLocalDate(new Date());

    if (selectingDate === "start") {
      if (selected < today) return;
      setFormData((p) => ({
        ...p,
        startDate: selected,
        endDate: selected,
      }));
    } else {
      if (!formData.startDate) return;
      if (selected < formData.startDate) return;
      setFormData((p) => ({ ...p, endDate: selected }));
    }
  };

  const renderCalendar = () => {
    const { days, start } = getDaysInMonth(currentMonth);
    const cells = [];
    const monthName = currentMonth.toLocaleString("vi-VN", {
      month: "short",
      year: "numeric",
    });

    for (let i = 0; i < start; i++) cells.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d,
      );
      const date = formatLocalDate(dateObj);

      const isStart = date === formData.startDate;
      const isEnd = date === formData.endDate;
      const today = formatLocalDate(new Date());

      const disabled =
        (selectingDate === "start" && date < today) ||
        (selectingDate === "end" && date < formData.startDate);

      cells.push(
        <button
          key={d}
          disabled={disabled}
          onClick={() => handleDateSelect(d)}
          className={`text-xs py-1.5 rounded font-medium
            ${isStart || isEnd ? "bg-blue-500 text-white" : ""}
            ${isInRange(date) ? "bg-blue-100 text-blue-700" : ""}
            ${disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-gray-700"}
          `}
        >
          {d}
        </button>,
      );
    }

    const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
      <div className="w-56">
        {/* Month header with navigation */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                ),
              )
            }
            className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-600 text-sm"
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                ),
              )
            }
            className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-600 text-sm"
          >
            &lt;
          </button>
          <span className="text-sm font-semibold text-gray-700 flex-1 text-center">
            {monthName}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                ),
              )
            }
            className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-600 text-sm"
          >
            &gt;
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                ),
              )
            }
            className="px-1.5 py-1 hover:bg-gray-100 rounded text-gray-600 text-sm"
          >
            &gt;&gt;
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((day) => (
            <div
              key={day}
              className="text-xs font-semibold text-gray-600 text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    );
  };

  const renderTime = () => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = formData.startDate === formatLocalDate(new Date());

    const hours = Array.from({ length: 16 }, (_, i) => i + 7);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    const startMin = formData.startTime
      ? timeToMinutes(formData.startTime)
      : null;

    const current =
      selectingDate === "start" ? formData.startTime : formData.endTime;
    const currentHour = current ? Number(current.split(":")[0]) : 7;
    const currentMinute = current ? Number(current.split(":")[1]) : 0;

    return (
      <div className="flex gap-6 h-80 ml-6 border-l border-gray-300 pl-6">
        {/* Hours List */}
        <div className="flex flex-col w-16">
          <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
            Hours
          </h3>
          <div
            ref={hoursScrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded"
          >
            <div className="flex flex-col gap-1">
              {hours.map((h) => {
                const hourMin = h * 60;

                const afterWorkHour = h >= 17;

                const disabled =
                  afterWorkHour ||
                  (selectingDate === "end" &&
                    startMin !== null &&
                    hourMin < startMin) ||
                  (selectingDate === "start" &&
                    isToday &&
                    hourMin < nowMinutes);

                const isSelected =
                  current && Number(current.split(":")[0]) === h;

                return (
                  <button
                    key={h}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        [selectingDate === "start" ? "startTime" : "endTime"]:
                          `${h.toString().padStart(2, "0")}:${currentMinute
                            .toString()
                            .padStart(2, "0")}`,
                      }))
                    }
                    className={`py-2 px-2 text-sm rounded font-medium transition-all duration-150 text-center ${
                      isSelected
                        ? "bg-blue-500 text-white shadow-md"
                        : disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {h.toString().padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Minutes List */}
        <div className="flex flex-col w-16">
          <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
            Minutes
          </h3>
          <div
            ref={minutesScrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded"
          >
            <div className="flex flex-col gap-1">
              {minutes.map((m) => {
                const totalMin = currentHour * 60 + m;

                const afterWorkHour = currentHour >= 17;

                const disabled =
                  afterWorkHour ||
                  (selectingDate === "end" &&
                    startMin !== null &&
                    totalMin < startMin) ||
                  (selectingDate === "start" &&
                    isToday &&
                    totalMin < nowMinutes);

                const isSelected =
                  current &&
                  Number(current.split(":")[0]) === currentHour &&
                  Number(current.split(":")[1]) === m;

                return (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        [selectingDate === "start" ? "startTime" : "endTime"]:
                          `${currentHour.toString().padStart(2, "0")}:${m
                            .toString()
                            .padStart(2, "0")}`,
                      }))
                    }
                    className={`py-2 px-2 text-sm rounded font-medium transition-all duration-150 text-center ${
                      isSelected
                        ? "bg-blue-500 text-white shadow-md"
                        : disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {m.toString().padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isDateTimeValid =
    formData.startDate &&
    formData.startTime &&
    formData.endDate &&
    formData.endTime;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md shadow-2xl rounded-lg relative z-10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between rounded-t-lg">
          <h2 className="text-base font-semibold text-gray-900">
            Đặt lịch{" "}
            <span className="font-bold">
              {room.Name} | {room.Area}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-5 mt-3 bg-green-50 border border-green-200 rounded p-3 text-green-700 text-sm">
            ✓ Đặt phòng thành công!
          </div>
        )}
        {error && (
          <div className="mx-5 mt-3 bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
            ✕ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Room ID & Name */}
          <input
            type="text"
            value={user.userId}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm"
          />
          <input
            type="text"
            value={nameVal}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm"
          />

          {/* Meeting Fields */}
          <input
            type="text"
            name="meetingName"
            value={formData.meetingName}
            onChange={handleChange}
            placeholder="Chủ đề cuộc họp"
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />
          <input
            type="text"
            name="meetingPurpose"
            value={formData.meetingPurpose}
            onChange={handleChange}
            placeholder="Mục đích cuộc họp"
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />
          <input
            type="text"
            name="substituteCard"
            value={formData.substituteCard}
            onChange={handleChange}
            placeholder="Số thẻ người thay thế"
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />
          <input
            type="text"
            name="substituteName"
            value={formData.substituteName}
            onChange={handleChange}
            placeholder="Tên người thay thế"
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />
          <input
            type="text"
            name="bpmNumber"
            value={formData.bpmNumber}
            onChange={handleChange}
            placeholder="Số phiếu BPM"
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />

          {/* DateTime */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="w-full border px-3 py-2 rounded pr-10 flex items-center"
            >
              <CalendarIcon className="w-4 h-4 mr-3 text-gray-500 shrink-0" />

              {!formData.startDate ? (
                <span className="text-gray-400 text-sm">Chọn ngày & giờ</span>
              ) : (
                <div className="flex items-center w-full text-sm font-medium text-gray-700">
                  {/* START */}
                  <span className="whitespace-nowrap">
                    {formData.startDate} {formData.startTime}
                  </span>

                  {/* ARROW CENTER */}
                  <span className="flex-1 text-center text-gray-400 font-normal">
                    →
                  </span>

                  {/* END */}
                  <span className="whitespace-nowrap text-right">
                    {formData.endDate} {formData.endTime}
                  </span>
                </div>
              )}
            </button>
            {formData.startDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearDateTime();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2
                          w-6 h-6 flex items-center justify-center
                          rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Animated dropdown */}
          {showCalendar && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]"
              onClick={() => setShowCalendar(false)}
            >
              <div
                className="bg-white rounded-lg p-5 animate-in zoom-in-95 fade-in duration-200 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Tab Selection */}
                <div className="flex gap-2 mb-4">
                  {["start", "end"].map((t) => {
                    const isEnd = t === "end";
                    const disableEnd = isEnd && !formData.startDate;

                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={disableEnd}
                        onClick={() =>
                          !disableEnd && setSelectingDate(t as any)
                        }
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors
                          ${
                            selectingDate === t
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                          ${disableEnd ? "opacity-40 cursor-not-allowed" : ""}
                        `}
                      >
                        {t === "start" ? "Bắt đầu" : "Kết thúc"}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar and Time Picker */}
                <div className="flex gap-4">
                  {renderCalendar()}
                  {renderTime()}
                </div>

                {/* Selected Time Display */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
                  {formData.startDate &&
                    formData.startTime &&
                    formData.endDate &&
                    formData.endTime && (
                      <div className="text-gray-700 font-medium">
                        {formData.startDate} {formData.startTime} →{" "}
                        {formData.endDate} {formData.endTime}
                      </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={handleClearDateTime}
                    className="px-4 py-2 text-sm rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Clear
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="px-5 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!isDateTimeValid}
                      onClick={() => isDateTimeValid && setShowCalendar(false)}
                      className={`px-5 py-2 rounded text-sm transition-colors
                        ${
                          isDateTimeValid
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }
                      `}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chỉ áp dụng các thứ được chọn
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDaysDropdown(true)}
                className="w-full min-h-[42px] px-2 py-1 border border-blue-400 rounded
                    flex items-center gap-1 overflow-x-auto bg-white text-sm"
              >
                {formData.daysOfWeek.length === 0 && (
                  <span className="text-gray-400 px-1 whitespace-nowrap">
                    Chọn thứ áp dụng
                  </span>
                )}

                {formData.daysOfWeek.map((day) => (
                  <span
                    key={day}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-0.5
                        bg-blue-50 text-blue-700 text-xs
                        rounded-full border border-blue-200 whitespace-nowrap"
                  >
                    {dayNames[day]}
                    <button
                      type="button"
                      onClick={() => removeDayOfWeek(day)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </button>

              {showDaysDropdown && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
                  <div className="bg-white rounded-xl p-4 w-[320px] space-y-2 animate-in zoom-in-95">
                    <h3 className="text-sm font-semibold">Chọn thứ áp dụng</h3>

                    {Object.entries(dayNames).map(([value, label]) => {
                      const active = formData.daysOfWeek.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleDayToggle(value)}
                          className={`w-full px-3 py-2 rounded text-left text-sm
                            ${
                              active
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDaysDropdown(false)}
                        className="px-4 py-1 bg-blue-500 text-white rounded"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="justify-center pt-2 flex">
            <button
              type="submit"
              disabled={loading}
              className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-medium transition-colors disabled:bg-blue-300 text-sm"
            >
              {loading ? "Đang xử lý..." : "Nhấn để đặt phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

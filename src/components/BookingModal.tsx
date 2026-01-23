"use client";

import React, { useState } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import type { Room } from "../types";
import { roomAPI } from "@/services/rooms.api";
import storage from "@/lib/storage";
import { timeToMinutes, getDaysInMonth } from "@/lib/helpers";
interface BookingModalProps {
  room: Room;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ room, onClose }) => {
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

  const user = JSON.parse(storage.get("user"));
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

  const removeDayOfWeek = (day: string) => {
    setFormData({
      ...formData,
      daysOfWeek: formData.daysOfWeek.filter((d) => d !== day),
    });
  };

  const dayNames: { [key: string]: string } = {
    monday: "thứ hai",
    tuesday: "thứ ba",
    wednesday: "thứ tư",
    thursday: "thứ năm",
    friday: "thứ sáu",
    saturday: "thứ bảy",
  };

  const handleDateSelect = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const selected = new Date(y, m, day).toISOString().split("T")[0];

    if (selectingDate === "start") {
      setFormData((p) => ({
        ...p,
        startDate: selected,
        endDate: p.endDate && p.endDate < selected ? "" : p.endDate,
      }));
    } else {
      if (selected < formData.startDate) return;
      setFormData((p) => ({ ...p, endDate: selected }));
    }
  };

  // const handleTimeSelect = (hour: number, minute: number) => {
  //   const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  //   if (selectingDate === "start") {
  //     setFormData({ ...formData, startTime: time });
  //   } else {
  //     setFormData({ ...formData, endTime: time });
  //   }
  // };

  const renderCalendar = () => {
    const { days, start } = getDaysInMonth(currentMonth);
    const cells = [];

    for (let i = 0; i < start; i++) cells.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= days; d++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d,
      )
        .toISOString()
        .split("T")[0];

      const isStart = date === formData.startDate;
      const isEnd = date === formData.endDate;
      const disabled = selectingDate === "end" && date < formData.startDate;

      cells.push(
        <button
          key={d}
          disabled={disabled}
          onClick={() => handleDateSelect(d)}
          className={`text-xs py-1 rounded
            ${isStart || isEnd ? "bg-blue-500 text-white" : ""}
            ${isInRange(date) ? "bg-blue-100 text-blue-700" : ""}
            ${disabled ? "text-gray-300" : "hover:bg-gray-100"}
          `}
        >
          {d}
        </button>,
      );
    }

    return <div className="grid grid-cols-7 gap-1">{cells}</div>;
  };

  const renderTime = () => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 7);
    const minutes = [0, 15, 30, 45];
    const startMin = formData.startTime
      ? timeToMinutes(formData.startTime)
      : null;

    const current =
      selectingDate === "start" ? formData.startTime : formData.endTime;
    const hour = current ? Number(current.split(":")[0]) : 7;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-4 gap-1">
          {hours.map((h) => {
            const disabled =
              selectingDate === "end" && startMin !== null && h * 60 < startMin;

            return (
              <button
                key={h}
                disabled={disabled}
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    [selectingDate === "start" ? "startTime" : "endTime"]:
                      `${h.toString().padStart(2, "0")}:00`,
                  }))
                }
                className={`text-xs py-1 rounded ${
                  disabled
                    ? "bg-gray-100 text-gray-400"
                    : "border hover:bg-gray-100"
                }`}
              >
                {h.toString().padStart(2, "0")}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-1">
          {minutes.map((m) => {
            const disabled =
              selectingDate === "end" &&
              startMin !== null &&
              hour * 60 + m < startMin;

            return (
              <button
                key={m}
                disabled={disabled}
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    [selectingDate === "start" ? "startTime" : "endTime"]:
                      `${hour.toString().padStart(2, "0")}:${m
                        .toString()
                        .padStart(2, "0")}`,
                  }))
                }
                className={`text-xs py-1 rounded ${
                  disabled
                    ? "bg-gray-100 text-gray-400"
                    : "border hover:bg-gray-100"
                }`}
              >
                :{m.toString().padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl shadow-2xl rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Đặt lịch {room.Name} | {room.Area}
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
            required
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

          {/* Date Time Picker with Split Input */}
          {/* <div className="relative">
            <div className="relative flex border border-red-400 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setSelectingDate("start");
                  setShowCalendar(true);
                }}
                className={`flex-1 px-2 py-1.5 text-left text-xs transition-colors ${
                  selectingDate === "start"
                    ? "border-b-2 border-blue-500 bg-blue-50/30"
                    : ""
                }`}
              >
                <span className="text-gray-400 text-[10px]">Bắt đầu</span>
                <div className="text-gray-900 mt-0.5 text-xs font-medium">
                  {formData.startDate || "____-__-__"}{" "}
                  {formData.startTime && `${formData.startTime}`}
                </div>
              </button>

              <div className="flex items-center px-1.5 text-gray-400 text-sm">
                →
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectingDate("end");
                  setShowCalendar(true);
                }}
                className={`flex-1 px-2 py-1.5 text-left text-xs transition-colors ${
                  selectingDate === "end"
                    ? "border-b-2 border-blue-500 bg-blue-50/30"
                    : ""
                }`}
              >
                <span className="text-gray-400 text-[10px]">Kết thúc</span>
                <div className="text-gray-900 mt-0.5 text-xs font-medium">
                  {formData.endDate || "____-__-__"}{" "}
                  {formData.endTime && `${formData.endTime}`}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-2 text-gray-400 hover:text-gray-600 flex items-center"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            {showCalendar && renderCalendar()}
          </div> */}

          {/* DateTime */}
          <button
            type="button"
            onClick={() => setShowCalendar(true)}
            className="w-full border px-3 py-2 text-left rounded"
          >
            <CalendarIcon className="inline w-4 h-4 mr-2" />
            {formData.startDate
              ? `${formData.startDate} ${formData.startTime} → ${formData.endDate} ${formData.endTime}`
              : "Chọn ngày & giờ"}
          </button>

          {/* Animated dropdown */}
          {showCalendar && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
              <div className="bg-white rounded-xl p-4 w-[420px] animate-in zoom-in-95 fade-in duration-200">
                <div className="flex gap-2 mb-2">
                  {["start", "end"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectingDate(t as any)}
                      className={`flex-1 py-1 rounded ${
                        selectingDate === t
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {t === "start" ? "Bắt đầu" : "Kết thúc"}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="w-56">{renderCalendar()}</div>
                  <div className="flex-1 border-l pl-2">{renderTime()}</div>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="px-4 py-1 bg-blue-500 text-white rounded"
                  >
                    OK
                  </button>
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-medium transition-colors disabled:bg-blue-300 text-sm"
          >
            {loading ? "Đang xử lý..." : "Nhấn để đặt phòng"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

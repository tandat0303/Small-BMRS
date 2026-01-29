import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import storage from "@/lib/storage";
import { roomAPI } from "@/services/rooms.api";
import type { BookingModalProps } from "@/types";
import { useTranslation } from "react-i18next";
import { userInfoAPI } from "@/services/userInfo.api";
import Swal from "sweetalert2";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const BookingModal: React.FC<BookingModalProps> = ({ room, onClose }) => {
  const { t } = useTranslation();

  const [dateTimeRange, setDateTimeRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [userDept, setUserDept] = useState("");
  const [userDeptSerialKey, setUserDeptSerialKey] = useState("");
  const user = JSON.parse(storage.get("user") || "{}");
  const userFac = user.factory;
  const userId = user.userId;

  const needBpmCheck =
    Number(room?.Bpm_req) === 1 &&
    !room?.bpm_area_exc
      ?.split(",")
      ?.map((i) => i.trim())
      ?.includes(userDeptSerialKey) &&
    userId !== "34333";

  const { RangePicker } = DatePicker;

  useEffect(() => {
    const getUserDept = async () => {
      try {
        const res = await userInfoAPI.getUserInfo({
          factory: userFac,
          userId: userId,
        });

        const info = res?.userInfo;

        const deptName = info?.Department_Name;
        const deptSK = info?.Department_Serial_Key;

        if (!deptName) throw new Error("No department");

        setUserDept(deptName);
        setUserDeptSerialKey(deptSK);

        setFormData((prev) => ({
          ...prev,
          Name_User: info.Person_Name,
          DP_User: deptName,
        }));
      } catch (error) {
        console.error("Get user info error:", error);

        Swal.fire({
          title: t("room_card.error.title"),
          text: t("room_card.error.get_info_failed"),
          icon: "error",
          confirmButtonText: t("room_card.error.confirm_btn"),
          confirmButtonColor: "#ff0000",
        });
      }
    };

    if (userId && userFac) {
      getUserDept();
    }
  }, [userId, userFac]);

  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    Topic: "",
    Purpose: "",
    ID_User2: "",
    Time_Start: "",
    Time_End: "",
    Name_User: "",
    DP_User: "",
    idbpm: "",
    dayOnly: "",
    dayOnlys: [] as string[],

    substituteName: "",
    substituteDept: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);

  const dayNames: { [key: string]: string } = {
    monday: t("booking_modal.monday"),
    tuesday: t("booking_modal.tuesday"),
    wednesday: t("booking_modal.wednesday"),
    thursday: t("booking_modal.thursday"),
    friday: t("booking_modal.friday"),
    saturday: t("booking_modal.saturday"),
  };

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

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dayOnly: formData.dayOnlys.join(","),
    }));
  }, [formData.dayOnlys]);

  const removeDayOfWeek = (day: string) => {
    setFormData({
      ...formData,
      dayOnlys: formData.dayOnlys.filter((d) => d !== day),
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      dayOnlys: formData.dayOnlys.includes(day)
        ? formData.dayOnlys.filter((d) => d !== day)
        : [...formData.dayOnlys, day],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    if (!isValidTimeRange()) {
      return;
    }

    setLoading(true);

    try {
      let allowBooking = true;

      if (needBpmCheck) {
        if (!formData.idbpm) {
          Swal.fire({
            icon: "warning",
            title: t("booking_modal.error.title"),
            text: t("booking_modal.error.enter_bpm"),
          });
          setLoading(false);
          return;
        }

        const bpmRes = await roomAPI.checkBPMSign(formData.idbpm);

        if (bpmRes?.issign === 0) {
          Swal.fire({
            icon: "error",
            title: t("booking_modal.error.title"),
            text: t("booking_modal.error.bpm_not_sign"),
          });
          allowBooking = false;
        }
      }

      if (!allowBooking) {
        setLoading(false);
        return;
      }

      const startISO = dayjs(formData.Time_Start).format("YYYY-MM-DD HH:mm:ss");
      const endISO = dayjs(formData.Time_End).format("YYYY-MM-DD HH:mm:ss");

      await roomAPI.bookRoom({
        ID_Room: room.ID_Room,
        ID_User: user.userId,
        Topic: formData.Topic,
        Purpose: formData.Purpose,
        ID_User2: formData.ID_User2 || user.userId,
        Time_Start: startISO,
        Time_End: endISO,
        Name_User: formData.Name_User,
        DP_User: formData.DP_User,
        idbpm: formData.idbpm || "",
        dayOnly: formData.dayOnly,
      });

      Swal.fire({
        icon: "success",
        title: t("booking_modal.success"),
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        onClose();
        window.location.reload();
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t("booking_modal.error.title"),
        text:
          err.response?.data?.message ||
          t("booking_modal.error.booking_failed"),
      });
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

  const handleSubstituteBlur = async () => {
    if (!formData.ID_User2) return;

    try {
      const res = await userInfoAPI.getUserInfo({
        factory: userFac,
        userId: formData.ID_User2,
      });

      const info = res?.userInfo;

      if (!info) throw new Error("User not found");

      setFormData((prev) => ({
        ...prev,
        substituteName: info.Person_Name,
        substituteDept: info.Department_Name,
      }));
    } catch (error) {
      console.error("Get substitute info error:", error);

      setFormData((prev) => ({
        ...prev,
        substituteName: "",
        substituteDept: "",
      }));

      Swal.fire({
        title: t("room_card.error.title"),
        text: "Không tìm thấy người thay thế",
        icon: "error",
        confirmButtonColor: "#ff0000",
      });
    }
  };

  const handleTimeChange = (values: any) => {
    if (!values) return;

    const [start, end] = values;

    setDateTimeRange(values);

    setFormData((prev) => ({
      ...prev,
      Time_Start: start ? start.format("YYYY-MM-DD HH:mm") : "",
      Time_End: end ? end.format("YYYY-MM-DD HH:mm") : "",
    }));
  };

  const isSubmitDisabled =
    loading ||
    !formData.Topic.trim() ||
    !formData.Purpose.trim() ||
    !formData.ID_User2.trim() ||
    !formData.Time_Start ||
    !formData.Time_End ||
    (needBpmCheck && !formData.idbpm.trim());

  const isValidTimeRange = () => {
    const start = dayjs(formData.Time_Start);
    const end = dayjs(formData.Time_End);

    if (!start.isValid() || !end.isValid()) return false;

    return end.isAfter(start) && start.hour() >= 7 && end.hour() < 17;
  };

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
            {t("booking_modal.title")}{" "}
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
            value={`${user.fullName} - ${userDept}`}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm"
          />

          {/* Meeting Fields */}
          <input
            type="text"
            name="Topic"
            value={formData.Topic}
            onChange={handleChange}
            placeholder={t("booking_modal.meeting_name_placeholder")}
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />
          <input
            type="text"
            name="Purpose"
            value={formData.Purpose}
            onChange={handleChange}
            placeholder={t("booking_modal.meeting_purpose_placeholder")}
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />
          <input
            type="text"
            name="ID_User2"
            value={formData.ID_User2}
            onChange={handleChange}
            onBlur={handleSubstituteBlur}
            placeholder={t("booking_modal.substitute_card_placeholder")}
            className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
          />
          <input
            type="text"
            disabled
            value={
              formData.substituteName
                ? `${formData.substituteName} - ${formData.substituteDept}`
                : ""
            }
            placeholder={t("booking_modal.substitute_name")}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm"
          />

          {needBpmCheck && (
            <input
              type="text"
              name="idbpm"
              value={formData.idbpm}
              onChange={handleChange}
              placeholder="Số phiếu BPM"
              className="w-full px-3 py-2 border border-red-400 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("booking_modal.select_datetime")}
            </label>

            <RangePicker
              showTime={{
                format: "HH:mm",
                minuteStep: 5,
                hideDisabledOptions: true,
              }}
              format="YYYY-MM-DD HH:mm"
              value={dateTimeRange}
              onChange={handleTimeChange}
              className="w-full"
              disabledDate={(current) => {
                if (!current) return false;

                const [start] = dateTimeRange;

                if (current < dayjs().startOf("day")) return true;

                if (start && current.isBefore(start, "day")) return true;

                return false;
              }}
              disabledTime={(date, type) => {
                if (!date) return {};

                const now = dayjs();
                const [start] = dateTimeRange;

                if (date.isSame(now, "day")) {
                  const currentHour = now.hour();
                  const currentMinute = now.minute();

                  return {
                    disabledHours: () =>
                      Array.from({ length: currentHour }, (_, i) => i),

                    disabledMinutes: (hour: number) =>
                      hour === currentHour
                        ? Array.from({ length: currentMinute }, (_, i) => i)
                        : [],
                  };
                }

                if (type === "end" && start && date.isSame(start, "day")) {
                  const startHour = start.hour();
                  const startMinute = start.minute();

                  return {
                    disabledHours: () =>
                      Array.from({ length: startHour }, (_, i) => i),

                    disabledMinutes: (hour: number) =>
                      hour === startHour
                        ? Array.from({ length: startMinute }, (_, i) => i)
                        : [],
                  };
                }

                return {
                  disabledHours: () => [
                    ...Array.from({ length: 7 }, (_, i) => i),
                    ...Array.from({ length: 7 }, (_, i) => i + 17),
                  ],
                  disabledMinutes: () => [],
                };
              }}
            />
          </div>

          {/* Days */}
          <div className="relative"></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("booking_modal.select_days")}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDaysDropdown(true)}
                className="w-full min-h-[42px] px-2 py-1 border border-blue-400 rounded
                    flex items-center gap-1 overflow-x-auto bg-white text-sm"
              >
                {formData.dayOnlys.length === 0 && (
                  <span className="text-gray-400 px-1 whitespace-nowrap">
                    {t("booking_modal.select_days_placeholder")}
                  </span>
                )}

                {formData.dayOnlys.map((day) => (
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
                    <h3 className="text-sm font-semibold">
                      {t("booking_modal.select_days_placeholder")}
                    </h3>

                    {Object.entries(dayNames).map(([value, label]) => {
                      const active = formData.dayOnlys.includes(value);
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
                        {t("booking_modal.ok")}
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
              disabled={isSubmitDisabled}
              className="w-fit bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-medium transition-colors disabled:bg-blue-300 text-sm"
            >
              {loading
                ? t("booking_modal.submitting")
                : t("booking_modal.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

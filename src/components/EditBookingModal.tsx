import React, { useState, useEffect } from "react";
import { X, Calendar, Save } from "lucide-react";
import type { Schedule } from "@/types";
import { useTranslation } from "react-i18next";
import { userInfoAPI } from "@/services/userInfo.api";
import storage from "@/lib/storage";
import { DatePicker, Form, Input, notification } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { scheduleAPI } from "@/services/schedules.api";

interface EditBookingModalProps {
  meeting: Schedule;
  onClose: () => void;
  onSuccess: () => void;
}

dayjs.extend(utc);

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  meeting,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;

  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    dept: "",
  });

  const user = storage.get("user");
  const userFac = user.factory;

  useEffect(() => {
    loadUserInfo(meeting.ID_User);

    form.setFieldsValue({
      ID_User: meeting.ID_User,
      Topic: meeting.Topic,
      Purpose: meeting.Purpose,
      dateTimeRange: [
        dayjs(meeting.Time_Start.replace("Z", "")),
        dayjs(meeting.Time_End.replace("Z", "")),
      ],
    });
  }, [meeting]);

  const loadUserInfo = async (userId: string) => {
    try {
      const res = await userInfoAPI.getUserInfo({
        factory: userFac,
        userId: userId,
      });

      const info = res?.userInfo;

      if (info) {
        setUserInfo({
          name: info.Person_Name,
          dept: info.Department_Name,
        });
      }
    } catch (error) {
      console.error("Get substitute info error:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const [startTime, endTime] = values.dateTimeRange;

      const payload = {
        ID_Room: meeting.ID_Room,
        Topic: values.Topic,
        Purpose: values.Purpose,
        Time_Start: dayjs(startTime).format("YYYY-MM-DD HH:mm:ss"),
        Time_End: dayjs(endTime).format("YYYY-MM-DD HH:mm:ss"),
      };

      const res = await scheduleAPI.updateSchedule(
        meeting.ID_Schedule,
        payload,
      );

      if (res.result) {
        notification.success({
          message: t("booking_history.notify.edit_success"),
          placement: "topRight",
          duration: 1.5,
        });

        onSuccess();
        onClose();
      } else {
        notification.error({
          message: t("booking_history.error.title"),
          description: t("booking_history.error.edit_failed"),
          placement: "topRight",
        });
      }
    } catch (err: any) {
      notification.error({
        message: t("booking_history.error.title"),
        description:
          err.response?.data?.message || t("booking_history.error.edit_failed"),
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <>
      <style>{`
        .ant-form-item {
          border: none !important;
        }
        .edit-booking-modal-form .ant-form-item-label {
          padding-bottom: 4px;
        }
      `}</style>
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 bg-black/50"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="bg-white w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl sm:rounded-2xl relative z-10 animate-in fade-in zoom-in duration-200 outline-none border-0"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-blue-500 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                  {t("booking_history.edit.title")}
                </h2>
                <p className="text-xs text-blue-100 truncate">
                  {meeting.Name} • {meeting.Area}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 transition-all p-1.5 rounded-lg flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="px-3 sm:px-5 py-3 sm:py-4">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-2.5 sm:space-y-3 edit-booking-modal-form"
            >
              <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {/* Substitute Card ID */}
                  <Form.Item
                    label={
                      <span className="text-xs sm:text-sm">
                        {t("booking_history.edit.cardNumber")}
                      </span>
                    }
                    name="ID_User"
                    className="mb-0"
                  >
                    <Input
                      placeholder={t("booking_history.edit.enter_id")}
                      className="rounded-lg text-sm"
                      disabled
                    />
                  </Form.Item>

                  {/* Substitute Name & Dept - Readonly */}
                  {userInfo.name && (
                    <Form.Item
                      label={
                        <span className="text-xs sm:text-sm">
                          {t("booking_history.edit.name_dept")}
                        </span>
                      }
                      className="mb-0"
                    >
                      <Input
                        value={`${userInfo.name} - ${userInfo.dept}`}
                        disabled
                        className="rounded-lg bg-gray-50 text-sm"
                      />
                    </Form.Item>
                  )}
                </div>
              </div>

              {/* Topic */}
              <Form.Item
                label={
                  <span className="text-xs sm:text-sm">
                    {t("booking_history.edit.topic")}
                  </span>
                }
                name="Topic"
                rules={[
                  { required: true, message: t("booking_history.required") },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder={t(
                    "booking_history.edit.meeting_name_placeholder",
                  )}
                  className="rounded-lg text-sm h-10"
                />
              </Form.Item>

              {/* Purpose */}
              <Form.Item
                label={
                  <span className="text-xs sm:text-sm">
                    {t("booking_history.edit.purpose")}
                  </span>
                }
                name="Purpose"
                rules={[
                  { required: true, message: t("booking_history.required") },
                ]}
                className="mb-0"
              >
                <Input.TextArea
                  placeholder={t(
                    "booking_history.edit.meeting_purpose_placeholder",
                  )}
                  className="rounded-lg text-sm"
                  rows={2}
                />
              </Form.Item>

              {/* Date & Time Range */}
              <Form.Item
                label={
                  <span className="text-xs sm:text-sm">
                    {t("booking_history.edit.time")}
                  </span>
                }
                name="dateTimeRange"
                rules={[
                  { required: true, message: t("booking_history.required") },
                ]}
                className="mb-0"
              >
                <RangePicker
                  showTime={{
                    format: "HH:mm",
                    minuteStep: 5,
                    hideDisabledOptions: true,
                  }}
                  format="YYYY-MM-DD HH:mm"
                  className="w-full rounded-lg text-sm h-10"
                  placeholder={[
                    t("booking_history.edit.start"),
                    t("booking_history.edit.end"),
                  ]}
                  disabledDate={(current) => {
                    if (!current) return false;
                    return current < dayjs().startOf("day");
                  }}
                  disabledTime={(date, type) => {
                    if (!date) return {};
                    const now = dayjs();
                    const [start] = form.getFieldValue("dateTimeRange") || [];

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
              </Form.Item>
            </Form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-5 py-2.5 sm:py-3 rounded-b-xl sm:rounded-b-2xl flex items-center justify-end gap-2 sm:gap-3 sticky bottom-0">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors text-xs sm:text-sm"
            >
              {t("booking_history.edit.cancel")}
            </button>

            <button
              onClick={() => form.submit()}
              disabled={loading}
              className="px-4 sm:px-5 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden xs:inline">
                    {t("booking_history.edit.saving")}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t("booking_history.edit.save")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBookingModal;

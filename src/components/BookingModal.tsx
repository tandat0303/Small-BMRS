import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import storage from "@/lib/storage";
import { roomAPI } from "@/services/rooms.api";
import type { BookingModalProps } from "@/types";
import { useTranslation } from "react-i18next";
import { userInfoAPI } from "@/services/userInfo.api";
import { DatePicker, Form, Select, Input, notification } from "antd";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import dayjs from "dayjs";

const BookingModal: React.FC<BookingModalProps> = ({ room, onClose }) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [dateTimeRange, setDateTimeRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [userDept, setUserDept] = useState("");
  const [userDeptSerialKey, setUserDeptSerialKey] = useState("");
  const user = storage.get("user");
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
        notification.error({
          message: t("room_card.error.title"),
          description: t("room_card.error.get_info_failed"),
          placement: "topRight",
        });
      }
    };

    if (userId && userFac) {
      getUserDept();
    }
  }, [userId, userFac]);

  const [formData, setFormData] = useState({
    Topic: "",
    Purpose: "",
    ID_User2: "",
    Time_Start: "",
    Time_End: "",
    Name_User: "",
    DP_User: "",
    idbpm: "",
    dayOnly: false,
    dayOnlys: [] as number[],

    substituteName: "",
    substituteDept: "",
  });
  const [loading, setLoading] = useState(false);

  const dayOptions = [
    { value: "monday", label: t("booking_modal.monday") },
    { value: "tuesday", label: t("booking_modal.tuesday") },
    { value: "wednesday", label: t("booking_modal.wednesday") },
    { value: "thursday", label: t("booking_modal.thursday") },
    { value: "friday", label: t("booking_modal.friday") },
    { value: "saturday", label: t("booking_modal.saturday") },
  ];

  const dayColorMap: Record<string, string> = {
    monday: "bg-blue-50 text-blue-700 border-blue-200",
    tuesday: "bg-emerald-50 text-emerald-700 border-emerald-200",
    wednesday: "bg-amber-50 text-amber-700 border-amber-200",
    thursday: "bg-purple-50 text-purple-700 border-purple-200",
    friday: "bg-rose-50 text-rose-700 border-rose-200",
    saturday: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const WEEKMAP_DAY: Record<string, number> = {
    monday: 1,
    tuesay: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const tagRender = (props: CustomTagProps) => {
    const { label, value, closable, onClose } = props;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-0.5 py-0.4 mr-0.5 rounded-full text-sm font-medium border ${dayColorMap[value as string]} transition-all hover:shadow-sm`}
        style={{ fontSize: 13 }}
      >
        {label}
        {closable && (
          <span
            onClick={onClose}
            className="cursor-pointer hover:opacity-70 transition-opacity"
          >
            ×
          </span>
        )}
      </span>
    );
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

  const handleSubmit = async (values: any) => {
    if (isSubmitDisabled()) return;

    if (!isValidTimeRange()) return;

    setLoading(true);

    try {
      let allowBooking = true;

      if (needBpmCheck) {
        if (!values.idbpm) {
          notification.warning({
            message: t("booking_modal.error.title"),
            description: t("booking_modal.error.enter_bpm"),
            placement: "topRight",
          });
        }

        const bpmRes = await roomAPI.checkBPMSign(values.idbpm);

        if (bpmRes?.issign === 0) {
          notification.error({
            message: t("booking_modal.error.title"),
            description: t("booking_modal.error.bpm_not_sign"),
            placement: "topRight",
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

      const payload = {
        ID_Room: room.ID_Room,
        ID_User: user.userId,
        Topic: values.Topic,
        Purpose: values.Purpose,
        ID_User2: values.ID_User2 || user.userId,
        Time_Start: startISO,
        Time_End: endISO,
        Name_User: formData.Name_User,
        DP_User: formData.DP_User,
        idbpm: values.idbpm || "",
        dayOnly: formData.dayOnly,
        dayOnlys: formData.dayOnlys,
      };

      await roomAPI.bookRoom(payload);

      notification.success({
        message: t("booking_modal.success"),
        placement: "topRight",
        duration: 1.5,
      });

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      notification.error({
        message: t("booking_modal.error.title"),
        description: t("booking_modal.error.booking_failed"),
        placement: "topRight",
        className: "bg-red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubstituteBlur = async () => {
    const id_user2 = form.getFieldValue("ID_User2");

    if (!id_user2 || !id_user2.trim()) return;

    try {
      const res = await userInfoAPI.getUserInfo({
        factory: userFac,
        userId: id_user2,
      });

      const info = res?.userInfo;

      if (!info) throw new Error("User not found");

      setFormData((prev) => ({
        ...prev,
        ID_User2: id_user2,
        substituteName: info.Person_Name,
        substituteDept: info.Department_Name,
      }));
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        substituteName: "",
        substituteDept: "",
      }));

      notification.error({
        message: t("room_card.error.title"),
        description: t("room_card.error.substitute_not_found"),
        placement: "topRight",
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

  const isSubmitDisabled = () => {
    const values = form.getFieldsValue();
    return (
      loading ||
      !values.Topic?.trim() ||
      !values.Purpose?.trim() ||
      !values.ID_User2?.trim() ||
      !formData.Time_Start ||
      !formData.Time_End ||
      (needBpmCheck && !values.idbpm?.trim())
    );
  };

  const isValidTimeRange = () => {
    const start = dayjs(formData.Time_Start);
    const end = dayjs(formData.Time_End);

    if (!start.isValid() || !end.isValid()) return false;

    return end.isAfter(start) && start.hour() >= 7 && end.hour() < 17;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div
        className="
          relative bg-white w-full sm:max-w-2xl
          max-h-[85dvh]
          rounded-t-2xl sm:rounded-2xl
          flex flex-col
          overflow-hidden
          shadow-2xl
        "
      >
        {/* Header - Compact */}
        <div className="bg-blue-500 px-4 sm:px-5 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-base font-semibold text-white">
                {t("booking_modal.title")}
              </h2>
              <p className="text-xs text-blue-100">
                {room.Name} • {room.Area}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Compact Two Column Layout */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-3 booking-modal-form"
          >
            {/* User Information - Compact */}
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Form.Item
                  label={t("booking_modal.cardNumber")}
                  className="mb-0"
                >
                  <Input value={user.userId} disabled className="bg-white" />
                </Form.Item>

                <Form.Item label={t("booking_modal.Name")} className="mb-0">
                  <Input
                    value={`${user.fullName} - ${userDept}`}
                    disabled
                    className="bg-white"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Main Form - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <Form.Item
                  label={t("booking_modal.meeting_name_placeholder")}
                  name="Topic"
                  rules={[
                    {
                      required: true,
                      message: t("booking_modal.required"),
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder={t("booking_modal.meeting_name_placeholder")}
                    className="rounded-lg h-10"
                  />
                </Form.Item>

                <Form.Item
                  label={t("booking_modal.meeting_purpose_placeholder")}
                  name="Purpose"
                  rules={[
                    {
                      required: true,
                      message: t("booking_modal.required"),
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder={t("booking_modal.meeting_purpose_placeholder")}
                    // autoSize={false}
                    // rows={1}
                    className="
                      rounded-lg h-10
                    "
                  />
                </Form.Item>

                <Form.Item
                  label={t("booking_modal.substitute_card_placeholder")}
                  name="ID_User2"
                  rules={[
                    {
                      required: true,
                      message: t("booking_modal.required"),
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    onBlur={handleSubstituteBlur}
                    placeholder={t("booking_modal.substitute_card_placeholder")}
                    className="rounded-lg h-10"
                  />
                </Form.Item>

                {needBpmCheck && (
                  <Form.Item
                    label={t("booking_modal.idbpm")}
                    name="idbpm"
                    rules={[
                      {
                        required: true,
                        message: t("booking_modal.required"),
                      },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder={t("booking_modal.enter_bpm")}
                      className="rounded-lg h-10"
                    />
                  </Form.Item>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <Form.Item
                  label={t("booking_modal.select_datetime")}
                  className="mb-0"
                  rules={[
                    {
                      required: true,
                      message: t("booking_modal.required"),
                    },
                  ]}
                  required
                >
                  <RangePicker
                    showTime={{
                      format: "HH:mm",
                      minuteStep: 1,
                      // hideDisabledOptions: true,
                    }}
                    format="YYYY-MM-DD HH:mm"
                    value={dateTimeRange}
                    onChange={handleTimeChange}
                    className="w-full rounded-lg h-10"
                    placeholder={[
                      t("booking_modal.start"),
                      t("booking_modal.end"),
                    ]}
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

                      if (type === "start") {
                        if (date.isSame(now, "date")) {
                          const currentHour = now.hour();
                          const currentMinute = now.minute();

                          return {
                            disabledHours: () =>
                              Array.from({ length: currentHour }, (_, i) => i),

                            disabledMinutes: (hour: number) =>
                              hour === currentHour
                                ? Array.from(
                                    { length: currentMinute },
                                    (_, i) => i,
                                  )
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
                      }

                      if (type === "end") {
                        if (start && date.isSame(start, "date")) {
                          const startHour = start.hour();
                          const startMinute = start.minute();

                          return {
                            disabledHours: () =>
                              Array.from({ length: startHour }, (_, i) => i),

                            disabledMinutes: (hour: number) =>
                              hour === startHour
                                ? Array.from(
                                    { length: startMinute },
                                    (_, i) => i,
                                  )
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
                      }

                      return {};
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={t("booking_modal.select_days")}
                  name="dayOnlys"
                  className="mb-0"
                >
                  <Select
                    mode="multiple"
                    placeholder={t("booking_modal.select_days_placeholder")}
                    options={dayOptions}
                    tagRender={tagRender}
                    maxTagCount={3}
                    maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
                    className="rounded-lg"
                    size="large"
                    style={{ fontSize: 14, width: "100%" }}
                    popupStyle={{ fontSize: 12 }}
                    onChange={(values: string[]) => {
                      const mapped = values.map((d) => WEEKMAP_DAY[d]);

                      setFormData((prev) => ({
                        ...prev,
                        dayOnly: mapped.length > 0,
                        dayOnlys: mapped,
                      }));
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={t("booking_modal.substitute_name")}
                  className="mb-0"
                >
                  <Input
                    value={
                      formData.substituteName
                        ? `${formData.substituteName} - ${formData.substituteDept}`
                        : ""
                    }
                    disabled
                    className="rounded-lg h-10"
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>

        {/* Footer - Compact */}
        <div className="shrink-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm"
          >
            {t("booking_modal.cancel")}
          </button>

          <button
            onClick={() => form.submit()}
            disabled={isSubmitDisabled()}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl disabled:bg-gray-400/50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                {t("booking_modal.submitting")}
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                {t("booking_modal.submit")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

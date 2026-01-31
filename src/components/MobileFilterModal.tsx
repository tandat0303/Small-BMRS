import React, { useMemo, useRef, useState, useEffect } from "react";
import { X, Filter, RefreshCcw } from "lucide-react";
import type { MobileFilterProps } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { formatRangeLabel } from "@/lib/helpers";
import storage from "@/lib/storage";
import { useTranslation } from "react-i18next";

const MobileFilterModal: React.FC<MobileFilterProps> = ({
  filters,
  setFilters,
  onClose,
  onFactoryChange,
  rooms = [],
}) => {
  const { t } = useTranslation();

  const user = JSON.parse(storage.get("user"));

  const isShowFactoryRadio = ["5", "7", 5, 7].includes(user?.level);

  const [showDateModal, setShowDateModal] = useState(false);
  const [userDefaultFactory, setUserDefaultFactory] = useState<string>("");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const timeRangeRef = useRef<HTMLDivElement>(null);

  const capacities = [5, 10, 50, 100, 200];
  const factories = ["LYV", "LHG", "LYM"];

  const areas = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];

    const uniqueAreas = [...new Set(rooms.map((room) => room.Area))];
    return uniqueAreas.sort();
  }, [rooms]);

  useEffect(() => {
    const userFactory = user?.factory;

    if (userFactory) {
      setUserDefaultFactory(userFactory);

      if (filters.factories.length === 0) {
        setFilters((prev) => ({
          ...prev,
          factories: [userFactory],
        }));

        if (onFactoryChange) {
          onFactoryChange([userFactory]);
        }
      }
    }
  }, []);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      areas: [],
    }));
  }, [areas]);

  useEffect(() => {
    if (showDateModal && filters.timeFilter.mode === "range") {
      if (filters.timeFilter.startDateTime && filters.timeFilter.endDateTime) {
        const start = new Date(filters.timeFilter.startDateTime);
        const end = new Date(filters.timeFilter.endDateTime);

        setStartDate(start);
        setEndDate(end);
        setStartTime(
          `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`,
        );
        setEndTime(
          `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`,
        );
      }
    }
  }, [showDateModal, filters.timeFilter]);

  const toggleArea = (area: string) => {
    setFilters((prev) => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area],
    }));
  };

  const toggleCapacity = (capacity: number) => {
    setFilters((prev) => ({
      ...prev,
      capacities: prev.capacities[0] === capacity ? [] : [capacity],
    }));
  };

  const selectFactory = (factory: string) => {
    if (filters.factories[0] === factory) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      factories: [factory],
      areas: [],
    }));

    if (onFactoryChange) {
      onFactoryChange([factory]);
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStartTime("");
    setEndTime("");

    setFilters({
      dateRange: { start: null, end: null },
      areas: [],
      capacities: [],
      roomStatus: null,
      timeFilter: { mode: null, startDateTime: null, endDateTime: null },
      factories: userDefaultFactory ? [userDefaultFactory] : [],
    });

    if (userDefaultFactory && onFactoryChange) {
      onFactoryChange([userDefaultFactory]);
    }
  };

  const isTimeFilterActive =
    filters.timeFilter.mode === "allDay" ||
    (filters.timeFilter.mode === "range" &&
      filters.timeFilter.startDateTime &&
      filters.timeFilter.endDateTime);

  const hasActiveFilters =
    filters.areas.length > 0 ||
    filters.capacities.length > 0 ||
    filters.roomStatus != null ||
    isTimeFilterActive ||
    (userDefaultFactory && filters.factories[0] !== userDefaultFactory);

  return (
    <motion.div
      className="bg-white rounded-t-2xl max-h-[90vh] w-full overflow-y-auto"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("filters.title")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 hover:text-blue-300 font-medium transition-colors"
                title={t("filters.clear_all")}
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Time Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t("filters.time")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  timeFilter:
                    p.timeFilter.mode === "allDay"
                      ? { mode: null, startDateTime: null, endDateTime: null }
                      : {
                          mode: "allDay",
                          startDateTime: null,
                          endDateTime: null,
                        },
                }))
              }
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                filters.timeFilter.mode === "allDay"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("filters.all_day")}
            </button>

            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  timeFilter:
                    p.timeFilter.mode === "range"
                      ? { mode: null, startDateTime: null, endDateTime: null }
                      : { ...p.timeFilter, mode: "range" },
                }))
              }
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                filters.timeFilter.mode === "range"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("filters.time_range")}
            </button>
          </div>

          {filters.timeFilter.mode === "range" && (
            <div
              onClick={() => setShowDateModal(true)}
              className="px-3 py-2 text-sm rounded border transition-colors mt-2 border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
              ref={timeRangeRef}
            >
              {filters.timeFilter.startDateTime &&
              filters.timeFilter.endDateTime ? (
                formatRangeLabel(
                  filters.timeFilter.startDateTime,
                  filters.timeFilter.endDateTime,
                )
              ) : (
                <span className="text-gray-400">
                  {t("filters.choose_range")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Area Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t("filters.area")}{" "}
            {areas.length > 0 && (
              <span className="text-gray-500">({areas.length})</span>
            )}
          </h3>
          {areas.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-2">
              {t("filters.select_factory_first")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`w-full px-3 py-2 text-sm text-center rounded border transition-colors ${
                    filters.areas.includes(area)
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Capacity Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t("filters.capacity")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {capacities.map((capacity) => (
              <button
                key={capacity}
                onClick={() => toggleCapacity(capacity)}
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  filters.capacities.includes(capacity)
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {capacity}
              </button>
            ))}
          </div>
        </div>

        {/* Room Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t("filters.room_status")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  roomStatus: p.roomStatus === "available" ? null : "available",
                }))
              }
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                filters.roomStatus === "available"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("filters.available")}
            </button>
            <button
              onClick={() =>
                setFilters((p) => ({
                  ...p,
                  roomStatus: p.roomStatus === "occupied" ? null : "occupied",
                }))
              }
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                filters.roomStatus === "occupied"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t("filters.occupied")}
            </button>
          </div>
        </div>

        {/* Factory Filter */}
        {isShowFactoryRadio && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("filters.factory")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {factories.map((factory) => (
                <button
                  key={factory}
                  onClick={() => selectFactory(factory)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    filters.factories?.includes(factory)
                      ? "bg-blue-500 border-blue-500 text-white font-medium"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {factory}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="pt-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            {t("filters.apply")}
          </button>
        </div>
      </div>

      {/* Date/Time Modal */}
      <AnimatePresence>
        {showDateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowDateModal(false)}
          >
            <div
              className="bg-white rounded-lg w-full max-w-md p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-semibold mb-4">
                {t("filters.choose_range")}
              </h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("filters.start_date")}
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={startDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) => {
                    const d = new Date(e.target.value);
                    setStartDate(d);
                    if (!endDate || d > endDate) {
                      setEndDate(d);
                    }
                  }}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="space-y-2 mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t("filters.end_date")}
                </label>
                <input
                  type="date"
                  min={startDate?.toISOString().split("T")[0]}
                  value={endDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="border p-2 w-full rounded"
                  disabled={!startDate}
                />
              </div>

              <div className="space-y-2 mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t("filters.start_time")}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="space-y-2 mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t("filters.end_time")}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border p-2 w-full rounded"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowDateModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  {t("filters.cancel")}
                </button>

                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setStartTime("");
                    setEndTime("");

                    setFilters((p) => ({
                      ...p,
                      timeFilter: {
                        mode: "range",
                        startDateTime: null,
                        endDateTime: null,
                      },
                    }));
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  {t("filters.clear")}
                </button>

                <button
                  disabled={!startDate || !endDate || !startTime || !endTime}
                  onClick={() => {
                    const startDT = new Date(
                      `${startDate?.toISOString().split("T")[0]}T${startTime}`,
                    );
                    const endDT = new Date(
                      `${endDate!.toISOString().split("T")[0]}T${endTime}`,
                    );

                    setFilters((p) => ({
                      ...p,
                      timeFilter: {
                        mode: "range",
                        startDateTime: startDT.toISOString(),
                        endDateTime: endDT.toISOString(),
                      },
                    }));

                    setShowDateModal(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {t("filters.ok")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MobileFilterModal;

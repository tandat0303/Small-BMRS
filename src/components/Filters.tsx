import React, { useEffect, useMemo, useRef, useState } from "react";
import { Filter, RefreshCcw } from "lucide-react";
import type { FilterProps } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { formatRangeLabel } from "@/lib/helpers";
import storage from "@/lib/storage";
import { useTranslation } from "react-i18next";

const Filters: React.FC<FilterProps> = ({
  filters,
  setFilters,
  onFactoryChange,
  rooms = [],
  disabled,
}) => {
  const { t } = useTranslation();

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
    const user = JSON.parse(storage.get("user"));
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

  const toggleArea = (area: string) => {
    setFilters((prev) => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area],
    }));
  };

  // const toggleCapacity = (capacity: number) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     capacities: prev.capacities.includes(capacity)
  //       ? prev.capacities.filter((c) => c !== capacity)
  //       : [...prev.capacities, capacity],
  //   }));
  // };

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        timeRangeRef.current &&
        timeRangeRef.current.contains(event.target as Node)
      ) {
        setShowDateModal(false);
      }
    };

    if (showDateModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDateModal]);

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
    <div className="relative">
      {disabled && <div className="absolute inset-0 z-10 cursor-no-drop" />}

      <div className={disabled ? "opacity-60 select-none" : ""}>
        <aside className="w-full md:w-90 bg-white border-l border-gray-200 p-4 sm:p-6 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-700 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {t("filters.title")}
              </h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 hover:text-blue-300 font-medium transition-colors"
                title={t("filters.clear_all")}
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mb-3">
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
                className={`px-3 py-1 text-sm rounded border transition-colors cursor-pointer ${
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
                className={`px-3 py-1 text-sm rounded border transition-colors cursor-pointer ${
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
                ref={timeRangeRef}
                className="border border-gray-300 rounded px-3 py-1 mt-2 cursor-pointer hover:bg-gray-50 transition text-sm"
              >
                <span
                  className={
                    filters.timeFilter.startDateTime &&
                    filters.timeFilter.endDateTime
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {filters.timeFilter.startDateTime &&
                  filters.timeFilter.endDateTime
                    ? formatRangeLabel(
                        filters.timeFilter.startDateTime,
                        filters.timeFilter.endDateTime,
                      )
                    : t("filters.select_time_range")}
                </span>
              </div>
            )}
          </div>

          {/* Area Filter */}
          <div className="mb-3">
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
                    className={`w-full px-3 py-0.5 text-sm text-center rounded border transition-colors cursor-pointer ${
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
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("filters.capacity")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {capacities.map((capacity) => (
                <button
                  key={capacity}
                  onClick={() => toggleCapacity(capacity)}
                  className={`px-3 py-1 text-sm rounded border transition-colors cursor-pointer ${
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
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("filters.room_status")}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    roomStatus:
                      p.roomStatus === "available" ? null : "available",
                  }))
                }
                className={`px-3 py-1 text-sm rounded border transition-colors cursor-pointer ${
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
                className={`px-3 py-1 text-sm rounded border transition-colors cursor-pointer ${
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
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("filters.factory")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {factories.map((factory) => (
                <button
                  key={factory}
                  onClick={() => selectFactory(factory)}
                  className={`px-3 py-1 text-sm rounded border transition-colors cursor-pointer ${
                    filters.factories.includes(factory)
                      ? "bg-blue-500 border-blue-500 text-white font-medium"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {factory}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {showDateModal && (
              <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg w-[420px] p-5">
                    <h2 className="font-semibold mb-4">
                      {t("filters.choose_range")}
                    </h2>

                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={startDate?.toISOString().split("T")[0] || ""}
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        setStartDate(d);
                        setEndDate(d);
                      }}
                      className="border p-2 w-full mb-2 rounded"
                    />

                    <input
                      type="date"
                      min={startDate?.toISOString().split("T")[0]}
                      value={endDate?.toISOString().split("T")[0] || ""}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      className="border p-2 w-full mb-3 rounded"
                    />

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border p-2 w-full mb-2 rounded"
                    />

                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border p-2 w-full mb-4 rounded"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowDateModal(false)}
                        className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-300"
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
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400"
                      >
                        {t("filters.clear")}
                      </button>

                      <button
                        disabled={!startDate || !startTime || !endTime}
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
                        className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-40"
                      >
                        {t("filters.ok")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
};

export default Filters;

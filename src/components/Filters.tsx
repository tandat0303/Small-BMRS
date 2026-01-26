import React, { useEffect, useRef, useState } from "react";
import { Filter, RefreshCcw } from "lucide-react";
import type { FilterState } from "../types";
import { AnimatePresence, motion } from "framer-motion";
import { formatRangeLabel } from "@/lib/helpers";

interface FilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const Filters: React.FC<FilterProps> = ({ filters, setFilters }) => {
  const [showDateModal, setShowDateModal] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const timeRangeRef = useRef<HTMLDivElement>(null);

  const areas = ["TTKTM - 開發中心", "VP2 - 廠務室", "VPCT"];
  const capacities = [5, 10, 50, 100, 200];

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
      capacities: prev.capacities.includes(capacity)
        ? prev.capacities.filter((c) => c !== capacity)
        : [...prev.capacities, capacity],
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      areas: [],
      capacities: [],
      roomStatus: null,
      timeFilter: { mode: null, startDateTime: null, endDateTime: null },
    });
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
    isTimeFilterActive;

  return (
    <aside className="w-full md:w-90 bg-white border-l border-gray-200 p-4 sm:p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Bộ lọc phòng họp
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-500 hover:text-blue-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Thời gian</h3>

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
            className={`px-3 py-2 text-sm rounded border transition-colors cursor-pointer ${
              filters.timeFilter.mode === "allDay"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Cả ngày
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
            className={`px-3 py-2 text-sm rounded border transition-colors cursor-pointer ${
              filters.timeFilter.mode === "range"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Khoảng thời gian
          </button>
        </div>

        {filters.timeFilter.mode === "range" && (
          <div
            onClick={() => setShowDateModal(true)}
            className="px-3 py-2 text-sm rounded border transition-colors mt-2 border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
            ref={timeRangeRef}
          >
            {filters.timeFilter.startDateTime ? (
              formatRangeLabel(
                filters.timeFilter.startDateTime,
                filters.timeFilter.endDateTime!,
              )
            ) : (
              <span className="ml-1">Chọn ngày & giờ</span>
            )}
          </div>
        )}
      </div>

      {/* Area Filter */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Khu vực</h3>
        <div className="grid grid-cols-2 gap-2">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => toggleArea(area)}
              className={`w-full px-3 py-2 text-sm text-center rounded border transition-colors cursor-pointer ${
                filters.areas.includes(area)
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity Filter */}
      <div className="mb-5">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Sức chứa</h3>
        <div className="grid grid-cols-2 gap-2">
          {capacities.map((capacity) => (
            <button
              key={capacity}
              onClick={() => toggleCapacity(capacity)}
              className={`px-3 py-2 text-sm rounded border transition-colors cursor-pointer ${
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
          Trạng thái phòng họp
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              setFilters((p) => ({
                ...p,
                roomStatus: p.roomStatus === "available" ? null : "available",
              }))
            }
            className={`px-3 py-2 text-sm rounded border transition-colors cursor-pointer ${
              filters.roomStatus === "available"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Trống
          </button>
          <button
            onClick={() =>
              setFilters((p) => ({
                ...p,
                roomStatus: p.roomStatus === "occupied" ? null : "occupied",
              }))
            }
            className={`px-3 py-2 text-sm rounded border transition-colors cursor-pointer ${
              filters.roomStatus === "occupied"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Có lịch
          </button>
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
                <h2 className="font-semibold mb-4">Chọn khoảng thời gian</h2>

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
                    Hủy
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
                    Clear
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
                    OK
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Filters;
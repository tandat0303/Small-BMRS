import React, { useState } from "react";
import type { MobileFilterProps } from "@/types";
import { Filter, X } from "lucide-react";
import { formatRangeLabel } from "@/lib/helpers";

const MobileFilterModal: React.FC<MobileFilterProps> = ({
  filters,
  setFilters,
  onClose,
}) => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const areas = ["TTKTM - 開發中心", "VP2 - 辦務室", "VPCT"];
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

  const hasActiveFilters =
    filters.areas.length > 0 ||
    filters.capacities.length > 0 ||
    filters.roomStatus != null ||
    filters.timeFilter.mode != null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 lg:hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Bộ lọc phòng họp</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Time Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Thời gian
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
                    : "border-gray-300 text-gray-600"
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
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  filters.timeFilter.mode === "range"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                Khoảng thời gian
              </button>
            </div>

            {filters.timeFilter.mode === "range" && (
              <button
                onClick={() => setShowDateModal(true)}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 mt-2 text-left"
              >
                {filters.timeFilter.startDateTime ? (
                  formatRangeLabel(
                    filters.timeFilter.startDateTime,
                    filters.timeFilter.endDateTime!,
                  )
                ) : (
                  <span>Chọn ngày & giờ</span>
                )}
              </button>
            )}
          </div>

          {/* Area Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Khu vực</h3>
            <div className="grid grid-cols-2 gap-2">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    filters.areas.includes(area)
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Capacity Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sức chứa</h3>
            <div className="grid grid-cols-3 gap-2">
              {capacities.map((capacity) => (
                <button
                  key={capacity}
                  onClick={() => toggleCapacity(capacity)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    filters.capacities.includes(capacity)
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-600"
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
                    roomStatus:
                      p.roomStatus === "available" ? null : "available",
                  }))
                }
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  filters.roomStatus === "available"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 text-gray-600"
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
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  filters.roomStatus === "occupied"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                Có lịch
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-2 flex gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
          {/* <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Áp dụng
          </button> */}
        </div>
      </div>

      {/* Date/Time Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-5">
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
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
                    `${endDate?.toISOString().split("T")[0]}T${endTime}`,
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
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-40 hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilterModal;

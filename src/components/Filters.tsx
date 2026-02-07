import React, { useEffect, useMemo, useState } from "react";
import { Filter, RefreshCcw } from "lucide-react";
import type { FilterProps } from "../types";
import storage from "@/lib/storage";
import { useTranslation } from "react-i18next";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const Filters: React.FC<FilterProps> = ({
  filters,
  setFilters,
  onFactoryChange,
  rooms = [],
  disabled,
}) => {
  const { t } = useTranslation();

  const user = storage.get("user");

  const isShowFactoryRadio = ["5", "7", 5, 7].includes(user?.level);

  const [userDefaultFactory, setUserDefaultFactory] = useState<string>("");

  const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    null,
    null,
  ]);

  const { RangePicker } = DatePicker;

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
    setRange([null, null]);

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

  // Update timeFilter when range changes
  useEffect(() => {
    if (filters.timeFilter.mode === "range") {
      if (range[0] && range[1]) {
        setFilters((prev) => ({
          ...prev,
          timeFilter: {
            mode: "range",
            startDateTime: range[0]?.toISOString() ?? null,
            endDateTime: range[1]?.toISOString() ?? null,
          },
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          timeFilter: {
            mode: "range",
            startDateTime: null,
            endDateTime: null,
          },
        }));
      }
    }
  }, [range]);

  // Sync range state with filters when mode changes
  useEffect(() => {
    if (filters.timeFilter.mode !== "range") {
      setRange([null, null]);
    } else if (
      filters.timeFilter.startDateTime &&
      filters.timeFilter.endDateTime
    ) {
      setRange([
        dayjs(filters.timeFilter.startDateTime),
        dayjs(filters.timeFilter.endDateTime),
      ]);
    }
  }, [filters.timeFilter.mode]);

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
        <aside className="w-full md:w-[28rem] bg-white border-l border-gray-200 px-4 sm:px-6 py-6 sm:py-8 h-screen flex-shrink-0">
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
                className="text-sm text-blue-500 hover:text-blue-300 font-medium transition-colors cursor-pointer"
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
              <div className="mt-2">
                <RangePicker
                  showTime={{
                    format: "HH:mm",
                    minuteStep: 5,
                  }}
                  disabledTime={() => ({
                    disabledHours: () => [
                      0, 1, 2, 3, 4, 5, 6, 17, 18, 19, 20, 21, 22, 23,
                    ],
                  })}
                  placeholder={[t("filters.start"), t("filters.end")]}
                  format="YYYY-MM-DD HH:mm"
                  value={range}
                  onChange={(values) => setRange(values as any)}
                  className="w-full mb-4 px-3 py-1 mt-2 cursor-pointer transition text-sm mt-1"
                />
              </div>
            )}
          </div>

          {/* Area Filter */}
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              {t("filters.area")}
              {/* {" "}
              {areas.length > 0 && (
                <span className="text-gray-500">({areas.length})</span>
              )} */}
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
          {isShowFactoryRadio && (
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
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {factory}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Filters;

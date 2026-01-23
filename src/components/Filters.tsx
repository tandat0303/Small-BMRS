import React from 'react';
import { Filter } from 'lucide-react';
import type { FilterState } from '../types';

interface FilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const Filters: React.FC<FilterProps> = ({ filters, setFilters }) => {
  const areas = ['TTKTM - 開發中心', 'VP2 - 廠務室', 'VPCT'];
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
      roomStatus: 'all',
    });
  };

  const hasActiveFilters =
    filters.areas.length > 0 ||
    filters.capacities.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <aside className="w-full md:w-80 bg-white border-l border-gray-200 p-4 sm:p-6 overflow-y-auto max-h">
      <div className="flex items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Bộ lọc phòng họp</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            Xóa
          </button>
        )}
      </div>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Thời gian</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            placeholder="Cả ngày"
            value={filters.dateRange.start || ''}
            className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value },
              }))
            }
          />
          <input
            type="date"
            placeholder="Khoảng thời gian"
            value={filters.dateRange.end || ''}
            className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value },
              }))
            }
          />
        </div>
      </div>

      {/* Area Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Khu vực</h3>
        <div className="space-y-2">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => toggleArea(area)}
              className={`w-full px-3 py-2.5 text-xs sm:text-sm text-left rounded-lg border transition-colors ${
                filters.areas.includes(area)
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Capacity Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sức chứa</h3>
        <div className="grid grid-cols-2 gap-2">
          {capacities.map((capacity) => (
            <button
              key={capacity}
              onClick={() => toggleCapacity(capacity)}
              className={`px-3 py-2.5 text-xs sm:text-sm rounded-lg border transition-colors ${
                filters.capacities.includes(capacity)
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {capacity}
            </button>
          ))}
        </div>
      </div>

      {/* Room Status Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Trạng thái phòng họp
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, roomStatus: 'available' }))
            }
            className={`px-3 py-2.5 text-xs sm:text-sm rounded-lg border transition-colors ${
              filters.roomStatus === 'available'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Trống
          </button>
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, roomStatus: 'occupied' }))
            }
            className={`px-3 py-2.5 text-xs sm:text-sm rounded-lg border transition-colors ${
              filters.roomStatus === 'occupied'
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Có lịch
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Filters;

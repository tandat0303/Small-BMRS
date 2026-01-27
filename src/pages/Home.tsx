import { useState } from "react";
import Header from "../components/Header";
import Filters from "../components/Filters";
import RoomList from "../components/RoomList";
import BookingHistory from "../components/BookingHistory";
import type { FilterState, Room, Schedule } from "../types";
import { Filter } from "lucide-react";
import MobileFilterModal from "@/components/MobileFilterModal";
import { AnimatePresence, motion } from "framer-motion";
import { factoryFilterAPI } from "@/services/factory.api";

const Home = () => {
  const [activeTab, setActiveTab] = useState<"home" | "history">("home");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: null,
      end: null,
    },
    areas: [],
    capacities: [],
    roomStatus: null,
    timeFilter: {
      mode: null,
      startDateTime: null,
      endDateTime: null,
    },
    factories: [],
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFactoryChange = async (selectedFactories: string[]) => {
    if (selectedFactories.length === 0) return;

    const factory = selectedFactories[0];

    try {
      setLoading(true);
      setError(null);

      const { rooms: fetchedRooms, schedules: fetchedSchedules } =
        await factoryFilterAPI.getRoomDataByFactory(factory);

      setRooms(fetchedRooms);
      setSchedules(fetchedSchedules);
    } catch (err) {
      setError("Không thể tải dữ liệu phòng họp. Vui lòng thử lại.");

      setRooms([]);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-y-auto scrollbar-hide">
      <Header />

      {/* Mobile Filter Button */}
      {activeTab === "home" && (
        <header className="bg-white lg:hidden">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">Lọc</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-auto">
        {/* Main Content - Scrollable */}
        <div className="flex-1 order-2 lg:order-1 flex flex-col lg:overflow-auto">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
              <div className="flex justify-center gap-2 sm:gap-4 md:gap-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`py-2.5 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === "home"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`py-2.5 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === "history"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Lịch sử đặt phòng
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
              <div className="animate-fadeIn">
                {activeTab === "home" ? (
                  <RoomList
                    filters={filters}
                    rooms={rooms}
                    schedules={schedules}
                    loading={loading}
                    error={error}
                  />
                ) : (
                  <BookingHistory />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Sidebar - Fixed/Non-scrollable */}
        {activeTab === "home" && (
          <div className="order-1 lg:order-2 flex-shrink-0 bg-white lg:bg-transparent hidden lg:block">
            <Filters
              filters={filters}
              setFilters={setFilters}
              onFactoryChange={handleFactoryChange}
              rooms={rooms}
            />
          </div>
        )}

        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MobileFilterModal
                filters={filters}
                setFilters={setFilters}
                onClose={() => setShowMobileFilters(false)}
                onFactoryChange={handleFactoryChange}
                rooms={rooms}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;

import { useState } from 'react';
import Header from '../components/Header';
import Filters from '../components/Filters';
import RoomList from '../components/RoomList';
import BookingHistory from '../components/BookingHistory';
import type { FilterState } from '../types';

const Home = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'history'>('home');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: null,
      end: null,
    },
    areas: [],
    capacities: [],
    roomStatus: 'all',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 order-2 lg:order-1">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 sm:top-20 z-10">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
              <div className="flex justify-center gap-2 sm:gap-4 md:gap-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`py-2.5 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'home'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2.5 sm:py-3 md:py-4 px-2.5 sm:px-3 md:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Lịch sử đặt phòng
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            <div className="animate-fadeIn">
              {activeTab === 'home' ? (
                <RoomList filters={filters} />
              ) : (
                <BookingHistory />
              )}
            </div>
          </div>
        </div>

        {/* Filters Sidebar */}
        <div className="order-1 lg:order-2 bg-white lg:bg-transparent">
          <Filters filters={filters} setFilters={setFilters} />
        </div>
      </div>
    </div>
  );
};

export default Home;

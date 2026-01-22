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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'home'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Lịch sử đặt phòng
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {activeTab === 'home' ? (
              <RoomList filters={filters} />
            ) : (
              <BookingHistory />
            )}
          </div>
        </div>

        <Filters filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
};

export default Home;
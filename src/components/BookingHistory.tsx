import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Trash2, List } from 'lucide-react';
import type { Meeting } from '../types';
import { scheduleAPI } from '../services/rooms.api';
import storage from '@/lib/storage';

const BookingHistory: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(storage.get("user"));
      const userId = user.userId;
      const data = await scheduleAPI.getMySchedule('LYV', userId);
      setMeetings(data);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải lịch sử');
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (scheduleId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) {
      return;
    }

    try {
      await scheduleAPI.cancelSchedule(scheduleId);
      // Refresh the list
      fetchSchedule();
    } catch (err) {
      alert('Không thể hủy đặt phòng. Vui lòng thử lại.');
      console.error('Error canceling schedule:', err);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }),
      time: date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const upcoming = isUpcoming(meeting.Start_Time);
    
    if (activeFilter === 'upcoming') return upcoming;
    if (activeFilter === 'completed') return !upcoming && meeting.Status !== 'cancelled';
    if (activeFilter === 'cancelled') return meeting.Status === 'cancelled';
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2 sm:gap-6 min-w-min sm:min-w-0">
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`pb-3 px-2 sm:px-0 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-2 ${
              activeFilter === 'upcoming'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Cuộc họp sắp diễn ra</span>
            <span className="sm:hidden">Sắp diễn ra</span>
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`pb-3 px-2 sm:px-0 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-2 ${
              activeFilter === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Cuộc họp đã kết thúc</span>
            <span className="sm:hidden">Đã kết thúc</span>
          </button>
          <button
            onClick={() => setActiveFilter('cancelled')}
            className={`pb-3 px-2 sm:px-0 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1 sm:gap-2 ${
              activeFilter === 'cancelled'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Cuộc họp đã hủy</span>
            <span className="sm:hidden">Đã hủy</span>
          </button>
        </div>
      </div>

      {/* Meeting List */}
      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">Không có lịch họp nào</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredMeetings.map((meeting) => {
            const startDateTime = formatDateTime(meeting.Start_Time);
            const endDateTime = formatDateTime(meeting.End_Time);
            const upcoming = isUpcoming(meeting.Start_Time);

            return (
              <div
                key={meeting.ID_Schedule}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Meeting Title */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">
                      {meeting.Meeting_Name}
                    </h3>

                    {/* Room Info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{meeting.Room_Name}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>{meeting.Area}</span>
                    </div>

                    {/* Date and Time */}
                    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{startDateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{startDateTime.time} - {endDateTime.time}</span>
                      </div>
                    </div>

                    {/* Meeting Details */}
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-3">
                      <div>
                        <span className="font-medium">Phòng ban:</span> <span className="truncate">{meeting.Department}</span>
                      </div>
                      <div>
                        <span className="font-medium">Người chủ trì:</span> <span className="truncate">{meeting.Host_Name} - {meeting.Host_ID}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {meeting.Status === 'cancelled' ? (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Đã hủy
                        </span>
                      ) : upcoming ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Sắp diễn ra
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          Đã hoàn thành
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {upcoming && meeting.Status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(meeting.ID_Schedule)}
                      className="ml-auto sm:ml-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Hủy đặt phòng"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;

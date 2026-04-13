import React, { useState, useMemo, useCallback } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { CalendarEvent } from '~/lib/api/calendar';

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventCreate: (date: Date, hour?: number) => void;
  loading?: boolean;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
  onEventCreate,
  loading = false,
  view,
  onViewChange
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      const days = direction === 'prev' ? -7 : 7;
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }, []);

  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      const days = direction === 'prev' ? -1 : 1;
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }, []);

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    switch (view) {
      case 'month':
        navigateMonth(direction);
        break;
      case 'week':
        navigateWeek(direction);
        break;
      case 'day':
        navigateDay(direction);
        break;
    }
  }, [view, navigateMonth, navigateWeek, navigateDay]);

  const getMonthDays = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 42); // 6 weeks

    const current = new Date(startDate);
    while (current < endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  const getEventsForHour = useCallback((date: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const hourStart = new Date(date);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(date);
      hourEnd.setHours(hour + 1, 0, 0, 0);
      
      return (eventStart >= hourStart && eventStart < hourEnd) ||
             (eventEnd > hourStart && eventEnd <= hourEnd) ||
             (eventStart <= hourStart && eventEnd >= hourEnd);
    });
  }, [events]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const renderMonthView = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-700 py-2 px-3">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
              {day}
            </div>
          </div>
        ))}
        {getMonthDays.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 min-h-24 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : ''
              }`}
              onClick={() => onDateSelect(date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${
                  isToday(date) 
                    ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-semibold'
                    : isSelected(date)
                    ? 'bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center font-semibold'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventCreate(date);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <PlusIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 truncate hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-600">
        <div className="bg-gray-50 dark:bg-gray-700 p-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
            Time
          </div>
        </div>
        {getWeekDays.map(date => (
          <div key={date.toISOString()} className="bg-gray-50 dark:bg-gray-700 p-3">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {DAYS_OF_WEEK[date.getDay()]}
              </div>
              <div className={`text-lg ${
                isToday(date) 
                  ? 'bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mt-1'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {date.getDate()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-600 border-t border-gray-200 dark:border-gray-600">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
              </div>
            </div>
            {getWeekDays.map(date => {
              const hourEvents = getEventsForHour(date, hour);
              return (
                <div
                  key={`${date.toISOString()}-${hour}`}
                  className="bg-white dark:bg-gray-800 min-h-16 p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => onEventCreate(date, hour)}
                >
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 truncate hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currentDate.toLocaleDateString([], { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => onEventCreate(currentDate)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Event
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {Array.from({ length: 24 }, (_, hour) => {
            const hourEvents = getEventsForHour(currentDate, hour);
            return (
              <div key={hour} className="flex border-b border-gray-100 dark:border-gray-600">
                <div className="w-20 p-3 text-right bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </div>
                </div>
                <div 
                  className="flex-1 min-h-16 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => onEventCreate(currentDate, hour)}
                >
                  {hourEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="mb-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">{event.title}</h4>
                        <div className="flex items-center text-blue-600 dark:text-blue-300 text-sm">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-center mt-1 text-blue-600 dark:text-blue-300 text-sm">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center mt-1 text-blue-600 dark:text-blue-300 text-sm">
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      {event.description && (
                        <p className="mt-2 text-sm text-blue-700 dark:text-blue-200 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'week':
        const weekStart = getWeekDays[0];
        const weekEnd = getWeekDays[6];
        return `${weekStart.getMonth() === weekEnd.getMonth() 
          ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}`
          : `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}`
        }, ${weekStart.getFullYear()}`;
      case 'day':
        return currentDate.toLocaleDateString([], { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleNavigation('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {getViewTitle()}
          </h2>
          <button
            onClick={() => handleNavigation('next')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex rounded-md shadow-sm">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => onViewChange(viewType)}
                className={`px-3 py-2 text-sm font-medium ${
                  view === viewType
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                } ${
                  viewType === 'month' 
                    ? 'rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600'
                    : viewType === 'day'
                    ? 'rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600'
                    : 'border-t border-b border-gray-300 dark:border-gray-600'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Today Button */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
};

export default CalendarView;
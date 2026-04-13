import type { MetaFunction } from "@remix-run/node";
import { useState, useMemo } from "react";
import { useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import CalendarView from "~/components/calendar/CalendarView";
import EventModal from "~/components/calendar/EventModal";
import {
  PlusIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
  LinkIcon
} from "@heroicons/react/24/outline";
import { useCalendar, useCalendarEvents } from "~/hooks/useCalendar";
import type { CalendarEventAttributes } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Scheduling - CRM Dashboard" },
    { name: "description", content: "Manage calendar events and scheduling" },
  ];
};

export default function SchedulingIndex() {
  const { orgId } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventModalDate, setEventModalDate] = useState<Date | null>(null);
  const [eventModalHour, setEventModalHour] = useState<number | undefined>(undefined);
  const [isCreateCalendarModalOpen, setIsCreateCalendarModalOpen] = useState(false);
  const [newCalendarData, setNewCalendarData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    visibility: 'private' as 'public' | 'private',
    iCalUrl: '',
    syncEnabled: false
  });

  // Hooks
  const { calendars, loading: calendarsLoading, createCalendar } = useCalendar();
  const defaultCalendar = calendars.find(cal => cal.attributes?.is_default) || calendars[0];
  const { events: rawEvents, loading: eventsLoading, createEvent, updateEvent, deleteEvent } = useCalendarEvents(defaultCalendar?.id || '');

  // Map JSON:API resources to the flat shape CalendarView/EventModal expect
  const mappedEvents = useMemo(() =>
    rawEvents.map(e => ({
      id: e.id,
      type: e.type,
      title: e.attributes?.title || '',
      description: e.attributes?.description || '',
      start: e.attributes?.start_at || '',
      end: e.attributes?.end_at || '',
      allDay: e.attributes?.all_day || false,
      location: e.attributes?.location || '',
      attendees: e.attributes?.attendees || [],
      status: e.attributes?.status || null,
      visibility: e.attributes?.visibility || null,
    })),
    [rawEvents]
  );

  const selectedEvent = selectedEventId ? mappedEvents.find(e => e.id === selectedEventId) || null : null;

  const handleEventClick = (event: typeof mappedEvents[number]) => {
    setSelectedEventId(event.id);
    setEventModalDate(null);
    setEventModalHour(undefined);
    setIsEventModalOpen(true);
  };

  const handleEventCreate = (date: Date, hour?: number) => {
    setSelectedEvent(null);
    setEventModalDate(date);
    setEventModalHour(hour);
    setIsEventModalOpen(true);
  };

  const handleEventSave = async (eventData: Record<string, unknown> & { id?: string }) => {
    const attrs: Partial<CalendarEventAttributes> = {
      title: eventData.title as string,
      description: (eventData.description as string) || undefined,
      location: (eventData.location as string) || undefined,
      all_day: eventData.allDay as boolean | undefined,
      start_at: eventData.start as string,
      end_at: eventData.end as string,
      attendees: eventData.attendees as CalendarEventAttributes['attendees'],
      visibility: (eventData.visibility as string) || undefined,
    };

    if (eventData.id) {
      await updateEvent({ id: eventData.id, attrs });
    } else {
      await createEvent(attrs);
    }
    setIsEventModalOpen(false);
  };

  const handleEventDelete = async (eventId: string) => {
    await deleteEvent(eventId);
    setIsEventModalOpen(false);
  };

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newCalendarData.name.trim()) return;

    try {
      await createCalendar({
        name: newCalendarData.name,
        description: newCalendarData.description || undefined,
        color: newCalendarData.color,
        visibility: newCalendarData.visibility,
      });
      setIsCreateCalendarModalOpen(false);
      setNewCalendarData({
        name: '',
        description: '',
        color: '#3b82f6',
        visibility: 'private',
        iCalUrl: '',
        syncEnabled: false
      });
    } catch (error) {
      console.error('Failed to create calendar:', error);
      alert('Failed to create calendar. Please try again.');
    }
  };

  const handleQuickCreateCalendar = async () => {
    if (!orgId) return;

    try {
      await createCalendar({
        name: 'My Calendar',
        description: 'Default calendar for scheduling',
        color: '#3b82f6',
        visibility: 'private',
      });
    } catch (error) {
      console.error('Failed to create calendar:', error);
      alert('Failed to create calendar. Please try again.');
    }
  };

  // Show loading state
  if (calendarsLoading && calendars.length === 0) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show setup screen if no calendars
  if (!calendarsLoading && calendars.length === 0) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No calendars found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first calendar.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleQuickCreateCalendar}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  Quick Create
                </button>
                <button
                  onClick={() => setIsCreateCalendarModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Cog6ToothIcon className="-ml-1 mr-2 h-4 w-4" />
                  Custom Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scheduling</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage your calendar events and appointments
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Quick Create Event */}
                <button
                  onClick={() => handleEventCreate(selectedDate)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  New Event
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Calendars
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {calendars.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PlusIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Events
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {mappedEvents.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CloudArrowUpIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Synced Calendars
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {calendars.filter(cal => cal.attributes?.sync_enabled).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LinkIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        iCal Integrations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {calendars.filter(cal => cal.attributes?.i_cal_url).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <CalendarView
            events={mappedEvents as any}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onEventClick={handleEventClick}
            onEventCreate={handleEventCreate}
            loading={eventsLoading}
            view={calendarView}
            onViewChange={setCalendarView}
          />

          {/* Event Modal */}
          <EventModal
            isOpen={isEventModalOpen}
            onClose={() => setIsEventModalOpen(false)}
            onSave={handleEventSave}
            onDelete={handleEventDelete}
            event={selectedEvent as any}
            defaultDate={eventModalDate || selectedDate}
            defaultHour={eventModalHour}
            calendarId={defaultCalendar?.id || ''}
            loading={eventsLoading}
          />

          {/* Create Calendar Modal */}
          {isCreateCalendarModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="flex items-center justify-center min-h-full p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create New Calendar</h3>

                  <form onSubmit={handleCreateCalendar} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Calendar Name *
                      </label>
                      <input
                        type="text"
                        value={newCalendarData.name}
                        onChange={(e) => setNewCalendarData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter calendar name..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newCalendarData.description}
                        onChange={(e) => setNewCalendarData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      <div className="flex space-x-2">
                        {[
                          { value: '#ef4444', name: 'Red' },
                          { value: '#f97316', name: 'Orange' },
                          { value: '#eab308', name: 'Yellow' },
                          { value: '#22c55e', name: 'Green' },
                          { value: '#3b82f6', name: 'Blue' },
                          { value: '#6366f1', name: 'Indigo' },
                          { value: '#a855f7', name: 'Purple' },
                          { value: '#ec4899', name: 'Pink' }
                        ].map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewCalendarData(prev => ({ ...prev, color: color.value }))}
                            className={`w-8 h-8 rounded-full ${newCalendarData.color === color.value ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={newCalendarData.visibility === 'private'}
                          onChange={(e) => setNewCalendarData(prev => ({ ...prev, visibility: e.target.value as 'private' }))}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Private</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={newCalendarData.visibility === 'public'}
                          onChange={(e) => setNewCalendarData(prev => ({ ...prev, visibility: e.target.value as 'public' }))}
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateCalendarModalOpen(false);
                          setNewCalendarData({
                            name: '',
                            description: '',
                            color: '#3b82f6',
                            visibility: 'private',
                            iCalUrl: '',
                            syncEnabled: false
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newCalendarData.name.trim()}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Calendar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

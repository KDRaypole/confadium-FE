import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { useNodeContext } from "~/contexts/NodeContext";
import {
  ArrowLeftIcon,
  PlusIcon,
  Cog6ToothIcon,
  TrashIcon,
  LinkIcon,
  CloudArrowDownIcon,
  PencilIcon
} from "@heroicons/react/24/outline";
import { useCalendar, useCalendarIntegrations } from "~/hooks/useCalendar";
import type { CalendarAttributes } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Calendar Settings - CRM Dashboard" },
    { name: "description", content: "Manage calendar settings and integrations" },
  ];
};

export default function SchedulingSettings() {
  const { orgId } = useParams();
  const { buildListPath } = useNodeContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<ReturnType<typeof useCalendar>['calendars'][number] | null>(null);
  const [newCalendarData, setNewCalendarData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    visibility: 'private' as 'public' | 'private',
    iCalUrl: '',
    syncEnabled: false
  });

  // Hooks
  const {
    calendars,
    loading: calendarsLoading,
    createCalendar,
    updateCalendar,
    deleteCalendar
  } = useCalendar();

  const defaultCalendar = calendars.find(cal => cal.attributes?.is_default) || calendars[0];

  const {
    integrations,
    loading: integrationsLoading,
    deleteIntegration
  } = useCalendarIntegrations(defaultCalendar?.id || '');

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
      setIsCreateModalOpen(false);
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
    }
  };

  const handleUpdateCalendar = async (calendarId: string, updates: Partial<CalendarAttributes>) => {
    try {
      await updateCalendar({ id: calendarId, attrs: updates });
      setEditingCalendar(null);
    } catch (error) {
      console.error('Failed to update calendar:', error);
    }
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    if (window.confirm('Are you sure you want to delete this calendar? This will also delete all events in this calendar.')) {
      try {
        await deleteCalendar(calendarId);
      } catch (error) {
        console.error('Failed to delete calendar:', error);
      }
    }
  };

  const colorOptions = [
    { value: '#ef4444', name: 'Red' },
    { value: '#f97316', name: 'Orange' },
    { value: '#eab308', name: 'Yellow' },
    { value: '#22c55e', name: 'Green' },
    { value: '#3b82f6', name: 'Blue' },
    { value: '#6366f1', name: 'Indigo' },
    { value: '#a855f7', name: 'Purple' },
    { value: '#ec4899', name: 'Pink' }
  ];

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                to={buildListPath('scheduling')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar Settings</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage your calendars, integrations, and sync settings
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Calendars Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Calendars</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Add Calendar
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {calendarsLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : calendars.length === 0 ? (
                  <div className="p-6 text-center">
                    <Cog6ToothIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No calendars</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new calendar.</p>
                  </div>
                ) : (
                  calendars.map((calendar) => (
                    <div key={calendar.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: calendar.attributes?.color || '#3b82f6' }}
                          />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {calendar.attributes?.name || ''}
                              {calendar.attributes?.is_default && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Default
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {calendar.attributes?.description || 'No description'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingCalendar(calendar)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {!calendar.attributes?.is_default && (
                            <button
                              onClick={() => handleDeleteCalendar(calendar.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* External Integrations Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">External Integrations</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Connect with Google Calendar, Outlook, and other calendar providers
                </p>
              </div>

              <div className="p-6">
                {integrationsLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : integrations.length === 0 ? (
                  <div className="text-center">
                    <LinkIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No integrations</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      External calendar integrations will appear here when connected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="capitalize font-medium text-gray-900 dark:text-gray-100">
                            {integration.attributes?.provider || ''}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {integration.attributes?.sync_enabled ? 'Sync enabled' : 'Sync disabled'}
                          </div>
                          {integration.attributes?.last_sync_at && (
                            <div className="text-xs text-gray-400">
                              Last synced: {new Date(integration.attributes.last_sync_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteIntegration(integration.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Create Calendar Modal */}
          {isCreateModalOpen && (
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newCalendarData.description}
                        onChange={(e) => setNewCalendarData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      <div className="flex space-x-2">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setNewCalendarData(prev => ({ ...prev, color: color.value }))}
                            className={`w-8 h-8 rounded-full ${newCalendarData.color === color.value ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}
                            style={{ backgroundColor: color.value }}
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
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Create Calendar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Calendar Modal */}
          {editingCalendar && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="flex items-center justify-center min-h-full p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Edit Calendar</h3>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateCalendar(editingCalendar.id, {
                        name: editingCalendar.attributes?.name,
                        description: editingCalendar.attributes?.description,
                        color: editingCalendar.attributes?.color,
                        sync_enabled: editingCalendar.attributes?.sync_enabled
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Calendar Name *
                      </label>
                      <input
                        type="text"
                        value={editingCalendar.attributes?.name || ''}
                        onChange={(e) => setEditingCalendar(prev => prev ? ({ ...prev, attributes: { ...prev.attributes, name: e.target.value } }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editingCalendar.attributes?.description || ''}
                        onChange={(e) => setEditingCalendar(prev => prev ? ({ ...prev, attributes: { ...prev.attributes, description: e.target.value } }) : null)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      <div className="flex space-x-2">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setEditingCalendar(prev => prev ? ({ ...prev, attributes: { ...prev.attributes, color: color.value } }) : null)}
                            className={`w-8 h-8 rounded-full ${editingCalendar.attributes?.color === color.value ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}
                            style={{ backgroundColor: color.value }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingCalendar.attributes?.sync_enabled || false}
                        onChange={(e) => setEditingCalendar(prev => prev ? ({ ...prev, attributes: { ...prev.attributes, sync_enabled: e.target.checked } }) : null)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Enable automatic sync
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingCalendar(null)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Update Calendar
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

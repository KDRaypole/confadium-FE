import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserPlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CalendarEvent, CreateEventRequest, UpdateEventRequest, Attendee } from '~/lib/api/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CreateEventRequest | UpdateEventRequest) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  defaultHour?: number;
  calendarId: string;
  loading?: boolean;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  defaultDate = new Date(),
  defaultHour = 9,
  calendarId,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    allDay: false,
    start: '',
    end: '',
    attendees: [] as Omit<Attendee, 'id'>[]
  });
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize form data when event or modal opens
  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        allDay: event.allDay,
        start: new Date(event.start).toISOString().slice(0, 16),
        end: new Date(event.end).toISOString().slice(0, 16),
        attendees: event.attendees?.map(a => ({ 
          email: a.email, 
          name: a.name, 
          role: a.role, 
          status: a.status 
        })) || []
      });
    } else {
      // Creating new event
      const startDate = new Date(defaultDate);
      if (defaultHour !== undefined) {
        startDate.setHours(defaultHour, 0, 0, 0);
      }
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      setFormData({
        title: '',
        description: '',
        location: '',
        allDay: false,
        start: startDate.toISOString().slice(0, 16),
        end: endDate.toISOString().slice(0, 16),
        attendees: []
      });
    }
  }, [event, defaultDate, defaultHour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      if (event) {
        // Update existing event
        await onSave({
          id: event.id,
          title: formData.title,
          description: formData.description || undefined,
          location: formData.location || undefined,
          allDay: formData.allDay,
          start: formData.start,
          end: formData.end,
          attendees: formData.attendees.length > 0 ? formData.attendees : undefined,
          calendarId
        });
      } else {
        // Create new event
        await onSave({
          title: formData.title,
          description: formData.description || undefined,
          location: formData.location || undefined,
          allDay: formData.allDay,
          start: formData.start,
          end: formData.end,
          attendees: formData.attendees.length > 0 ? formData.attendees : undefined,
          calendarId,
          organizerId: 'user-1', // Default organizer for mock data
          visibility: 'private'
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      setSaving(true);
      try {
        await onDelete(event.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete event:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const addAttendee = () => {
    if (!newAttendeeEmail.trim()) return;
    
    const newAttendee: Omit<Attendee, 'id'> = {
      email: newAttendeeEmail.trim(),
      name: newAttendeeEmail.split('@')[0], // Default name from email
      role: 'required',
      status: 'needsAction'
    };

    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, newAttendee]
    }));
    setNewAttendeeEmail('');
  };

  const removeAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const updateAttendee = (index: number, field: keyof Omit<Attendee, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const handleAllDayToggle = (allDay: boolean) => {
    setFormData(prev => {
      const start = new Date(prev.start);
      const end = new Date(prev.end);
      
      if (allDay) {
        // Set to all day (00:00 to 23:59)
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        // Set to 1-hour event if currently all day
        if (start.getHours() === 0 && end.getHours() === 23) {
          start.setHours(9, 0, 0, 0);
          end.setHours(10, 0, 0, 0);
        }
      }

      return {
        ...prev,
        allDay,
        start: start.toISOString().slice(0, 16),
        end: end.toISOString().slice(0, 16)
      };
    });
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {event ? 'Edit Event' : 'Create New Event'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title..."
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div>
                    <div className="flex items-center mb-3">
                      <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        checked={formData.allDay}
                        onChange={(e) => handleAllDayToggle(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">All day</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Start {formData.allDay ? 'Date' : 'Date & Time'}
                        </label>
                        <input
                          type={formData.allDay ? 'date' : 'datetime-local'}
                          value={formData.allDay ? formData.start.split('T')[0] : formData.start}
                          onChange={(e) => {
                            if (formData.allDay) {
                              const date = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                start: `${date}T00:00`,
                                end: `${date}T23:59`
                              }));
                            } else {
                              setFormData(prev => ({ ...prev, start: e.target.value }));
                            }
                          }}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      {!formData.allDay && (
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                            End Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.end}
                            onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                            min={formData.start}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Add location..."
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add description..."
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Attendees */}
                  <div>
                    <div className="flex items-center mb-3">
                      <UserPlusIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendees</span>
                    </div>
                    
                    {/* Add Attendee */}
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="email"
                        value={newAttendeeEmail}
                        onChange={(e) => setNewAttendeeEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                      />
                      <button
                        type="button"
                        onClick={addAttendee}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>

                    {/* Attendee List */}
                    {formData.attendees.length > 0 && (
                      <div className="space-y-2">
                        {formData.attendees.map((attendee, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input
                                type="email"
                                value={attendee.email}
                                onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                              <input
                                type="text"
                                value={attendee.name}
                                onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                                placeholder="Name"
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                              <select
                                value={attendee.role}
                                onChange={(e) => updateAttendee(index, 'role', e.target.value as Attendee['role'])}
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                <option value="required">Required</option>
                                <option value="optional">Optional</option>
                                <option value="chair">Chair</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttendee(index)}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {event && onDelete && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={saving}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete Event
                        </button>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!formData.title.trim() || saving}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full inline-block"></div>
                            Saving...
                          </>
                        ) : (
                          event ? 'Update Event' : 'Create Event'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EventModal;
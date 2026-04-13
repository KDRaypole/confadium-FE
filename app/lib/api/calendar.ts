import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type {
  CalendarAttributes, CalendarEventAttributes, TimeSlotAttributes,
  CalendarIntegrationAttributes, Attendee, RecurrenceRule,
  EventStatus, CalendarVisibility, IntegrationProvider,
} from './types';

export type Calendar = Resource<CalendarAttributes>;
export type CalendarEvent = Resource<CalendarEventAttributes>;
export type TimeSlot = Resource<TimeSlotAttributes>;
export type CalendarIntegration = Resource<CalendarIntegrationAttributes>;

// Re-export types for backward compatibility
export type { Attendee, RecurrenceRule, EventStatus, CalendarVisibility, IntegrationProvider };

const basePath = (orgId: string) => `/organizations/${orgId}/calendars`;
const calendarPath = (orgId: string, calendarId: string) => `${basePath(orgId)}/${calendarId}`;

export const calendarAPI = {
  // ── Calendars ───────────────────────────────────────────

  async getCalendars(orgId: string, params?: QueryParams): Promise<CollectionDocument<CalendarAttributes>> {
    return api.get<CollectionDocument<CalendarAttributes>>(basePath(orgId), params);
  },

  async getCalendarById(id: string): Promise<ResourceDocument<CalendarAttributes>> {
    return api.get<ResourceDocument<CalendarAttributes>>(`/calendars/${id}`);
  },

  async createCalendar(orgId: string, attrs: Partial<CalendarAttributes>): Promise<ResourceDocument<CalendarAttributes>> {
    return api.post<ResourceDocument<CalendarAttributes>>(basePath(orgId), buildResource('calendar', attrs));
  },

  async updateCalendar(id: string, attrs: Partial<CalendarAttributes>): Promise<ResourceDocument<CalendarAttributes>> {
    return api.patch<ResourceDocument<CalendarAttributes>>(`/calendars/${id}`, buildResource('calendar', attrs, id));
  },

  async deleteCalendar(id: string): Promise<void> {
    return api.delete(`/calendars/${id}`);
  },

  // ── Calendar Events ─────────────────────────────────────

  async getEvents(orgId: string, calendarId: string, params?: QueryParams): Promise<CollectionDocument<CalendarEventAttributes>> {
    return api.get<CollectionDocument<CalendarEventAttributes>>(`${calendarPath(orgId, calendarId)}/calendar_events`, params);
  },

  async getEventById(id: string): Promise<ResourceDocument<CalendarEventAttributes>> {
    return api.get<ResourceDocument<CalendarEventAttributes>>(`/calendar_events/${id}`);
  },

  async createEvent(orgId: string, calendarId: string, attrs: Partial<CalendarEventAttributes>): Promise<ResourceDocument<CalendarEventAttributes>> {
    return api.post<ResourceDocument<CalendarEventAttributes>>(`${calendarPath(orgId, calendarId)}/calendar_events`, buildResource('calendar_event', attrs));
  },

  async updateEvent(id: string, attrs: Partial<CalendarEventAttributes>): Promise<ResourceDocument<CalendarEventAttributes>> {
    return api.patch<ResourceDocument<CalendarEventAttributes>>(`/calendar_events/${id}`, buildResource('calendar_event', attrs, id));
  },

  async deleteEvent(id: string): Promise<void> {
    return api.delete(`/calendar_events/${id}`);
  },

  // ── Time Slots ──────────────────────────────────────────

  async getTimeSlots(orgId: string, calendarId: string, params?: QueryParams): Promise<CollectionDocument<TimeSlotAttributes>> {
    return api.get<CollectionDocument<TimeSlotAttributes>>(`${calendarPath(orgId, calendarId)}/time_slots`, params);
  },

  async getTimeSlotById(id: string): Promise<ResourceDocument<TimeSlotAttributes>> {
    return api.get<ResourceDocument<TimeSlotAttributes>>(`/time_slots/${id}`);
  },

  async createTimeSlot(orgId: string, calendarId: string, attrs: Partial<TimeSlotAttributes>): Promise<ResourceDocument<TimeSlotAttributes>> {
    return api.post<ResourceDocument<TimeSlotAttributes>>(`${calendarPath(orgId, calendarId)}/time_slots`, buildResource('time_slot', attrs));
  },

  async updateTimeSlot(id: string, attrs: Partial<TimeSlotAttributes>): Promise<ResourceDocument<TimeSlotAttributes>> {
    return api.patch<ResourceDocument<TimeSlotAttributes>>(`/time_slots/${id}`, buildResource('time_slot', attrs, id));
  },

  async deleteTimeSlot(id: string): Promise<void> {
    return api.delete(`/time_slots/${id}`);
  },

  // ── Integrations ────────────────────────────────────────

  async getIntegrations(orgId: string, calendarId: string): Promise<CollectionDocument<CalendarIntegrationAttributes>> {
    return api.get<CollectionDocument<CalendarIntegrationAttributes>>(`${calendarPath(orgId, calendarId)}/calendar_integrations`);
  },

  async createIntegration(orgId: string, calendarId: string, attrs: Partial<CalendarIntegrationAttributes>): Promise<ResourceDocument<CalendarIntegrationAttributes>> {
    return api.post<ResourceDocument<CalendarIntegrationAttributes>>(`${calendarPath(orgId, calendarId)}/calendar_integrations`, buildResource('calendar_integration', attrs));
  },

  async deleteIntegration(id: string): Promise<void> {
    return api.delete(`/calendar_integrations/${id}`);
  },
};

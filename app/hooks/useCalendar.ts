import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { calendarAPI } from '~/lib/api/calendar';
import type {
  CalendarAttributes, CalendarEventAttributes,
  TimeSlotAttributes, CalendarIntegrationAttributes,
} from '~/lib/api/types';
import type { Resource, QueryParams } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey, useNodeAttrs } from './useNodeFilter';

export type Calendar = Resource<CalendarAttributes>;
export type CalendarEvent = Resource<CalendarEventAttributes>;
export type TimeSlot = Resource<TimeSlotAttributes>;
export type CalendarIntegration = Resource<CalendarIntegrationAttributes>;

export const CALENDAR_QUERY_KEYS = {
  all: ['calendar'] as const,
  calendars: (orgId: string) => [...CALENDAR_QUERY_KEYS.all, 'list', orgId] as const,
  events: (calendarId: string) => [...CALENDAR_QUERY_KEYS.all, 'events', calendarId] as const,
  slots: (calendarId: string) => [...CALENDAR_QUERY_KEYS.all, 'slots', calendarId] as const,
  integrations: (calendarId: string) => [...CALENDAR_QUERY_KEYS.all, 'integrations', calendarId] as const,
};

// ── Calendars ───────────────────────────────────────────────

export const useCalendar = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();
  const nodeAttrs = useNodeAttrs();

  const query = useQuery({
    queryKey: [...CALENDAR_QUERY_KEYS.calendars(orgId), nodeKey],
    queryFn: () => calendarAPI.getCalendars(orgId, {
      ...(Object.keys(nodeFilter).length ? { filter: nodeFilter } : {}),
    }),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<CalendarAttributes>) => calendarAPI.createCalendar(orgId, { ...nodeAttrs, ...attrs }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<CalendarAttributes> }) =>
      calendarAPI.updateCalendar(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarAPI.deleteCalendar(id),
    onSuccess: invalidate,
  });

  return {
    calendars: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createCalendar: createMutation.mutateAsync,
    updateCalendar: updateMutation.mutateAsync,
    deleteCalendar: deleteMutation.mutateAsync,
  };
};

// ── Calendar Events ─────────────────────────────────────────

export const useCalendarEvents = (calendarId: string) => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CALENDAR_QUERY_KEYS.events(calendarId),
    queryFn: () => calendarAPI.getEvents(orgId, calendarId),
    select: (data) => data.data,
    enabled: !!orgId && !!calendarId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<CalendarEventAttributes>) => calendarAPI.createEvent(orgId, calendarId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<CalendarEventAttributes> }) =>
      calendarAPI.updateEvent(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarAPI.deleteEvent(id),
    onSuccess: invalidate,
  });

  return {
    events: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
  };
};

// ── Time Slots ──────────────────────────────────────────────

export const useTimeSlots = (calendarId: string) => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CALENDAR_QUERY_KEYS.slots(calendarId),
    queryFn: () => calendarAPI.getTimeSlots(orgId, calendarId),
    select: (data) => data.data,
    enabled: !!orgId && !!calendarId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<TimeSlotAttributes>) => calendarAPI.createTimeSlot(orgId, calendarId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<TimeSlotAttributes> }) =>
      calendarAPI.updateTimeSlot(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarAPI.deleteTimeSlot(id),
    onSuccess: invalidate,
  });

  return {
    timeSlots: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createTimeSlot: createMutation.mutateAsync,
    updateTimeSlot: updateMutation.mutateAsync,
    deleteTimeSlot: deleteMutation.mutateAsync,
  };
};

// ── Calendar Integrations ───────────────────────────────────

export const useCalendarIntegrations = (calendarId: string) => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CALENDAR_QUERY_KEYS.integrations(calendarId),
    queryFn: () => calendarAPI.getIntegrations(orgId, calendarId),
    select: (data) => data.data,
    enabled: !!orgId && !!calendarId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<CalendarIntegrationAttributes>) =>
      calendarAPI.createIntegration(orgId, calendarId, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarAPI.deleteIntegration(id),
    onSuccess: invalidate,
  });

  return {
    integrations: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createIntegration: createMutation.mutateAsync,
    deleteIntegration: deleteMutation.mutateAsync,
  };
};

import { useQuery } from '@tanstack/react-query';
import { eventLogsAPI, type EventLog } from '~/lib/api/eventLogs';
import type { EventLogAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';

export type { EventLog };

export const EVENT_LOGS_QUERY_KEYS = {
  all: ['eventLogs'] as const,
  forEntity: (entityType: string, entityId: string) =>
    [...EVENT_LOGS_QUERY_KEYS.all, 'entity', entityType, entityId] as const,
  detail: (id: string) => [...EVENT_LOGS_QUERY_KEYS.all, 'detail', id] as const,
  related: (id: string) => [...EVENT_LOGS_QUERY_KEYS.all, 'related', id] as const,
};

/**
 * Hook to fetch event logs for a specific entity
 */
export const useEventLogs = (
  entityType: 'contacts' | 'deals' | 'activities',
  entityId: string
) => {
  const query = useQuery({
    queryKey: EVENT_LOGS_QUERY_KEYS.forEntity(entityType, entityId),
    queryFn: () => eventLogsAPI.getForEntity(entityType, entityId),
    enabled: !!entityId,
  });

  return {
    eventLogs: (query.data?.data || []) as Resource<EventLogAttributes>[],
    included: query.data?.included || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
};

/**
 * Hook to fetch a single event log with details
 */
export const useEventLog = (id: string) => {
  const query = useQuery({
    queryKey: EVENT_LOGS_QUERY_KEYS.detail(id),
    queryFn: () => eventLogsAPI.getById(id),
    enabled: !!id,
  });

  return {
    eventLog: query.data?.data as Resource<EventLogAttributes> | undefined,
    included: query.data?.included || [],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};

/**
 * Hook to fetch related event logs from the same workflow
 */
export const useRelatedEventLogs = (id: string, enabled = true) => {
  const query = useQuery({
    queryKey: EVENT_LOGS_QUERY_KEYS.related(id),
    queryFn: () => eventLogsAPI.getRelated(id),
    enabled: !!id && enabled,
  });

  return {
    relatedLogs: (query.data?.data || []) as Resource<EventLogAttributes>[],
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { activitiesAPI } from '~/lib/api/activities';
import type { ActivityAttributes, ContactAttributes, DealAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey } from './useNodeFilter';

export type Activity = Resource<ActivityAttributes>;

export const ACTIVITIES_QUERY_KEYS = {
  all: ['activities'] as const,
  list: (orgId: string, nodeKey?: string | null) => [...ACTIVITIES_QUERY_KEYS.all, 'list', orgId, nodeKey] as const,
  detail: (id: string) => [...ACTIVITIES_QUERY_KEYS.all, 'detail', id] as const,
};

export const useActivities = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();

  const query = useQuery({
    queryKey: ACTIVITIES_QUERY_KEYS.list(orgId, nodeKey),
    queryFn: () => activitiesAPI.getActivities(orgId, {
      ...(Object.keys(nodeFilter).length ? { filter: nodeFilter } : {}),
    }),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<ActivityAttributes> & { contact_id?: string; deal_id?: string }) =>
      activitiesAPI.createActivity(orgId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<ActivityAttributes> }) =>
      activitiesAPI.updateActivity(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => activitiesAPI.deleteActivity(id),
    onSuccess: invalidate,
  });

  return {
    activities: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createActivity: createMutation.mutateAsync,
    updateActivity: updateMutation.mutateAsync,
    deleteActivity: deleteMutation.mutateAsync,
  };
};

export const useActivity = (activityId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ACTIVITIES_QUERY_KEYS.detail(activityId || ''),
    queryFn: () => activitiesAPI.getActivityById(activityId!),
    enabled: !!activityId,
  });

  const included = query.data?.included || [];
  const contact = (included.find(r => r.type === 'contacts') as Resource<ContactAttributes> | undefined) || null;
  const deal = (included.find(r => r.type === 'deals') as Resource<DealAttributes> | undefined) || null;

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<ActivityAttributes>) => activitiesAPI.updateActivity(activityId!, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEYS.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => activitiesAPI.deleteActivity(activityId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEYS.all }),
  });

  return {
    activity: query.data?.data || null,
    contact,
    deal,
    loading: query.isLoading,
    error: query.error?.message || null,
    updateActivity: updateMutation.mutateAsync,
    deleteActivity: deleteMutation.mutateAsync,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { tagsAPI } from '~/lib/api/tags';
import type { TagAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey } from './useNodeFilter';

export type Tag = Resource<TagAttributes>;

export const TAGS_QUERY_KEYS = {
  all: ['tags'] as const,
  list: (orgId: string, nodeKey?: string | null) => [...TAGS_QUERY_KEYS.all, 'list', orgId, nodeKey] as const,
  detail: (id: string) => [...TAGS_QUERY_KEYS.all, 'detail', id] as const,
  search: (orgId: string, query: string) => [...TAGS_QUERY_KEYS.all, 'search', orgId, query] as const,
};

export const useTags = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();

  const query = useQuery({
    queryKey: TAGS_QUERY_KEYS.list(orgId, nodeKey),
    queryFn: () => tagsAPI.getTags(orgId, {
      ...(Object.keys(nodeFilter).length ? { filter: nodeFilter } : {}),
    }),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<TagAttributes>) => tagsAPI.createTag(orgId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<TagAttributes> }) =>
      tagsAPI.updateTag(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsAPI.deleteTag(id),
    onSuccess: invalidate,
  });

  return {
    tags: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createTag: createMutation.mutateAsync,
    updateTag: updateMutation.mutateAsync,
    deleteTag: deleteMutation.mutateAsync,
  };
};

export const useTag = (tagId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: TAGS_QUERY_KEYS.detail(tagId || ''),
    queryFn: () => tagsAPI.getTagById(tagId!),
    select: (data) => data.data,
    enabled: !!tagId,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<TagAttributes>) => tagsAPI.updateTag(tagId!, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEYS.all }),
  });

  return {
    tag: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    updateTag: updateMutation.mutateAsync,
  };
};

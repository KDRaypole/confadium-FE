import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { websitesApi } from '~/lib/api/websites';
import type { WebsiteAttributes, PageAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey } from './useNodeFilter';

export type Website = Resource<WebsiteAttributes>;

export const WEBSITES_QUERY_KEYS = {
  all: ['websites'] as const,
  list: (orgId: string, nodeKey?: string | null) => [...WEBSITES_QUERY_KEYS.all, 'list', orgId, nodeKey] as const,
  detail: (id: string) => [...WEBSITES_QUERY_KEYS.all, 'detail', id] as const,
  pages: (websiteId: string) => [...WEBSITES_QUERY_KEYS.all, 'pages', websiteId] as const,
};

export const useWebsites = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();

  const query = useQuery({
    queryKey: WEBSITES_QUERY_KEYS.list(orgId, nodeKey),
    queryFn: () => websitesApi.getWebsites(orgId, {
      ...(Object.keys(nodeFilter).length ? { filter: nodeFilter } : {}),
    }),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: WEBSITES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<WebsiteAttributes>) => websitesApi.createWebsite(orgId, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => websitesApi.deleteWebsite(id),
    onSuccess: invalidate,
  });

  return {
    websites: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createWebsite: createMutation.mutateAsync,
    deleteWebsite: deleteMutation.mutateAsync,
  };
};

export const useWebsite = (websiteId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: WEBSITES_QUERY_KEYS.detail(websiteId),
    queryFn: () => websitesApi.getWebsiteById(websiteId),
    select: (data) => data.data,
    enabled: !!websiteId,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<WebsiteAttributes>) => websitesApi.updateWebsite(websiteId, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WEBSITES_QUERY_KEYS.all }),
  });

  return {
    website: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    updateWebsite: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const useWebsitePages = (websiteId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: WEBSITES_QUERY_KEYS.pages(websiteId),
    queryFn: () => websitesApi.getWebsitePages(websiteId),
    select: (data) => data.data,
    enabled: !!websiteId,
  });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<PageAttributes>) => websitesApi.createPageInWebsite(websiteId, attrs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBSITES_QUERY_KEYS.pages(websiteId) });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });

  return {
    pages: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createPage: createMutation.mutateAsync,
  };
};

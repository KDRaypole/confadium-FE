import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { pagesApi } from '~/lib/api/pages';
import type { PageAttributes, PageTemplateAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';

export type Page = Resource<PageAttributes>;
export type PageTemplate = Resource<PageTemplateAttributes>;

export const PAGES_QUERY_KEYS = {
  all: ['pages'] as const,
  list: (orgId: string) => [...PAGES_QUERY_KEYS.all, 'list', orgId] as const,
  detail: (id: string) => [...PAGES_QUERY_KEYS.all, 'detail', id] as const,
  templates: (orgId: string) => [...PAGES_QUERY_KEYS.all, 'templates', orgId] as const,
  templateDetail: (id: string) => [...PAGES_QUERY_KEYS.all, 'template', id] as const,
};

export const usePages = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PAGES_QUERY_KEYS.list(orgId),
    queryFn: () => pagesApi.getPages(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<PageAttributes>) => pagesApi.createPage(orgId, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pagesApi.deletePage(id),
    onSuccess: invalidate,
  });

  return {
    pages: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createPage: createMutation.mutateAsync,
    deletePage: deleteMutation.mutateAsync,
  };
};

export const usePage = (pageId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PAGES_QUERY_KEYS.detail(pageId),
    queryFn: () => pagesApi.getPageById(pageId),
    select: (data) => data.data,
    enabled: !!pageId,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<PageAttributes>) => pagesApi.updatePage(pageId, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEYS.all }),
  });

  return {
    page: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    updatePage: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const usePageTemplates = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PAGES_QUERY_KEYS.templates(orgId),
    queryFn: () => pagesApi.getTemplates(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<PageTemplateAttributes>) => pagesApi.createTemplate(orgId, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEYS.all }),
  });

  return {
    templates: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createTemplate: createMutation.mutateAsync,
  };
};

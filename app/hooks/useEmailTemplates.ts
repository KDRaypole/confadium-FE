import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { emailTemplatesAPI } from '~/lib/api/emailTemplates';
import type { EmailTemplateAttributes, EmailTemplateCategory } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey, useNodeAttrs } from './useNodeFilter';

export type EmailTemplate = Resource<EmailTemplateAttributes>;

export const EMAIL_TEMPLATES_QUERY_KEYS = {
  all: ['emailTemplates'] as const,
  list: (orgId: string) => [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'list', orgId] as const,
  detail: (id: string) => [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'detail', id] as const,
  byCategory: (orgId: string, category: string) =>
    [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'category', orgId, category] as const,
  search: (orgId: string, query: string) =>
    [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'search', orgId, query] as const,
};

const errorMessage = (err: unknown): string | null =>
  err instanceof Error ? err.message : err ? String(err) : null;

/**
 * Bundled list + mutations hook. Consumers destructure
 * `{ templates, loading, error, createTemplate, updateTemplate,
 *    deleteTemplate, duplicateTemplate, isCreating, isUpdating,
 *    isDeleting, isDuplicating }`.
 */
export const useEmailTemplates = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();
  const nodeAttrs = useNodeAttrs();

  const listQuery = useQuery({
    queryKey: [...EMAIL_TEMPLATES_QUERY_KEYS.list(orgId), nodeKey],
    queryFn: () => emailTemplatesAPI.getTemplates(orgId, {
      ...(Object.keys(nodeFilter).length ? { filter: nodeFilter } : {}),
    }),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<EmailTemplateAttributes>) =>
      emailTemplatesAPI.createTemplate(orgId, { ...nodeAttrs, ...attrs }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<EmailTemplateAttributes> }) =>
      emailTemplatesAPI.updateTemplate(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailTemplatesAPI.deleteTemplate(id),
    onSuccess: invalidate,
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const source = await emailTemplatesAPI.getTemplateById(id);
      const src = source.data.attributes;
      const copyAttrs: Partial<EmailTemplateAttributes> = {
        ...src,
        name: `${src.name} (copy)`,
      };
      return emailTemplatesAPI.createTemplate(orgId, copyAttrs);
    },
    onSuccess: invalidate,
  });

  return {
    templates: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: errorMessage(listQuery.error),
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    duplicateTemplate: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
};

/**
 * Bundled detail + update hook. Consumers destructure
 * `{ template, loading, error, updateTemplate, isUpdating }`.
 * `updateTemplate(attrs)` is bound to the supplied id.
 */
export const useEmailTemplate = (id?: string) => {
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => emailTemplatesAPI.getTemplateById(id as string),
    select: (data) => data.data,
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<EmailTemplateAttributes>) =>
      emailTemplatesAPI.updateTemplate(id as string, attrs),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.all }),
  });

  return {
    template: detailQuery.data,
    loading: detailQuery.isLoading,
    error: errorMessage(detailQuery.error),
    updateTemplate: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

/**
 * Aggregate stats derived from the list query. Returns
 * `{ data: { total, byCategory } | undefined, loading, error }`.
 */
export const useEmailTemplateStats = () => {
  const { orgId = '' } = useParams();

  const listQuery = useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.list(orgId),
    queryFn: () => emailTemplatesAPI.getTemplates(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const data = useMemo(() => {
    if (!listQuery.data) return undefined;
    const byCategory: Record<string, number> = {};
    for (const template of listQuery.data) {
      const category = template.attributes?.category ?? 'uncategorized';
      byCategory[category] = (byCategory[category] ?? 0) + 1;
    }
    return { total: listQuery.data.length, byCategory };
  }, [listQuery.data]);

  return {
    data,
    loading: listQuery.isLoading,
    error: errorMessage(listQuery.error),
  };
};

export const useEmailTemplatesByCategory = (category: EmailTemplateCategory) => {
  const { orgId = '' } = useParams();
  return useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.byCategory(orgId, category),
    queryFn: () => emailTemplatesAPI.getTemplatesByCategory(orgId, category),
    select: (data) => data.data,
    enabled: !!orgId,
  });
};

export const useEmailTemplatesSearch = (query: string) => {
  const { orgId = '' } = useParams();
  return useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.search(orgId, query),
    queryFn: () => emailTemplatesAPI.searchTemplates(orgId, query),
    select: (data) => data.data,
    enabled: !!orgId && query.length > 0,
  });
};

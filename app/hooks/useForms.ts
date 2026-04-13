import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { formsApi } from '~/lib/api/forms';
import type { FormAttributes, FormFieldAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';

export type Form = Resource<FormAttributes>;
export type FormField = Resource<FormFieldAttributes>;

export const FORMS_QUERY_KEYS = {
  all: ['forms'] as const,
  list: (orgId: string) => [...FORMS_QUERY_KEYS.all, 'list', orgId] as const,
  detail: (id: string) => [...FORMS_QUERY_KEYS.all, 'detail', id] as const,
  fields: (formId: string) => [...FORMS_QUERY_KEYS.all, 'fields', formId] as const,
  active: (orgId: string) => [...FORMS_QUERY_KEYS.all, 'active', orgId] as const,
};

export const useForms = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: FORMS_QUERY_KEYS.list(orgId),
    queryFn: () => formsApi.getForms(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<FormAttributes>) => formsApi.createForm(orgId, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => formsApi.deleteForm(id),
    onSuccess: invalidate,
  });

  return {
    forms: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createForm: createMutation.mutateAsync,
    deleteForm: deleteMutation.mutateAsync,
  };
};

export const useActiveForms = () => {
  const { orgId = '' } = useParams();
  return useQuery({
    queryKey: FORMS_QUERY_KEYS.active(orgId),
    queryFn: () => formsApi.getActiveForms(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });
};

export const useForm = (formId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: FORMS_QUERY_KEYS.detail(formId),
    queryFn: () => formsApi.getFormById(formId),
    select: (data) => data.data,
    enabled: !!formId,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<FormAttributes>) => formsApi.updateForm(formId, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEYS.all }),
  });

  return {
    form: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    updateForm: updateMutation.mutateAsync,
  };
};

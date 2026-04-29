import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { contactsAPI } from '~/lib/api/contacts';
import { tagsAPI } from '~/lib/api/tags';
import type { ContactAttributes, DealAttributes, ActivityAttributes, TagAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey, useNodeAttrs } from './useNodeFilter';

export type Contact = Resource<ContactAttributes>;

interface Tagging {
  id: string;
  type: string;
  relationships?: {
    tag?: { data: { type: string; id: string } };
  };
}

export const CONTACTS_QUERY_KEYS = {
  all: ['contacts'] as const,
  list: (orgId: string, page?: number, size?: number, search?: string, filter?: Record<string, string>) =>
    [...CONTACTS_QUERY_KEYS.all, 'list', orgId, page, size, search, JSON.stringify(filter)] as const,
  detail: (id: string) => [...CONTACTS_QUERY_KEYS.all, 'detail', id] as const,
};

interface UseContactsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: Record<string, string>;
}

export const useContacts = (options: UseContactsOptions = {}) => {
  const { page = 1, pageSize = 25, search, filter } = options;
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();
  const nodeAttrs = useNodeAttrs();

  const mergedFilter = { ...filter, ...nodeFilter };

  const query = useQuery({
    queryKey: [...CONTACTS_QUERY_KEYS.list(orgId, page, pageSize, search, filter), nodeKey],
    queryFn: () => contactsAPI.getContacts(orgId, {
      page: { number: page, size: pageSize },
      ...(search ? { search } : {}),
      ...(Object.keys(mergedFilter).length ? { filter: mergedFilter } : {}),
    }),
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<ContactAttributes>) => contactsAPI.createContact(orgId, { ...nodeAttrs, ...attrs }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<ContactAttributes> }) =>
      contactsAPI.updateContact(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsAPI.deleteContact(id),
    onSuccess: invalidate,
  });

  const pagination = query.data?.meta?.pagination;

  return {
    contacts: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    total: pagination?.total || 0,
    totalPages: pagination?.pages || 1,
    createContact: createMutation.mutateAsync,
    updateContact: updateMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
  };
};

export interface ContactTag {
  tagId: string;
  taggingId: string;
  tag: Resource<TagAttributes>;
}

export const useContact = (contactId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CONTACTS_QUERY_KEYS.detail(contactId || ''),
    queryFn: () => contactsAPI.getContactById(contactId!),
    enabled: !!contactId,
  });

  const included = query.data?.included || [];
  const deals = included.filter(r => r.type === 'deals') as Resource<DealAttributes>[];
  const activities = included.filter(r => r.type === 'activities') as Resource<ActivityAttributes>[];

  // Build a map of tagging_id -> tag_id, then match with included tag resources
  const taggings = included.filter(r => r.type === 'taggings') as unknown as Tagging[];
  const tagResources = included.filter(r => r.type === 'tags') as Resource<TagAttributes>[];
  const tagMap = new Map(tagResources.map(t => [t.id, t]));

  const contactTags: ContactTag[] = taggings
    .map((tagging) => {
      const tagId = tagging.relationships?.tag?.data?.id;
      if (!tagId) return null;
      const tag = tagMap.get(tagId);
      if (!tag) return null;
      return { tagId, taggingId: tagging.id, tag };
    })
    .filter((t): t is ContactTag => t !== null);

  const invalidateContact = () =>
    queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.detail(contactId || '') });

  const addTagMutation = useMutation({
    mutationFn: (tagId: string) => tagsAPI.addTagging('contacts', contactId!, tagId),
    onSuccess: invalidateContact,
  });

  const removeTagMutation = useMutation({
    mutationFn: (taggingId: string) => tagsAPI.removeTagging(taggingId),
    onSuccess: invalidateContact,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<ContactAttributes>) => contactsAPI.updateContact(contactId!, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => contactsAPI.deleteContact(contactId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEYS.all }),
  });

  return {
    contact: query.data?.data || null,
    deals,
    activities,
    contactTags,
    loading: query.isLoading,
    error: query.error?.message || null,
    updateContact: updateMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
    addTag: addTagMutation.mutateAsync,
    removeTag: removeTagMutation.mutateAsync,
  };
};

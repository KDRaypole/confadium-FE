import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { usersAPI } from '~/lib/api/users';
import type { UserAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey, useNodeAttrs } from './useNodeFilter';

export type User = Resource<UserAttributes>;

export const USERS_QUERY_KEYS = {
  all: ['users'] as const,
  list: (orgId: string, page?: number, size?: number, search?: string, filter?: Record<string, string>) =>
    [...USERS_QUERY_KEYS.all, 'list', orgId, page, size, search, JSON.stringify(filter)] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.all, 'detail', id] as const,
};

interface UseUsersOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: Record<string, string>;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const { page = 1, pageSize = 25, search, filter } = options;
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();
  const nodeAttrs = useNodeAttrs();

  const mergedFilter = { ...filter, ...nodeFilter };

  const query = useQuery({
    queryKey: [...USERS_QUERY_KEYS.list(orgId, page, pageSize, search, filter), nodeKey],
    queryFn: () => usersAPI.getUsers(orgId, {
      page: { number: page, size: pageSize },
      ...(search ? { search } : {}),
      ...(Object.keys(mergedFilter).length ? { filter: mergedFilter } : {}),
    }),
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<UserAttributes>) => usersAPI.createUser(orgId, { ...nodeAttrs, ...attrs }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAPI.deleteUser(id),
    onSuccess: invalidate,
  });

  const resendInvitationMutation = useMutation({
    mutationFn: (id: string) => usersAPI.resendInvitation(id),
    onSuccess: invalidate,
  });

  const pagination = query.data?.meta?.pagination;

  return {
    users: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    total: pagination?.total || 0,
    totalPages: pagination?.pages || 1,
    createUser: createMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    resendInvitation: resendInvitationMutation.mutateAsync,
  };
};

export const useUser = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: USERS_QUERY_KEYS.detail(userId || ''),
    queryFn: () => usersAPI.getUserById(userId!),
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersAPI.deleteUser(userId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all }),
  });

  const resendInvitationMutation = useMutation({
    mutationFn: () => usersAPI.resendInvitation(userId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.detail(userId!) }),
  });

  return {
    user: query.data?.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    deleteUser: deleteMutation.mutateAsync,
    resendInvitation: resendInvitationMutation.mutateAsync,
  };
};

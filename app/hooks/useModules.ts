import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { modulesAPI } from '~/lib/api/modules';
import type { AutomationModuleAttributes, ModuleConfigurationAttributes, ModuleCategory } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';

export type AutomationModule = Resource<AutomationModuleAttributes>;
export type ModuleConfiguration = Resource<ModuleConfigurationAttributes>;
export type Configuration = ModuleConfiguration;
export type ConfigurationCreateData = Partial<ModuleConfigurationAttributes>;

export const MODULES_QUERY_KEYS = {
  all: ['modules'] as const,
  list: (orgId: string) => [...MODULES_QUERY_KEYS.all, 'list', orgId] as const,
  detail: (id: string) => [...MODULES_QUERY_KEYS.all, 'detail', id] as const,
  configs: (moduleId: string) => [...MODULES_QUERY_KEYS.all, 'configs', moduleId] as const,
  configDetail: (id: string) => [...MODULES_QUERY_KEYS.all, 'configDetail', id] as const,
  search: (orgId: string, query: string) => [...MODULES_QUERY_KEYS.all, 'search', orgId, query] as const,
  byCategory: (orgId: string, category: string) => [...MODULES_QUERY_KEYS.all, 'category', orgId, category] as const,
};

export const useModules = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.list(orgId),
    queryFn: () => modulesAPI.getModules(orgId),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<AutomationModuleAttributes>) => modulesAPI.createModule(orgId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<AutomationModuleAttributes> }) =>
      modulesAPI.updateModule(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modulesAPI.deleteModule(id),
    onSuccess: invalidate,
  });

  return {
    modules: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createModule: createMutation.mutateAsync,
    updateModule: updateMutation.mutateAsync,
    deleteModule: deleteMutation.mutateAsync,
  };
};

export const useModule = (moduleId?: string) => {
  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.detail(moduleId || ''),
    queryFn: () => modulesAPI.getModuleById(moduleId!),
    select: (data) => data.data,
    enabled: !!moduleId,
  });

  return {
    module: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
  };
};

export const useModuleConfigurations = (moduleId: string) => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.configs(moduleId),
    queryFn: () => modulesAPI.getConfigurations(orgId, moduleId),
    select: (data) => data.data,
    enabled: !!orgId && !!moduleId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<ModuleConfigurationAttributes>) => modulesAPI.createConfiguration(orgId, moduleId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<ModuleConfigurationAttributes> }) =>
      modulesAPI.updateConfiguration(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modulesAPI.deleteConfiguration(id),
    onSuccess: invalidate,
  });

  return {
    configurations: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createConfiguration: createMutation.mutateAsync,
    updateConfiguration: updateMutation.mutateAsync,
    deleteConfiguration: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useConfiguration = (configId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.configDetail(configId || ''),
    queryFn: () => modulesAPI.getConfigurationById(configId!),
    select: (data) => data.data,
    enabled: !!configId,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<ModuleConfigurationAttributes>) =>
      modulesAPI.updateConfiguration(configId!, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all }),
  });

  return {
    configuration: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    updateConfiguration: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const useModulesSearch = (query: string) => {
  const { orgId = '' } = useParams();
  return useQuery({
    queryKey: MODULES_QUERY_KEYS.search(orgId, query),
    queryFn: () => modulesAPI.searchModules(orgId, query),
    select: (data) => data.data,
    enabled: !!orgId && query.length > 0,
  });
};

export const useModulesByCategory = (category: ModuleCategory) => {
  const { orgId = '' } = useParams();
  return useQuery({
    queryKey: MODULES_QUERY_KEYS.byCategory(orgId, category),
    queryFn: () => modulesAPI.getModulesByCategory(orgId, category),
    select: (data) => data.data,
    enabled: !!orgId,
  });
};

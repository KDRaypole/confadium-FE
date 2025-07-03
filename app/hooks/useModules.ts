import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  modulesAPI, 
  type Module, 
  type Configuration,
  type ModuleCreateData, 
  type ModuleUpdateData,
  type ConfigurationCreateData,
  type ConfigurationUpdateData
} from '~/lib/api/modules';

// Query keys for React Query
export const MODULES_QUERY_KEYS = {
  all: ['modules'] as const,
  lists: () => [...MODULES_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...MODULES_QUERY_KEYS.lists(), filters] as const,
  details: () => [...MODULES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MODULES_QUERY_KEYS.details(), id] as const,
  search: (query: string) => [...MODULES_QUERY_KEYS.all, 'search', query] as const,
  category: (category: string) => [...MODULES_QUERY_KEYS.all, 'category', category] as const,
  configurations: (moduleId: string) => [...MODULES_QUERY_KEYS.all, 'configurations', moduleId] as const,
  configuration: (id: string) => [...MODULES_QUERY_KEYS.all, 'configuration', id] as const,
};

// Hook for fetching all modules
export function useModules() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.lists(),
    queryFn: () => modulesAPI.getAllModules(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ModuleCreateData) => modulesAPI.createModule(data),
    onSuccess: (newModule) => {
      // Update the cache with the new module
      queryClient.setQueryData<Module[]>(MODULES_QUERY_KEYS.lists(), (old) => {
        return old ? [...old, newModule] : [newModule];
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ModuleCreateData> }) =>
      modulesAPI.updateModule(id, data),
    onSuccess: (updatedModule) => {
      if (updatedModule) {
        // Update the cache with the updated module
        queryClient.setQueryData<Module[]>(MODULES_QUERY_KEYS.lists(), (old) => {
          return old
            ? old.map((module) => (module.id === updatedModule.id ? updatedModule : module))
            : [updatedModule];
        });
        // Update individual module cache
        queryClient.setQueryData(MODULES_QUERY_KEYS.detail(updatedModule.id), updatedModule);
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modulesAPI.deleteModule(id),
    onSuccess: (success, deletedId) => {
      if (success) {
        // Remove the module from cache
        queryClient.setQueryData<Module[]>(MODULES_QUERY_KEYS.lists(), (old) => {
          return old ? old.filter((module) => module.id !== deletedId) : [];
        });
        // Remove individual module cache
        queryClient.removeQueries({ queryKey: MODULES_QUERY_KEYS.detail(deletedId) });
        // Remove configurations cache for this module
        queryClient.removeQueries({ queryKey: MODULES_QUERY_KEYS.configurations(deletedId) });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all });
      }
    },
  });

  return {
    // Data
    modules: query.data ?? [],
    
    // Loading states
    loading: query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || null,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Actions
    createModule: createMutation.mutate,
    updateModule: (id: string, data: Partial<ModuleCreateData>) =>
      updateMutation.mutate({ id, data }),
    deleteModule: deleteMutation.mutate,
    
    // Utility
    refetch: query.refetch,
  };
}

// Hook for fetching a single module
export function useModule(id: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.detail(id || ''),
    queryFn: () => modulesAPI.getModuleById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ModuleCreateData>) => modulesAPI.updateModule(id!, data),
    onSuccess: (updatedModule) => {
      if (updatedModule && id) {
        // Update individual module cache
        queryClient.setQueryData(MODULES_QUERY_KEYS.detail(id), updatedModule);
        // Update modules list cache
        queryClient.setQueryData<Module[]>(MODULES_QUERY_KEYS.lists(), (old) => {
          return old
            ? old.map((module) => (module.id === updatedModule.id ? updatedModule : module))
            : [updatedModule];
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all });
      }
    },
  });

  return {
    // Data
    module: query.data || null,
    
    // Loading states
    loading: query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || null,
    
    // Mutation states
    isUpdating: updateMutation.isPending,
    
    // Actions
    updateModule: updateMutation.mutate,
    
    // Utility
    refetch: query.refetch,
  };
}

// Hook for fetching module configurations
export function useModuleConfigurations(moduleId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.configurations(moduleId || ''),
    queryFn: () => modulesAPI.getModuleConfigurations(moduleId!),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ConfigurationCreateData) => modulesAPI.createConfiguration(data),
    onSuccess: (newConfiguration) => {
      // Update the cache with the new configuration
      queryClient.setQueryData<Configuration[]>(
        MODULES_QUERY_KEYS.configurations(newConfiguration.moduleId), 
        (old) => {
          return old ? [...old, newConfiguration] : [newConfiguration];
        }
      );
      // Invalidate modules list to update configuration count
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.detail(newConfiguration.moduleId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modulesAPI.deleteConfiguration(id),
    onSuccess: (success, deletedId) => {
      if (success && moduleId) {
        // Remove the configuration from cache
        queryClient.setQueryData<Configuration[]>(
          MODULES_QUERY_KEYS.configurations(moduleId), 
          (old) => {
            return old ? old.filter((config) => config.id !== deletedId) : [];
          }
        );
        // Remove individual configuration cache
        queryClient.removeQueries({ queryKey: MODULES_QUERY_KEYS.configuration(deletedId) });
        // Invalidate modules list to update configuration count
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.lists() });
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.detail(moduleId) });
      }
    },
  });

  return {
    // Data
    configurations: query.data ?? [],
    
    // Loading states
    loading: query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || null,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Actions
    createConfiguration: createMutation.mutate,
    deleteConfiguration: deleteMutation.mutate,
    
    // Utility
    refetch: query.refetch,
  };
}

// Hook for fetching a single configuration
export function useConfiguration(id: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MODULES_QUERY_KEYS.configuration(id || ''),
    queryFn: () => modulesAPI.getConfigurationById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ConfigurationCreateData>) => modulesAPI.updateConfiguration(id!, data),
    onSuccess: (updatedConfiguration) => {
      if (updatedConfiguration && id) {
        // Update individual configuration cache
        queryClient.setQueryData(MODULES_QUERY_KEYS.configuration(id), updatedConfiguration);
        // Update configurations list cache
        queryClient.setQueryData<Configuration[]>(
          MODULES_QUERY_KEYS.configurations(updatedConfiguration.moduleId), 
          (old) => {
            return old
              ? old.map((config) => (config.id === updatedConfiguration.id ? updatedConfiguration : config))
              : [updatedConfiguration];
          }
        );
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEYS.all });
      }
    },
  });

  return {
    // Data
    configuration: query.data || null,
    
    // Loading states
    loading: query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || null,
    
    // Mutation states
    isUpdating: updateMutation.isPending,
    
    // Actions
    updateConfiguration: updateMutation.mutate,
    
    // Utility
    refetch: query.refetch,
  };
}

// Hook for searching modules
export function useModulesSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: MODULES_QUERY_KEYS.search(query),
    queryFn: () => modulesAPI.searchModules(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Hook for getting modules by category
export function useModulesByCategory(category: string, enabled = true) {
  return useQuery({
    queryKey: MODULES_QUERY_KEYS.category(category),
    queryFn: () => modulesAPI.getModulesByCategory(category),
    enabled: enabled && category.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Export types
export type { 
  Module, 
  Configuration, 
  ModuleCreateData, 
  ModuleUpdateData,
  ConfigurationCreateData,
  ConfigurationUpdateData
};
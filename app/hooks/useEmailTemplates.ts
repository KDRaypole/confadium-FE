import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  emailTemplatesAPI, 
  type EmailTemplate, 
  type EmailTemplateCreateData, 
  type EmailTemplateUpdateData 
} from '~/lib/api/emailTemplates';

// Query keys for React Query
export const EMAIL_TEMPLATES_QUERY_KEYS = {
  all: ['emailTemplates'] as const,
  lists: () => [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...EMAIL_TEMPLATES_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EMAIL_TEMPLATES_QUERY_KEYS.details(), id] as const,
  search: (query: string) => [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'search', query] as const,
  stats: () => [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'stats'] as const,
  byCategory: (category: string) => [...EMAIL_TEMPLATES_QUERY_KEYS.all, 'category', category] as const,
} as const;

// Hook for fetching all email templates
export function useEmailTemplates() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.lists(),
    queryFn: () => emailTemplatesAPI.getTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: EmailTemplateCreateData) => emailTemplatesAPI.createTemplate(data),
    onSuccess: (newTemplate) => {
      // Add to the templates list cache
      queryClient.setQueryData<EmailTemplate[]>(
        EMAIL_TEMPLATES_QUERY_KEYS.lists(),
        (old) => old ? [...old, newTemplate] : [newTemplate]
      );
      // Add to individual template cache
      queryClient.setQueryData(EMAIL_TEMPLATES_QUERY_KEYS.detail(newTemplate.id), newTemplate);
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.stats() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailTemplatesAPI.deleteTemplate(id),
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.lists() });
      
      // Snapshot the previous value
      const previousTemplates = queryClient.getQueryData<EmailTemplate[]>(EMAIL_TEMPLATES_QUERY_KEYS.lists());
      
      // Optimistically update to the new value
      if (previousTemplates) {
        queryClient.setQueryData<EmailTemplate[]>(
          EMAIL_TEMPLATES_QUERY_KEYS.lists(),
          previousTemplates.filter((template) => template.id !== deletedId)
        );
      }
      
      return { previousTemplates };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      if (context?.previousTemplates) {
        queryClient.setQueryData(EMAIL_TEMPLATES_QUERY_KEYS.lists(), context.previousTemplates);
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove individual template cache
      queryClient.removeQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.detail(deletedId) });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.stats() });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => emailTemplatesAPI.duplicateTemplate(id),
    onSuccess: (duplicatedTemplate) => {
      // Add to the templates list cache
      queryClient.setQueryData<EmailTemplate[]>(
        EMAIL_TEMPLATES_QUERY_KEYS.lists(),
        (old) => old ? [...old, duplicatedTemplate] : [duplicatedTemplate]
      );
      // Add to individual template cache
      queryClient.setQueryData(EMAIL_TEMPLATES_QUERY_KEYS.detail(duplicatedTemplate.id), duplicatedTemplate);
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.stats() });
    },
  });

  return {
    // Data
    templates: query.data ?? [],
    
    // Loading states
    loading: query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || null,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
    
    // Actions
    createTemplate: createMutation.mutate,
    deleteTemplate: deleteMutation.mutate,
    duplicateTemplate: duplicateMutation.mutate,
    
    // Utility
    refetch: query.refetch,
  };
}

// Hook for fetching a single email template
export function useEmailTemplate(id: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.detail(id || ''),
    queryFn: () => emailTemplatesAPI.getTemplateById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmailTemplateUpdateData) => emailTemplatesAPI.updateTemplate(id!, data),
    onSuccess: (updatedTemplate) => {
      if (updatedTemplate && id) {
        // Update individual template cache
        queryClient.setQueryData(EMAIL_TEMPLATES_QUERY_KEYS.detail(id), updatedTemplate);
        // Update templates list cache
        queryClient.setQueryData<EmailTemplate[]>(
          EMAIL_TEMPLATES_QUERY_KEYS.lists(), 
          (old) => {
            return old
              ? old.map((template) => (template.id === updatedTemplate.id ? updatedTemplate : template))
              : [updatedTemplate];
          }
        );
        // Invalidate stats
        queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.stats() });
      }
    },
  });

  return {
    // Data
    template: query.data || null,
    
    // Loading states
    loading: query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.message || null,
    
    // Mutation states
    isUpdating: updateMutation.isPending,
    
    // Actions
    updateTemplate: updateMutation.mutate,
    
    // Utility
    refetch: query.refetch,
  };
}

// Hook for fetching templates by category
export function useEmailTemplatesByCategory(category: EmailTemplate["category"]) {
  return useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.byCategory(category),
    queryFn: () => emailTemplatesAPI.getTemplatesByCategory(category),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for searching email templates
export function useEmailTemplatesSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.search(query),
    queryFn: () => emailTemplatesAPI.searchTemplates(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  });
}

// Hook for template statistics
export function useEmailTemplateStats() {
  return useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEYS.stats(),
    queryFn: () => emailTemplatesAPI.getTemplateStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  });
}

// Hook for template import/export operations
export function useEmailTemplateOperations() {
  const queryClient = useQueryClient();

  const resetMutation = useMutation({
    mutationFn: () => emailTemplatesAPI.resetToDefaults(),
    onSuccess: (templates) => {
      // Update all caches
      queryClient.setQueryData(EMAIL_TEMPLATES_QUERY_KEYS.lists(), templates);
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.all });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => emailTemplatesAPI.exportTemplates(),
  });

  const importMutation = useMutation({
    mutationFn: (jsonData: string) => emailTemplatesAPI.importTemplates(jsonData),
    onSuccess: (templates) => {
      // Update all caches
      queryClient.setQueryData(EMAIL_TEMPLATES_QUERY_KEYS.lists(), templates);
      queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEYS.all });
    },
  });

  return {
    // Reset
    resetToDefaults: resetMutation.mutate,
    isResetting: resetMutation.isPending,
    
    // Export
    exportTemplates: exportMutation.mutate,
    isExporting: exportMutation.isPending,
    exportData: exportMutation.data,
    
    // Import
    importTemplates: importMutation.mutate,
    isImporting: importMutation.isPending,
    
    // Error states
    resetError: resetMutation.error?.message,
    exportError: exportMutation.error?.message,
    importError: importMutation.error?.message,
  };
}
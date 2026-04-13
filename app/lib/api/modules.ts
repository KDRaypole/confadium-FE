import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { AutomationModuleAttributes, ModuleConfigurationAttributes } from './types';

export type AutomationModule = Resource<AutomationModuleAttributes>;
export type ModuleConfiguration = Resource<ModuleConfigurationAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/automation_modules`;

export const modulesAPI = {
  // ── Modules ─────────────────────────────────────────────

  async getModules(orgId: string, params?: QueryParams): Promise<CollectionDocument<AutomationModuleAttributes>> {
    return api.get<CollectionDocument<AutomationModuleAttributes>>(basePath(orgId), params);
  },

  async getModuleById(id: string): Promise<ResourceDocument<AutomationModuleAttributes>> {
    return api.get<ResourceDocument<AutomationModuleAttributes>>(`/automation_modules/${id}`);
  },

  async createModule(orgId: string, attrs: Partial<AutomationModuleAttributes>): Promise<ResourceDocument<AutomationModuleAttributes>> {
    return api.post<ResourceDocument<AutomationModuleAttributes>>(basePath(orgId), buildResource('automation_module', attrs));
  },

  async updateModule(id: string, attrs: Partial<AutomationModuleAttributes>): Promise<ResourceDocument<AutomationModuleAttributes>> {
    return api.patch<ResourceDocument<AutomationModuleAttributes>>(`/automation_modules/${id}`, buildResource('automation_module', attrs, id));
  },

  async deleteModule(id: string): Promise<void> {
    return api.delete(`/automation_modules/${id}`);
  },

  async searchModules(orgId: string, query: string): Promise<CollectionDocument<AutomationModuleAttributes>> {
    return api.get<CollectionDocument<AutomationModuleAttributes>>(basePath(orgId), { search: query });
  },

  async getModulesByCategory(orgId: string, category: string): Promise<CollectionDocument<AutomationModuleAttributes>> {
    return api.get<CollectionDocument<AutomationModuleAttributes>>(basePath(orgId), { filter: { category } });
  },

  // ── Configurations ──────────────────────────────────────

  async getConfigurations(orgId: string, moduleId: string, params?: QueryParams): Promise<CollectionDocument<ModuleConfigurationAttributes>> {
    return api.get<CollectionDocument<ModuleConfigurationAttributes>>(`${basePath(orgId)}/${moduleId}/configurations`, params);
  },

  async getConfigurationById(id: string): Promise<ResourceDocument<ModuleConfigurationAttributes>> {
    return api.get<ResourceDocument<ModuleConfigurationAttributes>>(`/configurations/${id}`);
  },

  async createConfiguration(orgId: string, moduleId: string, attrs: Partial<ModuleConfigurationAttributes>): Promise<ResourceDocument<ModuleConfigurationAttributes>> {
    return api.post<ResourceDocument<ModuleConfigurationAttributes>>(`${basePath(orgId)}/${moduleId}/configurations`, buildResource('module_configuration', attrs));
  },

  async updateConfiguration(id: string, attrs: Partial<ModuleConfigurationAttributes>): Promise<ResourceDocument<ModuleConfigurationAttributes>> {
    return api.patch<ResourceDocument<ModuleConfigurationAttributes>>(`/configurations/${id}`, buildResource('module_configuration', attrs, id));
  },

  async deleteConfiguration(id: string): Promise<void> {
    return api.delete(`/configurations/${id}`);
  },
};

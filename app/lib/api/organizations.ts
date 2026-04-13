import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { OrganizationAttributes } from './types';

export type Organization = Resource<OrganizationAttributes>;

export const organizationsAPI = {
  async getOrganizations(params?: QueryParams): Promise<CollectionDocument<OrganizationAttributes>> {
    return api.get<CollectionDocument<OrganizationAttributes>>('/organizations', params);
  },

  async getOrganizationById(id: string): Promise<ResourceDocument<OrganizationAttributes>> {
    return api.get<ResourceDocument<OrganizationAttributes>>(`/organizations/${id}`);
  },

  async createOrganization(attrs: Partial<OrganizationAttributes>): Promise<ResourceDocument<OrganizationAttributes>> {
    return api.post<ResourceDocument<OrganizationAttributes>>('/organizations', buildResource('organization', attrs));
  },

  async updateOrganization(id: string, attrs: Partial<OrganizationAttributes>): Promise<ResourceDocument<OrganizationAttributes>> {
    return api.patch<ResourceDocument<OrganizationAttributes>>(`/organizations/${id}`, buildResource('organization', attrs, id));
  },

  async deleteOrganization(id: string): Promise<void> {
    return api.delete(`/organizations/${id}`);
  },
};

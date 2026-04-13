import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { ContactAttributes } from './types';

export type Contact = Resource<ContactAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/contacts`;

export const contactsAPI = {
  async getContacts(orgId: string, params?: QueryParams): Promise<CollectionDocument<ContactAttributes>> {
    return api.get<CollectionDocument<ContactAttributes>>(basePath(orgId), params);
  },

  async getContactById(id: string): Promise<ResourceDocument<ContactAttributes>> {
    return api.get<ResourceDocument<ContactAttributes>>(`/contacts/${id}`, { included: 'deals,activities,owner,taggings,tags' });
  },

  async createContact(orgId: string, attrs: Partial<ContactAttributes>): Promise<ResourceDocument<ContactAttributes>> {
    return api.post<ResourceDocument<ContactAttributes>>(basePath(orgId), buildResource('contact', attrs));
  },

  async updateContact(id: string, attrs: Partial<ContactAttributes>): Promise<ResourceDocument<ContactAttributes>> {
    return api.patch<ResourceDocument<ContactAttributes>>(`/contacts/${id}`, buildResource('contact', attrs, id));
  },

  async deleteContact(id: string): Promise<void> {
    return api.delete(`/contacts/${id}`);
  },
};

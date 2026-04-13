import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams, type ResourceIdentifier } from './client';
import type { DealAttributes } from './types';

export type Deal = Resource<DealAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/deals`;

export const dealsAPI = {
  async getDeals(orgId: string, params?: QueryParams): Promise<CollectionDocument<DealAttributes>> {
    return api.get<CollectionDocument<DealAttributes>>(basePath(orgId), params);
  },

  async getDealById(id: string): Promise<ResourceDocument<DealAttributes>> {
    return api.get<ResourceDocument<DealAttributes>>(`/deals/${id}`, { included: 'contact,owner,activities' });
  },

  async createDeal(orgId: string, attrs: Partial<DealAttributes>, contactId?: string): Promise<ResourceDocument<DealAttributes>> {
    const relationships = contactId
      ? { contact: { data: { type: 'contact', id: contactId } as ResourceIdentifier } }
      : undefined;
    return api.post<ResourceDocument<DealAttributes>>(basePath(orgId), buildResource('deal', attrs, undefined, relationships));
  },

  async updateDeal(id: string, attrs: Partial<DealAttributes>): Promise<ResourceDocument<DealAttributes>> {
    return api.patch<ResourceDocument<DealAttributes>>(`/deals/${id}`, buildResource('deal', attrs, id));
  },

  async deleteDeal(id: string): Promise<void> {
    return api.delete(`/deals/${id}`);
  },
};

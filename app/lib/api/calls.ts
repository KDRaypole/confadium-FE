import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { CallAttributes } from './types';

export type Call = Resource<CallAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/calls`;

export const callsAPI = {
  async getCalls(orgId: string, params?: QueryParams): Promise<CollectionDocument<CallAttributes>> {
    return api.get<CollectionDocument<CallAttributes>>(basePath(orgId), params);
  },

  async getCallById(id: string): Promise<ResourceDocument<CallAttributes>> {
    return api.get<ResourceDocument<CallAttributes>>(`/calls/${id}`, { included: 'contact' });
  },

  async createCall(orgId: string, attrs: Partial<CallAttributes>): Promise<ResourceDocument<CallAttributes>> {
    return api.post<ResourceDocument<CallAttributes>>(basePath(orgId), buildResource('call', attrs));
  },
};

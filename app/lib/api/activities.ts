import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { ActivityAttributes } from './types';

export type Activity = Resource<ActivityAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/activities`;

export const activitiesAPI = {
  async getActivities(orgId: string, params?: QueryParams): Promise<CollectionDocument<ActivityAttributes>> {
    return api.get<CollectionDocument<ActivityAttributes>>(basePath(orgId), params);
  },

  async getActivityById(id: string): Promise<ResourceDocument<ActivityAttributes>> {
    return api.get<ResourceDocument<ActivityAttributes>>(`/activities/${id}`, { included: 'contact,deal' });
  },

  async createActivity(orgId: string, attrs: Partial<ActivityAttributes>): Promise<ResourceDocument<ActivityAttributes>> {
    return api.post<ResourceDocument<ActivityAttributes>>(basePath(orgId), buildResource('activity', attrs));
  },

  async updateActivity(id: string, attrs: Partial<ActivityAttributes>): Promise<ResourceDocument<ActivityAttributes>> {
    return api.patch<ResourceDocument<ActivityAttributes>>(`/activities/${id}`, buildResource('activity', attrs, id));
  },
};

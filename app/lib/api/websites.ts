import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { WebsiteAttributes, PageAttributes } from './types';

export type Website = Resource<WebsiteAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/websites`;

export const websitesApi = {
  // ── Websites ───────────────────────────────────────────────

  async getWebsites(orgId: string, params?: QueryParams): Promise<CollectionDocument<WebsiteAttributes>> {
    return api.get<CollectionDocument<WebsiteAttributes>>(basePath(orgId), params);
  },

  async getWebsiteById(id: string): Promise<ResourceDocument<WebsiteAttributes>> {
    return api.get<ResourceDocument<WebsiteAttributes>>(`/websites/${id}`);
  },

  async createWebsite(orgId: string, attrs: Partial<WebsiteAttributes>): Promise<ResourceDocument<WebsiteAttributes>> {
    return api.post<ResourceDocument<WebsiteAttributes>>(basePath(orgId), buildResource('website', attrs));
  },

  async updateWebsite(id: string, attrs: Partial<WebsiteAttributes>): Promise<ResourceDocument<WebsiteAttributes>> {
    return api.patch<ResourceDocument<WebsiteAttributes>>(`/websites/${id}`, buildResource('website', attrs, id));
  },

  async deleteWebsite(id: string): Promise<void> {
    return api.delete(`/websites/${id}`);
  },

  // ── State Transitions ──────────────────────────────────────

  async transitionState(websiteId: string, stateId: string): Promise<void> {
    await api.put(`/websites/${websiteId}/state/${stateId}`, {});
  },

  // ── Pages within a Website ─────────────────────────────────

  async getWebsitePages(websiteId: string, params?: QueryParams): Promise<CollectionDocument<PageAttributes>> {
    return api.get<CollectionDocument<PageAttributes>>(`/websites/${websiteId}/pages`, params);
  },

  async createPageInWebsite(websiteId: string, attrs: Partial<PageAttributes>): Promise<ResourceDocument<PageAttributes>> {
    return api.post<ResourceDocument<PageAttributes>>(`/websites/${websiteId}/pages`, buildResource('page', attrs));
  },
};

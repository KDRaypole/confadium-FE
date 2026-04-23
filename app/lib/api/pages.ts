import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { PageAttributes, PageTemplateAttributes } from './types';

export type Page = Resource<PageAttributes>;
export type PageTemplate = Resource<PageTemplateAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/pages`;
const templateBasePath = (orgId: string) => `/organizations/${orgId}/page_templates`;

export const pagesApi = {
  // ── Pages ──────────────────────────────────────────────────

  async getPages(orgId: string, params?: QueryParams): Promise<CollectionDocument<PageAttributes>> {
    return api.get<CollectionDocument<PageAttributes>>(basePath(orgId), params);
  },

  async getPageById(id: string): Promise<ResourceDocument<PageAttributes>> {
    return api.get<ResourceDocument<PageAttributes>>(`/pages/${id}`);
  },

  async createPage(orgId: string, attrs: Partial<PageAttributes>): Promise<ResourceDocument<PageAttributes>> {
    return api.post<ResourceDocument<PageAttributes>>(basePath(orgId), buildResource('page', attrs));
  },

  async updatePage(id: string, attrs: Partial<PageAttributes>): Promise<ResourceDocument<PageAttributes>> {
    return api.patch<ResourceDocument<PageAttributes>>(`/pages/${id}`, buildResource('page', attrs, id));
  },

  async deletePage(id: string): Promise<void> {
    return api.delete(`/pages/${id}`);
  },

  // ── State Transitions ──────────────────────────────────────

  async transitionState(pageId: string, stateId: string): Promise<void> {
    await api.put(`/pages/${pageId}/state/${stateId}`, {});
  },

  // ── Page Templates ─────────────────────────────────────────

  async getTemplates(orgId: string, params?: QueryParams): Promise<CollectionDocument<PageTemplateAttributes>> {
    return api.get<CollectionDocument<PageTemplateAttributes>>(templateBasePath(orgId), params);
  },

  async getTemplateById(id: string): Promise<ResourceDocument<PageTemplateAttributes>> {
    return api.get<ResourceDocument<PageTemplateAttributes>>(`/page_templates/${id}`);
  },

  async createTemplate(orgId: string, attrs: Partial<PageTemplateAttributes>): Promise<ResourceDocument<PageTemplateAttributes>> {
    return api.post<ResourceDocument<PageTemplateAttributes>>(templateBasePath(orgId), buildResource('page_template', attrs));
  },

  async updateTemplate(id: string, attrs: Partial<PageTemplateAttributes>): Promise<ResourceDocument<PageTemplateAttributes>> {
    return api.patch<ResourceDocument<PageTemplateAttributes>>(`/page_templates/${id}`, buildResource('page_template', attrs, id));
  },

  async deleteTemplate(id: string): Promise<void> {
    return api.delete(`/page_templates/${id}`);
  },

  // ── Public Pages ──────────────────────────────────────────

  async getPublicPage(websiteSlug: string, pageSlug: string): Promise<Page> {
    const result = await api.get<ResourceDocument<PageAttributes>>(`/public/pages/${websiteSlug}/${pageSlug}`);
    const resource = result.data;
    return { ...resource, ...resource.attributes } as Page;
  },
};

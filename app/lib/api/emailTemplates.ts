import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { EmailTemplateAttributes, EmailTemplateCategory } from './types';

export type EmailTemplate = Resource<EmailTemplateAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/email_templates`;

export const emailTemplatesAPI = {
  async getTemplates(orgId: string, params?: QueryParams): Promise<CollectionDocument<EmailTemplateAttributes>> {
    return api.get<CollectionDocument<EmailTemplateAttributes>>(basePath(orgId), params);
  },

  async getTemplatesByCategory(orgId: string, category: EmailTemplateCategory): Promise<CollectionDocument<EmailTemplateAttributes>> {
    return api.get<CollectionDocument<EmailTemplateAttributes>>(basePath(orgId), {
      filter: { category },
    });
  },

  async getTemplateById(id: string): Promise<ResourceDocument<EmailTemplateAttributes>> {
    return api.get<ResourceDocument<EmailTemplateAttributes>>(`/templates/${id}`);
  },

  async createTemplate(orgId: string, attrs: Partial<EmailTemplateAttributes>): Promise<ResourceDocument<EmailTemplateAttributes>> {
    return api.post<ResourceDocument<EmailTemplateAttributes>>(basePath(orgId), buildResource('email_template', attrs));
  },

  async updateTemplate(id: string, attrs: Partial<EmailTemplateAttributes>): Promise<ResourceDocument<EmailTemplateAttributes>> {
    return api.patch<ResourceDocument<EmailTemplateAttributes>>(`/templates/${id}`, buildResource('email_template', attrs, id));
  },

  async deleteTemplate(id: string): Promise<void> {
    return api.delete(`/templates/${id}`);
  },

  async searchTemplates(orgId: string, query: string): Promise<CollectionDocument<EmailTemplateAttributes>> {
    return api.get<CollectionDocument<EmailTemplateAttributes>>(basePath(orgId), { search: query });
  },
};

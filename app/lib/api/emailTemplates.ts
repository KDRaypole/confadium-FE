import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { EmailTemplateAttributes, EmailTemplateCategory, EmailComponentNode, EmailTheme, EmailTemplateVariable } from './types';

export interface EmailTemplateVariablesResponse {
  data: {
    type: string;
    id: string;
    attributes: {
      variables: EmailTemplateVariable[];
    };
  };
}

export type EmailTemplate = Resource<EmailTemplateAttributes>;

// Frontend-friendly version with camelCase field names
export interface EmailTemplateCreateData {
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  description: string;
  previewText: string;
  structure?: EmailComponentNode[];
  theme?: EmailTheme;
}

export interface EmailTemplateUpdateData extends EmailTemplateCreateData {}

// Convert frontend camelCase data to API snake_case attributes
export function toTemplateAttributes(data: Partial<EmailTemplateCreateData>): Partial<EmailTemplateAttributes> {
  const attrs: Partial<EmailTemplateAttributes> = {};
  if (data.name !== undefined) attrs.name = data.name;
  if (data.category !== undefined) attrs.category = data.category as EmailTemplateCategory;
  if (data.subject !== undefined) attrs.subject = data.subject;
  if (data.htmlContent !== undefined) attrs.html_content = data.htmlContent;
  if (data.textContent !== undefined) attrs.text_content = data.textContent;
  if (data.description !== undefined) attrs.description = data.description;
  if (data.previewText !== undefined) attrs.preview_text = data.previewText;
  if (data.variables !== undefined) attrs.variables = data.variables;
  if (data.structure !== undefined) attrs.structure = data.structure;
  if (data.theme !== undefined) attrs.theme = data.theme;
  return attrs;
}

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

  async getTemplateVariables(templateId: string): Promise<EmailTemplateVariablesResponse> {
    return api.get<EmailTemplateVariablesResponse>(`/templates/${templateId}/variables`);
  },
};

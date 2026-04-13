import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type {
  FormAttributes, FormFieldAttributes, FormSubmissionAttributes,
  FormTheme, FormSettings, FormFieldType, ConditionalAction, FormFieldValidation,
} from './types';

export type Form = Resource<FormAttributes>;
export type FormField = Resource<FormFieldAttributes>;
export type FormSubmission = Resource<FormSubmissionAttributes>;

// Re-export types for backward compatibility
export type { FormTheme, FormSettings, FormFieldType, ConditionalAction, FormFieldValidation };

const basePath = (orgId: string) => `/organizations/${orgId}/forms`;

export const formsApi = {
  // ── Forms ───────────────────────────────────────────────

  async getForms(orgId: string, params?: QueryParams): Promise<CollectionDocument<FormAttributes>> {
    return api.get<CollectionDocument<FormAttributes>>(basePath(orgId), params);
  },

  async getActiveForms(orgId: string): Promise<CollectionDocument<FormAttributes>> {
    return api.get<CollectionDocument<FormAttributes>>(basePath(orgId), {
      filter: { state: 'published' },
    });
  },

  async getFormById(id: string): Promise<ResourceDocument<FormAttributes>> {
    return api.get<ResourceDocument<FormAttributes>>(`/forms/${id}`);
  },

  async createForm(orgId: string, attrs: Partial<FormAttributes>): Promise<ResourceDocument<FormAttributes>> {
    return api.post<ResourceDocument<FormAttributes>>(basePath(orgId), buildResource('form', attrs));
  },

  async updateForm(id: string, attrs: Partial<FormAttributes>): Promise<ResourceDocument<FormAttributes>> {
    return api.patch<ResourceDocument<FormAttributes>>(`/forms/${id}`, buildResource('form', attrs, id));
  },

  async deleteForm(id: string): Promise<void> {
    return api.delete(`/forms/${id}`);
  },

  // ── Form Fields ─────────────────────────────────────────

  async getFields(formId: string, params?: QueryParams): Promise<CollectionDocument<FormFieldAttributes>> {
    return api.get<CollectionDocument<FormFieldAttributes>>(`/forms/${formId}/fields`, params);
  },

  async createField(formId: string, attrs: Partial<FormFieldAttributes>): Promise<ResourceDocument<FormFieldAttributes>> {
    return api.post<ResourceDocument<FormFieldAttributes>>(`/forms/${formId}/fields`, buildResource('form_field', attrs));
  },

  async updateField(fieldId: string, attrs: Partial<FormFieldAttributes>): Promise<ResourceDocument<FormFieldAttributes>> {
    return api.patch<ResourceDocument<FormFieldAttributes>>(`/fields/${fieldId}`, buildResource('form_field', attrs, fieldId));
  },

  async deleteField(fieldId: string): Promise<void> {
    return api.delete(`/fields/${fieldId}`);
  },

  // ── Form Submissions ────────────────────────────────────

  async getSubmissions(formId: string, params?: QueryParams): Promise<CollectionDocument<FormSubmissionAttributes>> {
    return api.get<CollectionDocument<FormSubmissionAttributes>>(`/forms/${formId}/submissions`, params);
  },

  async createSubmission(formId: string, data: Record<string, unknown>): Promise<ResourceDocument<FormSubmissionAttributes>> {
    return api.post<ResourceDocument<FormSubmissionAttributes>>(`/forms/${formId}/submissions`, buildResource('form_submission', { data }));
  },

  // ── State Transitions ───────────────────────────────────

  async transitionState(formId: string, stateId: string): Promise<void> {
    await api.put(`/forms/${formId}/state/${stateId}`, {});
  },
};

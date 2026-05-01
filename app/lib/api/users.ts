import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { UserAttributes } from './types';

export type User = Resource<UserAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/users`;

export const usersAPI = {
  async getUsers(orgId: string, params?: QueryParams): Promise<CollectionDocument<UserAttributes>> {
    return api.get<CollectionDocument<UserAttributes>>(basePath(orgId), params);
  },

  async getUserById(id: string): Promise<ResourceDocument<UserAttributes>> {
    return api.get<ResourceDocument<UserAttributes>>(`/users/${id}`, { included: 'organization,org_node' });
  },

  async createUser(orgId: string, attrs: Partial<UserAttributes>): Promise<ResourceDocument<UserAttributes>> {
    return api.post<ResourceDocument<UserAttributes>>(basePath(orgId), buildResource('user', attrs));
  },

  async deleteUser(id: string): Promise<void> {
    return api.delete(`/users/${id}`);
  },

  async resendInvitation(id: string): Promise<ResourceDocument<UserAttributes>> {
    return api.post<ResourceDocument<UserAttributes>>(`/users/${id}/resend_invitation`, {});
  },
};

// Confirmation API (public - no auth required)
export const confirmationsAPI = {
  async getConfirmation(token: string): Promise<ResourceDocument<{ email: string; expired: boolean; organization_name: string }>> {
    return api.get<ResourceDocument<{ email: string; expired: boolean; organization_name: string }>>(`/confirmations/${token}`);
  },

  async setPassword(token: string, password: string, passwordConfirmation: string): Promise<{ data: { token: string } }> {
    return api.patch<{ data: { token: string } }>(`/confirmations/${token}`, {
      data: {
        type: 'confirmation',
        attributes: {
          password,
          password_confirmation: passwordConfirmation,
        },
      },
    });
  },
};

// Recovery API (public - no auth required)
export const recoveriesAPI = {
  async requestRecovery(email: string): Promise<void> {
    return api.post<void>('/recoveries', {
      data: {
        type: 'recovery',
        attributes: { email },
      },
    });
  },

  async getRecovery(token: string): Promise<ResourceDocument<{ expired: boolean }>> {
    return api.get<ResourceDocument<{ expired: boolean }>>(`/recoveries/${token}`);
  },

  async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<{ data: { token: string } }> {
    return api.patch<{ data: { token: string } }>(`/recoveries/${token}`, {
      data: {
        type: 'recovery',
        attributes: {
          password,
          password_confirmation: passwordConfirmation,
        },
      },
    });
  },
};

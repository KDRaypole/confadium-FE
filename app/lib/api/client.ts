/**
 * JSON:API Client
 *
 * Unified HTTP client for the Rails JSON:API backend.
 * All responses follow the JSON:API spec with { data, meta, included } structure.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// ── JSON:API Types ──────────────────────────────────────────

export interface ResourceIdentifier {
  type: string;
  id: string;
}

export interface Resource<A = Record<string, unknown>> {
  type: string;
  id: string;
  attributes: A;
  relationships?: Record<string, { data: ResourceIdentifier | ResourceIdentifier[] }>;
}

export interface ResourceDocument<A = Record<string, unknown>> {
  data: Resource<A>;
  included?: Resource[];
}

export interface CollectionDocument<A = Record<string, unknown>> {
  data: Resource<A>[];
  meta?: { total: number };
  included?: Resource[];
}

export interface ErrorObject {
  status: string;
  title: string;
  detail?: string;
  source?: { pointer: string };
}

export interface ErrorDocument {
  errors: ErrorObject[];
}

// ── Query Parameters ────────────────────────────────────────

export interface QueryParams {
  page?: { size?: number; number?: number };
  sort?: string;
  search?: string;
  filter?: Record<string, string | boolean>;
  included?: string;
}

function buildQueryString(params?: QueryParams): string {
  if (!params) return '';
  const parts: string[] = [];

  if (params.page?.size) parts.push(`page[size]=${params.page.size}`);
  if (params.page?.number) parts.push(`page[number]=${params.page.number}`);
  if (params.sort) parts.push(`sort=${params.sort}`);
  if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.included) parts.push(`included=${params.included}`);
  if (params.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      parts.push(`filter[${key}]=${encodeURIComponent(String(value))}`);
    });
  }

  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

// ── Request Helpers ─────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
  };

  try {
    const stored = localStorage.getItem('crm-auth');
    if (stored) {
      const user = JSON.parse(stored);
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch {
    // no auth
  }

  return headers;
}

class ApiError extends Error {
  status: number;
  errors: ErrorObject[];

  constructor(status: number, errors: ErrorObject[]) {
    super(errors[0]?.detail || errors[0]?.title || 'API Error');
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json.errors || [{ status: String(res.status), title: 'Error' }]);
  }

  return json as T;
}

// ── Public API ──────────────────────────────────────────────

export const api = {
  get: <T>(path: string, params?: QueryParams) =>
    request<T>('GET', `${path}${buildQueryString(params)}`),

  post: <T>(path: string, body: unknown) =>
    request<T>('POST', path, body),

  patch: <T>(path: string, body: unknown) =>
    request<T>('PATCH', path, body),

  put: <T>(path: string, body: unknown) =>
    request<T>('PUT', path, body),

  delete: (path: string) =>
    request<void>('DELETE', path),
};

// ── Resource Builder ────────────────────────────────────────

export function buildResource(
  type: string,
  attributes: Record<string, unknown>,
  id?: string,
  relationships?: Record<string, { data: ResourceIdentifier | ResourceIdentifier[] }>
) {
  const data: Record<string, unknown> = { type, attributes };
  if (id) data.id = id;
  if (relationships) data.relationships = relationships;
  return { data };
}

export { ApiError };

import { api, buildResource, type Resource, type CollectionDocument, type ResourceDocument, type QueryParams } from './client';
import type { ProductAttributes, ProductVariantAttributes } from './types';

export type Product = Resource<ProductAttributes>;
export type ProductVariant = Resource<ProductVariantAttributes>;

const basePath = (orgId: string) => `/organizations/${orgId}/products`;

export const productsApi = {
  // ── Products ───────────────────────────────────────────────

  async getProducts(orgId: string, params?: QueryParams): Promise<CollectionDocument<ProductAttributes>> {
    return api.get<CollectionDocument<ProductAttributes>>(basePath(orgId), params);
  },

  async getProductById(id: string): Promise<ResourceDocument<ProductAttributes>> {
    return api.get<ResourceDocument<ProductAttributes>>(`/products/${id}`);
  },

  async createProduct(orgId: string, attrs: Partial<ProductAttributes>): Promise<ResourceDocument<ProductAttributes>> {
    return api.post<ResourceDocument<ProductAttributes>>(basePath(orgId), buildResource('product', attrs));
  },

  async updateProduct(id: string, attrs: Partial<ProductAttributes>): Promise<ResourceDocument<ProductAttributes>> {
    return api.patch<ResourceDocument<ProductAttributes>>(`/products/${id}`, buildResource('product', attrs, id));
  },

  async deleteProduct(id: string): Promise<void> {
    return api.delete(`/products/${id}`);
  },

  // ── State Transitions ──────────────────────────────────────

  async transitionState(productId: string, stateId: string): Promise<void> {
    await api.put(`/products/${productId}/state/${stateId}`, {});
  },

  // ── Product Variants ───────────────────────────────────────

  async getVariants(productId: string, params?: QueryParams): Promise<CollectionDocument<ProductVariantAttributes>> {
    return api.get<CollectionDocument<ProductVariantAttributes>>(`/products/${productId}/variants`, params);
  },

  async getVariantById(id: string): Promise<ResourceDocument<ProductVariantAttributes>> {
    return api.get<ResourceDocument<ProductVariantAttributes>>(`/variants/${id}`);
  },

  async createVariant(productId: string, attrs: Partial<ProductVariantAttributes>): Promise<ResourceDocument<ProductVariantAttributes>> {
    return api.post<ResourceDocument<ProductVariantAttributes>>(`/products/${productId}/variants`, buildResource('product_variant', attrs));
  },

  async updateVariant(id: string, attrs: Partial<ProductVariantAttributes>): Promise<ResourceDocument<ProductVariantAttributes>> {
    return api.patch<ResourceDocument<ProductVariantAttributes>>(`/variants/${id}`, buildResource('product_variant', attrs, id));
  },

  async deleteVariant(id: string): Promise<void> {
    return api.delete(`/variants/${id}`);
  },
};

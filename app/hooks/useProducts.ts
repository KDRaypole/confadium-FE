import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@remix-run/react';
import { productsApi } from '~/lib/api/products';
import type { ProductAttributes, ProductVariantAttributes } from '~/lib/api/types';
import type { Resource } from '~/lib/api/client';
import { useNodeFilter, useNodeCacheKey, useNodeAttrs } from './useNodeFilter';

export type Product = Resource<ProductAttributes>;
export type ProductVariant = Resource<ProductVariantAttributes>;

export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  list: (orgId: string, nodeKey?: string | null) => [...PRODUCTS_QUERY_KEYS.all, 'list', orgId, nodeKey] as const,
  detail: (id: string) => [...PRODUCTS_QUERY_KEYS.all, 'detail', id] as const,
  variants: (productId: string) => [...PRODUCTS_QUERY_KEYS.all, 'variants', productId] as const,
};

export const useProducts = () => {
  const { orgId = '' } = useParams();
  const queryClient = useQueryClient();
  const nodeFilter = useNodeFilter();
  const nodeKey = useNodeCacheKey();
  const nodeAttrs = useNodeAttrs();

  const query = useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.list(orgId, nodeKey),
    queryFn: () => productsApi.getProducts(orgId, {
      ...(Object.keys(nodeFilter).length ? { filter: nodeFilter } : {}),
    }),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.all });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<ProductAttributes>) => productsApi.createProduct(orgId, { ...nodeAttrs, ...attrs }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: invalidate,
  });

  return {
    products: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createProduct: createMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
  };
};

export const useProduct = (productId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.detail(productId),
    queryFn: () => productsApi.getProductById(productId),
    select: (data) => data.data,
    enabled: !!productId,
  });

  const updateMutation = useMutation({
    mutationFn: (attrs: Partial<ProductAttributes>) => productsApi.updateProduct(productId, attrs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.all }),
  });

  return {
    product: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const useProductVariants = (productId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PRODUCTS_QUERY_KEYS.variants(productId),
    queryFn: () => productsApi.getVariants(productId),
    select: (data) => data.data,
    enabled: !!productId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.variants(productId) });

  const createMutation = useMutation({
    mutationFn: (attrs: Partial<ProductVariantAttributes>) => productsApi.createVariant(productId, attrs),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, attrs }: { id: string; attrs: Partial<ProductVariantAttributes> }) =>
      productsApi.updateVariant(id, attrs),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteVariant(id),
    onSuccess: invalidate,
  });

  return {
    variants: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    createVariant: createMutation.mutateAsync,
    updateVariant: updateMutation.mutateAsync,
    deleteVariant: deleteMutation.mutateAsync,
  };
};

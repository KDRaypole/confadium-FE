import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { useProduct, useProductVariants } from "~/hooks/useProducts";
import { useNodeContext } from "~/contexts/NodeContext";
import VariantEditor from "~/components/products/VariantEditor";
import {
  PencilIcon,
  ArrowLeftIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import StateManager from "~/components/ui/StateManager";
import { PRODUCTS_QUERY_KEYS } from "~/hooks/useProducts";

export const meta: MetaFunction = () => {
  return [{ title: "Product Detail - CRM Dashboard" }];
};

export default function ProductDetail() {
  const { orgId, productId = "" } = useParams();
  const { buildListPath } = useNodeContext();
  const { product, loading } = useProduct(productId);
  const { variants, createVariant, updateVariant, deleteVariant } = useProductVariants(productId);

  const formatPrice = (cents: number | null, currency: string) => {
    if (cents == null) return "No price set";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="py-6 text-center">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Product not found</h3>
        </div>
      </Layout>
    );
  }

  const attrs = product.attributes;

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={buildListPath('products')} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Products
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{attrs.name}</h1>
                <div className="mt-1 flex items-center space-x-3">
                  <span className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                    {formatPrice(attrs.price_cents, attrs.currency)}
                  </span>
                </div>
              </div>
              <Link
                to={`/organizations/${orgId}/products/${productId}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <PencilIcon className="h-4 w-4 mr-2" /> Edit
              </Link>
            </div>
          </div>

          {/* State management */}
          <StateManager
            entityType="products"
            entityId={productId}
            stateAttrs={attrs}
            invalidateKeys={[PRODUCTS_QUERY_KEYS.all, PRODUCTS_QUERY_KEYS.detail(productId)]}
            layout="full"
          />

          {/* Details */}
          <div className="space-y-6 mt-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Details</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {attrs.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{attrs.description}</dd>
                    </div>
                  )}
                  {attrs.sku && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{attrs.sku}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pricing Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{attrs.pricing_type}</dd>
                  </div>
                  {attrs.category && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{attrs.category}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</dt>
                    <dd className="mt-1 text-sm">
                      {attrs.available ? (
                        <span className="text-green-600 dark:text-green-400">Available</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Unavailable</span>
                      )}
                    </dd>
                  </div>
                  {attrs.inventory_count != null && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Inventory</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{attrs.inventory_count} units</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Variants */}
            <VariantEditor
              variants={variants}
              onAdd={async (attrs) => { await createVariant(attrs); }}
              onUpdate={async (id, attrs) => { await updateVariant({ id, attrs }); }}
              onDelete={deleteVariant}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

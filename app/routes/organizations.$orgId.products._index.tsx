import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import {
  PlusIcon,
  CubeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useProducts } from "~/hooks/useProducts";
import { StateBadge } from "~/components/ui/StateManager";

export const meta: MetaFunction = () => {
  return [
    { title: "Products - CRM Dashboard" },
    { name: "description", content: "Manage products and pricing" },
  ];
};

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'draft' | 'archived';

export default function ProductsIndex() {
  const { orgId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { products, loading, error, deleteProduct } = useProducts();

  const filteredProducts = products.filter(product => {
    const name = product.attributes.name || '';
    const description = product.attributes.description || '';
    const stateAction = product.attributes.state?.action || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || stateAction === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (cents: number | null, currency: string) => {
    if (cents == null) return "No price";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  };

  const getStatusBadge = (state: { action: string; name: string } | null) => <StateBadge state={state} />;

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage products, pricing, and availability
                </p>
              </div>
              <Link
                to={`/organizations/${orgId}/products/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                New Product
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <CubeIcon className="h-6 w-6 text-purple-600" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{products.length}</dd>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {products.filter(p => p.attributes.state?.action === 'active').length}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {products.filter(p => p.attributes.available).length}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search/Filters */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="block pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600'} rounded-l-md`}>
                      <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-gray-600'} rounded-r-md border-l border-gray-300 dark:border-gray-600`}>
                      <ListBulletIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Display */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <CubeIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Error loading products</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No products found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating your first product'}
                </p>
                {(!searchQuery && statusFilter === 'all') && (
                  <div className="mt-6">
                    <Link to={`/organizations/${orgId}/products/new`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                      <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                      Create Product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden">
                  {product.attributes.image_url && (
                    <div className="h-40 bg-gray-100 dark:bg-gray-700">
                      <img src={product.attributes.image_url} alt={product.attributes.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">{product.attributes.name}</h3>
                      {getStatusBadge(product.attributes.state)}
                    </div>
                    <p className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      {formatPrice(product.attributes.price_cents, product.attributes.currency)}
                    </p>
                    {product.attributes.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{product.attributes.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        {product.attributes.sku && <span>SKU: {product.attributes.sku}</span>}
                        {product.attributes.category && <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{product.attributes.category}</span>}
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/organizations/${orgId}/products/${product.id}`} className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link to={`/organizations/${orgId}/products/${product.id}/edit`} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.attributes.name}</div>
                        {product.attributes.sku && <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.attributes.sku}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatPrice(product.attributes.price_cents, product.attributes.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.attributes.state)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.attributes.category || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/organizations/${orgId}/products/${product.id}`} className="text-purple-600 hover:text-purple-700 dark:text-purple-400"><EyeIcon className="h-4 w-4" /></Link>
                          <Link to={`/organizations/${orgId}/products/${product.id}/edit`} className="text-gray-600 hover:text-gray-700 dark:text-gray-400"><PencilIcon className="h-4 w-4" /></Link>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-700 dark:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

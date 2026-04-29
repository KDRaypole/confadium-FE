import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import { useForms } from "~/hooks/useForms";
import { useOptionalNodeContext } from "~/contexts/NodeContext";
import { StateBadge } from "~/components/ui/StateManager";
import ShareFormButton from "~/components/forms/ShareFormButton";

export const meta: MetaFunction = () => {
  return [
    { title: "Forms - CRM Dashboard" },
    { name: "description", content: "Manage dynamic forms for your organization" },
  ];
};

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

export default function FormsIndex() {
  const { orgId } = useParams();
  const nodeCtx = useOptionalNodeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { forms, loading, error } = useForms();

  const filteredForms = forms.filter(form => {
    const name = form.attributes.name || '';
    const description = form.attributes.description || '';
    const stateAction = form.attributes.state?.action || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || stateAction === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (state: { action: string; name: string } | null) => <StateBadge state={state} />;

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forms</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Create and manage dynamic forms for data collection
                </p>
              </div>
              <Link
                to={`/organizations/${orgId}/forms/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                New Form
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Forms</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{forms.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Published</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {forms.filter(f => f.attributes.state?.action === 'published').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PencilIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Drafts</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {forms.filter(f => f.attributes.state?.action === 'draft').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search forms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      } rounded-l-md`}
                    >
                      <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      } rounded-r-md border-l border-gray-300 dark:border-gray-600`}
                    >
                      <ListBulletIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forms Display */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading forms...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Error loading forms</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No forms found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first form'
                  }
                </p>
                {(!searchQuery && statusFilter === 'all') && (
                  <div className="mt-6">
                    <Link
                      to={`/organizations/${orgId}/forms/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                      Create Form
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <div key={form.id} className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: form.attributes.theme?.primaryColor || '#7c3aed' }}
                        />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                          {form.attributes.name}
                        </h3>
                      </div>
                      {getStatusBadge(form.attributes.state)}
                    </div>

                    {form.attributes.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {form.attributes.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Updated {new Date(form.attributes.updated_at).toLocaleDateString()}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Link
                          to={nodeCtx?.buildDetailPath('forms', form.id) ?? `/organizations/${orgId}/forms/${form.id}`}
                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={nodeCtx?.buildDetailPath('forms', form.id, 'edit') ?? `/organizations/${orgId}/forms/${form.id}/edit`}
                          className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <ShareFormButton formId={form.id} />
                      </div>
                      <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredForms.map((form) => (
                      <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: form.attributes.theme?.primaryColor || '#7c3aed' }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {form.attributes.name}
                              </div>
                              {form.attributes.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {form.attributes.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(form.attributes.state)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(form.attributes.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={nodeCtx?.buildDetailPath('forms', form.id) ?? `/organizations/${orgId}/forms/${form.id}`}
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              to={nodeCtx?.buildDetailPath('forms', form.id, 'edit') ?? `/organizations/${orgId}/forms/${form.id}/edit`}
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <ShareFormButton formId={form.id} />
                            <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import {
  PlusIcon,
  DocumentIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { usePages } from "~/hooks/usePages";
import { useWebsites } from "~/hooks/useWebsites";
import { useOptionalNodeContext } from "~/contexts/NodeContext";
import { StateBadge } from "~/components/ui/StateManager";
import ShareLinkButton from "~/components/ui/ShareLinkButton";

export const meta: MetaFunction = () => {
  return [
    { title: "Pages - Confadium" },
    { name: "description", content: "Build and manage website pages" },
  ];
};

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

export default function PagesIndex() {
  const { orgId } = useParams();
  const nodeCtx = useOptionalNodeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { pages, loading, error, deletePage } = usePages();
  const { websites } = useWebsites();

  const getPagePublicUrl = (page: typeof pages[0]) => {
    if (!page.attributes.website_id || page.attributes.state?.name !== 'published') return null;
    const website = websites.find(w => w.id === page.attributes.website_id);
    if (!website || website.attributes.state?.name !== 'published') return null;
    return `${window.location.origin}/${website.attributes.slug}/${page.attributes.slug}`;
  };

  const filteredPages = pages.filter(page => {
    const name = page.attributes.name || '';
    const description = page.attributes.description || '';
    const stateAction = page.attributes.state?.action || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || stateAction === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (state: { action: string; name: string } | null) => <StateBadge state={state} />;

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      await deletePage(id);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pages</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Build and manage website pages with the visual editor
                </p>
              </div>
              <Link
                to={`/organizations/${orgId}/pages/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                New Page
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <DocumentIcon className="h-6 w-6 text-purple-600" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pages</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{pages.length}</dd>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <GlobeAltIcon className="h-6 w-6 text-green-600" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {pages.filter(p => p.attributes.state?.action === 'published').length}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <PencilIcon className="h-6 w-6 text-orange-600" />
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Drafts</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {pages.filter(p => p.attributes.state?.action === 'draft').length}
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
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600' : 'text-gray-400 hover:text-gray-600'} rounded-l-md`}>
                      <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600' : 'text-gray-400 hover:text-gray-600'} rounded-r-md border-l border-gray-300 dark:border-gray-600`}>
                      <ListBulletIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pages Display */}
          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading pages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <DocumentIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Error loading pages</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No pages found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by creating your first page'}
                </p>
                {(!searchQuery && statusFilter === 'all') && (
                  <div className="mt-6">
                    <Link to={`/organizations/${orgId}/pages/new`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                      <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                      Create Page
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page) => (
                <div key={page.id} className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">{page.attributes.name}</h3>
                      {getStatusBadge(page.attributes.state)}
                    </div>
                    {page.attributes.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{page.attributes.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 space-x-3">
                      <span>/{page.attributes.slug}</span>
                      {page.attributes.template_name && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{page.attributes.template_name}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Link to={nodeCtx?.buildDetailPath('pages', page.id) ?? `/organizations/${orgId}/pages/${page.id}`} className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link to={nodeCtx?.buildDetailPath('pages', page.id, 'edit') ?? `/organizations/${orgId}/pages/${page.id}/edit`} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        {(() => {
                          const publicUrl = getPagePublicUrl(page);
                          return publicUrl ? (
                            <ShareLinkButton url={publicUrl} title="Share Page" />
                          ) : null;
                        })()}
                      </div>
                      <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Updated</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{page.attributes.name}</div>
                        {page.attributes.template_name && <div className="text-xs text-gray-500">{page.attributes.template_name}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        /{page.attributes.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(page.attributes.state)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(page.attributes.updated_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={nodeCtx?.buildDetailPath('pages', page.id) ?? `/organizations/${orgId}/pages/${page.id}`} className="text-purple-600 hover:text-purple-700"><EyeIcon className="h-4 w-4" /></Link>
                          <Link to={nodeCtx?.buildDetailPath('pages', page.id, 'edit') ?? `/organizations/${orgId}/pages/${page.id}/edit`} className="text-gray-600 hover:text-gray-700"><PencilIcon className="h-4 w-4" /></Link>
                          {(() => {
                            const publicUrl = getPagePublicUrl(page);
                            return publicUrl ? <ShareLinkButton url={publicUrl} title="Share Page" /> : null;
                          })()}
                          <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
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

import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import {
  PlusIcon,
  GlobeAltIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useWebsites } from "~/hooks/useWebsites";

export const meta: MetaFunction = () => {
  return [
    { title: "Websites - CRM Dashboard" },
    { name: "description", content: "Manage websites and their pages" },
  ];
};

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

export default function WebsitesIndex() {
  const { orgId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { websites, loading, error, deleteWebsite } = useWebsites();

  const filtered = websites.filter(site => {
    const name = site.attributes.name || '';
    const stateAction = site.attributes.state?.action || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || stateAction === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (state: { action: string; name: string } | null) => {
    switch (state?.action) {
      case 'published':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Published</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Draft</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Archived</span>;
      default:
        return null;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this website and all its pages?")) {
      await deleteWebsite(id);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Websites</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage websites and their pages
              </p>
            </div>
            <Link
              to={`/organizations/${orgId}/websites/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              New Website
            </Link>
          </div>

          {/* Search/filter */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mb-8 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 max-w-lg relative">
                <MagnifyingGlassIcon className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search websites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
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
            </div>
          </div>

          {/* Website list */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading websites...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <GlobeAltIcon className="mx-auto h-12 w-12 text-red-400" />
              <p className="mt-2 text-sm text-gray-500">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 text-center py-12">
              <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No websites found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first website to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="mt-6">
                  <Link to={`/organizations/${orgId}/websites/new`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Create Website
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((site) => (
                <Link
                  key={site.id}
                  to={`/organizations/${orgId}/websites/${site.id}`}
                  className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow block"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <GlobeAltIcon className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">{site.attributes.name}</h3>
                      </div>
                      {getStatusBadge(site.attributes.state)}
                    </div>
                    {site.attributes.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{site.attributes.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>/{site.attributes.slug}</span>
                      {site.attributes.domain && <span>{site.attributes.domain}</span>}
                    </div>
                    <div className="mt-4 flex justify-end space-x-2" onClick={(e) => e.preventDefault()}>
                      <Link to={`/organizations/${orgId}/websites/${site.id}/edit`} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(site.id)} className="text-red-600 hover:text-red-700 dark:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

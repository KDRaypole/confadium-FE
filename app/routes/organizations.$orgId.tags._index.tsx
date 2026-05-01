import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { getTagColorClass, getTagPriorityClass } from "~/components/tags/TagsData";
import { useTags } from "~/hooks/useTags";
import { useOptionalNodeContext } from "~/contexts/NodeContext";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TagIcon,
  FunnelIcon,
  ChartBarIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Tags - Confadium" },
    { name: "description", content: "Manage your tags and categories" },
  ];
};

export default function TagsIndex() {
  const { orgId } = useParams();
  const nodeCtx = useOptionalNodeContext();
  const { tags, loading, error, deleteTag } = useTags();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  // Get categories from current tags
  const tagsByCategory = tags.reduce((acc, tag) => {
    const category = tag.attributes.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, typeof tags>);
  const categories = Object.keys(tagsByCategory);

  const filteredTags = tags.filter(tag => {
    const matchesSearch = (tag.attributes.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tag.attributes.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tag.attributes.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || tag.attributes.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return;
    }

    setDeletingTagId(tagId);
    try {
      await deleteTag(tagId);
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag. Please try again.');
    } finally {
      setDeletingTagId(null);
    }
  };

  const getUsageStats = () => {
    const totalTags = tags.length;
    const mostUsed = tags.length > 0 ? tags.reduce((max, tag) =>
      (tag.attributes.name || '').length > (max.attributes.name || '').length ? tag : max, tags[0]) : null;

    return { totalTags, mostUsed };
  };

  const stats = getUsageStats();

  if (loading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading tags...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Tags</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span>Tags</span>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tags Management</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Organize and manage your contact tags and categories
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  to={`/organizations/${orgId}/tags/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                  New Tag
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-4">
              <div className="flex items-center">
                <TagIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tags</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalTags}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-4">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{categories.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm p-4">
              <div className="flex items-center">
                <TagIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Used</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stats.mostUsed?.attributes.name || 'None'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Search & Filter
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search tags..."
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <div className="flex rounded shadow-sm">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-l border ${
                        viewMode === "grid"
                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-r border-t border-r border-b ${
                        viewMode === "list"
                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map((tag) => (
                <div key={tag.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getTagColorClass(tag.attributes.color)}`}>
                        {tag.attributes.name}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Link
                          to={nodeCtx?.buildDetailPath('tags', tag.id, 'edit') ?? `/organizations/${orgId}/tags/${tag.id}/edit`}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          disabled={deletingTagId === tag.id}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                        >
                          {deletingTagId === tag.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {tag.attributes.priority && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagPriorityClass(tag.attributes.priority)}`}>
                            {tag.attributes.priority}
                          </span>
                        </div>
                      )}

                      {tag.attributes.level != null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Level:</span>
                          <span className="text-gray-900 dark:text-gray-100">{tag.attributes.level}/5</span>
                        </div>
                      )}

                      {tag.attributes.category && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Category:</span>
                          <span className="text-gray-900 dark:text-gray-100">{tag.attributes.category}</span>
                        </div>
                      )}
                    </div>

                    {tag.attributes.description && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {tag.attributes.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tag
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getTagColorClass(tag.attributes.color)}`}>
                            {tag.attributes.name}
                          </span>
                        </div>
                        {tag.attributes.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {tag.attributes.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {tag.attributes.category || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tag.attributes.priority && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagPriorityClass(tag.attributes.priority)}`}>
                            {tag.attributes.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {tag.attributes.level != null ? `${tag.attributes.level}/5` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={nodeCtx?.buildDetailPath('tags', tag.id, 'edit') ?? `/organizations/${orgId}/tags/${tag.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            disabled={deletingTagId === tag.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingTagId === tag.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredTags.length === 0 && (
            <div className="text-center py-12">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No tags found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || selectedCategory !== "all" || selectedPriority !== "all"
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first tag."}
              </p>
              {(!searchTerm && selectedCategory === "all" && selectedPriority === "all") && (
                <div className="mt-6">
                  <Link
                    to={`/organizations/${orgId}/tags/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    New Tag
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import {
  PlusIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  TrashIcon,
  ArrowPathIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useUsers } from "~/hooks/useUsers";
import { useOptionalNodeContext } from "~/contexts/NodeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Users - CRM Dashboard" },
    { name: "description", content: "Manage organization users" },
  ];
};

type StatusFilter = 'all' | 'pending' | 'active';

export default function UsersIndex() {
  const { orgId } = useParams();
  const nodeCtx = useOptionalNodeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { users, loading, error, deleteUser, resendInvitation } = useUsers({
    search: searchQuery || undefined,
    filter: statusFilter !== 'all' ? { status: statusFilter } : undefined,
  });

  const getNodeLabel = (orgNodeId: string | null | undefined) => {
    if (!orgNodeId || !nodeCtx?.nodes?.length) return null;
    const node = nodeCtx.nodes.find(n => n.id === orgNodeId);
    if (!node) return null;
    return { id: node.id, levelName: node.attributes.level_name, name: node.attributes.name };
  };

  const handleDelete = async (id: string, email: string) => {
    if (window.confirm(`Remove ${email} from this organization?`)) {
      await deleteUser(id);
    }
  };

  const handleResendInvitation = async (id: string) => {
    await resendInvitation(id);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        Pending
      </span>
    );
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage users and their access to this organization
              </p>
            </div>
            <Link
              to={`/organizations/${orgId}/users/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Invite User
            </Link>
          </div>

          {/* Search/filter */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mb-8 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1 max-w-lg relative">
                <MagnifyingGlassIcon className="absolute inset-y-0 left-0 pl-3 h-5 w-5 text-gray-400 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search users..."
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
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users list */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-red-400" />
              <p className="mt-2 text-sm text-gray-500">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No users found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Invite your first user to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    to={`/organizations/${orgId}/users/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    Invite User
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    {nodeCtx?.hasStructure && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Organization Entity
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.attributes.first_name && user.attributes.last_name
                                ? `${user.attributes.first_name} ${user.attributes.last_name}`
                                : user.attributes.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.attributes.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.attributes.status)}
                      </td>
                      {nodeCtx?.hasStructure && (() => {
                        const nodeLabel = getNodeLabel(user.attributes.org_node_id);
                        return (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {nodeLabel ? (
                              <Link
                                to={`/organizations/${orgId}/nodes/${nodeLabel.id}`}
                                className="inline-flex items-center space-x-1.5 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                              >
                                <MapPinIcon className="h-3.5 w-3.5" />
                                <span>{nodeLabel.levelName}: {nodeLabel.name}</span>
                              </Link>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">Full Organization</span>
                            )}
                          </td>
                        );
                      })()}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.attributes.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {user.attributes.status === 'pending' && (
                            <button
                              onClick={() => handleResendInvitation(user.id)}
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                              title="Resend invitation"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id, user.attributes.email)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                            title="Remove user"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
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

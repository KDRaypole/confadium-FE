import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { BuildingOfficeIcon, PlusIcon, UsersIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Organizations - CRM Dashboard" },
    { name: "description", content: "Manage your organizations" },
  ];
};

interface Organization {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  dealsCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

const mockOrganizations: Organization[] = [
  {
    id: "acme-corp",
    name: "Acme Corporation",
    description: "Main corporate division handling enterprise clients",
    memberCount: 45,
    dealsCount: 23,
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: "startup-division",
    name: "Startup Division",
    description: "Focused on startup and SMB market segment",
    memberCount: 12,
    dealsCount: 8,
    status: "active",
    createdAt: "2024-02-01"
  },
  {
    id: "international",
    name: "International Operations",
    description: "Handles all international business operations",
    memberCount: 28,
    dealsCount: 15,
    status: "active",
    createdAt: "2024-01-20"
  }
];

export default function OrganizationsIndex() {
  return (
    <Layout showOrgNavigation={false}>
      <div className="py-6">
        <div className="w-full px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Organizations</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Select an organization to manage its CRM data
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                New Organization
              </button>
            </div>
          </div>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockOrganizations.map((org) => (
              <Link
                key={org.id}
                to={`/organizations/${org.id}`}
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {org.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{org.memberCount} members</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{org.dealsCount} deals</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    org.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {org.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(org.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
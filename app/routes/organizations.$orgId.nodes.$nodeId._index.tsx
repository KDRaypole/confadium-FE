import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { useNodeContext } from "~/contexts/NodeContext";
import {
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Node Home - Confadium" },
  ];
};

export default function NodeHome() {
  return (
    <Layout>
      <NodeHomeContent />
    </Layout>
  );
}

function NodeHomeContent() {
  const { orgId } = useParams();
  const { activeNode, activeLevel, childLevel, childNodes } = useNodeContext();

  if (!activeNode) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-gray-500">Node not found.</p>
      </div>
    );
  }

  const basePath = `/organizations/${orgId}/nodes/${activeNode.id}`;

  return (
    <div className="py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{activeLevel?.attributes.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeNode.attributes.name}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <QuickLink to={`${basePath}/contacts`} icon={UsersIcon} label="Contacts" color="blue" />
          <QuickLink to={`${basePath}/deals`} icon={CurrencyDollarIcon} label="Opportunities" color="green" />
          <QuickLink to={`${basePath}/forms`} icon={DocumentTextIcon} label="Forms" color="purple" />
          {childLevel && (
            <QuickLink
              to={`${basePath}/children`}
              icon={MapPinIcon}
              label={childLevel.attributes.plural}
              color="orange"
              count={childNodes.length}
            />
          )}
        </div>

        {childLevel && childNodes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {childLevel.attributes.plural}
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {childNodes.map(child => (
                <Link
                  key={child.id}
                  to={`/organizations/${orgId}/nodes/${child.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{child.attributes.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{childLevel.attributes.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickLink({
  to, icon: Icon, label, color, count,
}: {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
  count?: number;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };

  return (
    <Link
      to={to}
      className="flex items-center p-4 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {count !== undefined && <p className="text-xs text-gray-500">{count} total</p>}
      </div>
    </Link>
  );
}

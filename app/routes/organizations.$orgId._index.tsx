import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { organizationsAPI } from "~/lib/api/organizations";
import Layout from "~/components/layout/Layout";
import StatsCard from "~/components/dashboard/StatsCard";
import RecentActivity from "~/components/dashboard/RecentActivity";
import ContactsTable from "~/components/dashboard/ContactsTable";
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  PhoneIcon, 
  CalendarIcon 
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Home - CRM Dashboard" },
    { name: "description", content: "Organization dashboard overview" },
  ];
};

export default function OrganizationHome() {
  const { orgId } = useParams();

  const { data: org } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => organizationsAPI.getOrganizationById(orgId!),
    select: (data) => data.data,
    enabled: !!orgId,
  });

  const orgName = org?.attributes?.name || 'Organization';

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span>{orgName}</span>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Home</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Welcome back! Here's what's happening with {orgName} today.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Contacts"
              value="2,847"
              change="+12% from last month"
              changeType="increase"
              icon={<UsersIcon className="h-6 w-6" />}
            />
            <StatsCard
              title="Active Deals"
              value="$847,500"
              change="+8% from last month"
              changeType="increase"
              icon={<CurrencyDollarIcon className="h-6 w-6" />}
            />
            <StatsCard
              title="Calls Today"
              value="47"
              change="-2% from yesterday"
              changeType="decrease"
              icon={<PhoneIcon className="h-6 w-6" />}
            />
            <StatsCard
              title="Meetings This Week"
              value="23"
              change="+15% from last week"
              changeType="increase"
              icon={<CalendarIcon className="h-6 w-6" />}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Activity */}
            <div className="lg:col-span-1">
              <RecentActivity />
            </div>

            {/* Right Column - Contacts Table */}
            <div className="lg:col-span-2">
              <ContactsTable />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
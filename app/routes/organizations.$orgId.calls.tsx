import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/layout/Layout";
import { PlusIcon, MagnifyingGlassIcon, PhoneIcon, ClockIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Calls - CRM Dashboard" },
    { name: "description", content: "Manage your calls and call logs" },
  ];
};

interface Call {
  id: string;
  contactName: string;
  contactEmail: string;
  phoneNumber: string;
  duration: string;
  date: string;
  time: string;
  type: "incoming" | "outgoing" | "missed";
  status: "completed" | "scheduled" | "cancelled";
  notes?: string;
}

const mockCalls: Call[] = [
  {
    id: "1",
    contactName: "John Smith",
    contactEmail: "john@techcorp.com",
    phoneNumber: "+1 (555) 123-4567",
    duration: "15:30",
    date: "2024-01-15",
    time: "10:30 AM",
    type: "outgoing",
    status: "completed",
    notes: "Discussed Q1 proposal requirements"
  },
  {
    id: "2",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@innovation.com",
    phoneNumber: "+1 (555) 234-5678",
    duration: "08:45",
    date: "2024-01-15",
    time: "2:00 PM",
    type: "incoming",
    status: "completed",
    notes: "Follow-up on demo feedback"
  },
  {
    id: "3",
    contactName: "Michael Brown",
    contactEmail: "mike@startup.io",
    phoneNumber: "+1 (555) 345-6789",
    duration: "00:00",
    date: "2024-01-14",
    time: "4:30 PM",
    type: "outgoing",
    status: "cancelled",
    notes: "Rescheduled for next week"
  },
  {
    id: "4",
    contactName: "Emily Davis",
    contactEmail: "emily@bigcorp.com",
    phoneNumber: "+1 (555) 456-7890",
    duration: "",
    date: "2024-01-16",
    time: "11:00 AM",
    type: "outgoing",
    status: "scheduled"
  },
  {
    id: "5",
    contactName: "David Wilson",
    contactEmail: "david@smallbiz.com",
    phoneNumber: "+1 (555) 567-8901",
    duration: "00:00",
    date: "2024-01-14",
    time: "9:15 AM",
    type: "incoming",
    status: "cancelled"
  }
];

export default function Calls() {
  const getTypeIcon = (type: Call["type"]) => {
    switch (type) {
      case "incoming":
        return "↓";
      case "outgoing":
        return "↑";
      case "missed":
        return "✕";
      default:
        return "";
    }
  };

  const getTypeColor = (type: Call["type"]) => {
    switch (type) {
      case "incoming":
        return "text-green-600 dark:text-green-400";
      case "outgoing":
        return "text-blue-600 dark:text-blue-400";
      case "missed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: Call["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calls</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your calls and track communication history
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PhoneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Schedule Call
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search calls..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option>All Types</option>
                    <option>Incoming</option>
                    <option>Outgoing</option>
                    <option>Missed</option>
                  </select>
                  <select className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Scheduled</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Calls Table */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mockCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {call.contactName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {call.contactEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {call.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {new Date(call.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {call.time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm font-medium ${getTypeColor(call.type)}`}>
                          <span className="mr-2">{getTypeIcon(call.type)}</span>
                          {call.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {call.duration || call.status === "scheduled" ? (
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                            {call.duration || "Scheduled"}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(call.status)}`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-4">
                          Call
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
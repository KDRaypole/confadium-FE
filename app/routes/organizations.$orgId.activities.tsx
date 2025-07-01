import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/layout/Layout";
import { PlusIcon, CalendarIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Activities - CRM Dashboard" },
    { name: "description", content: "Track your sales activities" },
  ];
};

interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "task";
  title: string;
  description: string;
  contact: string;
  company: string;
  date: string;
  status: "completed" | "scheduled" | "overdue";
  duration?: number;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "call",
    title: "Discovery Call",
    description: "Discuss requirements and timeline for Q4 project",
    contact: "John Smith",
    company: "TechCorp Inc.",
    date: "2024-01-16T10:00:00",
    status: "scheduled",
    duration: 30
  },
  {
    id: "2",
    type: "email",
    title: "Follow-up Email",
    description: "Send proposal document and pricing information",
    contact: "Sarah Johnson",
    company: "Innovation Labs",
    date: "2024-01-15T14:30:00",
    status: "completed"
  },
  {
    id: "3",
    type: "meeting",
    title: "Product Demo",
    description: "Demonstrate key features and capabilities",
    contact: "Michael Brown",
    company: "StartupXYZ",
    date: "2024-01-17T15:00:00",
    status: "scheduled",
    duration: 60
  },
  {
    id: "4",
    type: "task",
    title: "Contract Review",
    description: "Review and finalize contract terms",
    contact: "Emily Davis",
    company: "BigCorp Enterprise",
    date: "2024-01-14T16:00:00",
    status: "overdue"
  },
  {
    id: "5",
    type: "call",
    title: "Check-in Call",
    description: "Weekly status update and next steps",
    contact: "David Wilson",
    company: "Small Business Co.",
    date: "2024-01-15T11:00:00",
    status: "completed",
    duration: 15
  }
];

export default function Activities() {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return <PhoneIcon className="h-5 w-5" />;
      case "email":
        return <EnvelopeIcon className="h-5 w-5" />;
      case "meeting":
        return <CalendarIcon className="h-5 w-5" />;
      case "task":
        return <span className="text-sm">📋</span>;
      default:
        return <span className="text-sm">📝</span>;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "email":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "meeting":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "task":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Activities</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Track all your sales activities and follow-ups
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Activity
              </button>
            </div>
          </div>

          {/* Activity Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Today's Activities
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        3
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PhoneIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Calls This Week
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        12
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Emails Sent
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        28
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">!</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Overdue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        1
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Recent Activities
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockActivities.map((activity) => {
                const { date, time } = formatDate(activity.date);
                return (
                  <div key={activity.id} className="px-6 py-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start space-x-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                          <div className="flex items-center">
                            <span className="font-medium">{activity.contact}</span>
                            <span className="mx-1">•</span>
                            <span>{activity.company}</span>
                          </div>
                          <div className="flex items-center">
                            <span>{date}</span>
                            <span className="mx-1">•</span>
                            <span>{time}</span>
                            {activity.duration && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{activity.duration} min</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
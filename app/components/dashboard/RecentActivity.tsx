interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "deal";
  description: string;
  contact: string;
  timestamp: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "call",
    description: "Called about Q4 pricing",
    contact: "John Smith",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    type: "email",
    description: "Sent proposal document",
    contact: "Sarah Johnson",
    timestamp: "4 hours ago"
  },
  {
    id: "3",
    type: "meeting",
    description: "Demo scheduled",
    contact: "Michael Brown",
    timestamp: "1 day ago"
  },
  {
    id: "4",
    type: "deal",
    description: "Deal moved to negotiation",
    contact: "Emily Davis",
    timestamp: "2 days ago"
  }
];

export default function RecentActivity() {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return "📞";
      case "email":
        return "📧";
      case "meeting":
        return "🗓️";
      case "deal":
        return "💼";
      default:
        return "📝";
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return "bg-brand-primary/10 text-brand-primary";
      case "email":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "meeting":
        return "bg-brand-accent/10 text-brand-accent";
      case "deal":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
          Recent Activity
        </h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                <span className="mr-1">{getActivityIcon(activity.type)}</span>
                {activity.type}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.contact}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
              </div>
              <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                {activity.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm">
          <a href="/activities" className="font-medium text-brand-primary hover:text-brand-primary-hover">
            View all activity →
          </a>
        </div>
      </div>
    </div>
  );
}
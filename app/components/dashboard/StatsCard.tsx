interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ReactNode;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon 
}: StatsCardProps) {
  const changeColorClass = {
    increase: "text-green-600 dark:text-green-400",
    decrease: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400"
  }[changeType];

  const changeIcon = {
    increase: "↗",
    decrease: "↘",
    neutral: "→"
  }[changeType];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          {icon && (
            <div className="h-5 w-5 text-blue-500 dark:text-blue-400">
              {icon}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {change && (
            <p className={`text-sm ml-3 ${changeColorClass} flex items-center`}>
              <span className="mr-1">{changeIcon}</span>
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
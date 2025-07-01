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
    increase: "text-green-600",
    decrease: "text-red-600",
    neutral: "text-gray-600"
  }[changeType];

  const changeIcon = {
    increase: "↗",
    decrease: "↘",
    neutral: "→"
  }[changeType];

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            {title}
          </h3>
          {icon && (
            <div className="h-5 w-5 text-blue-500">
              {icon}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900">
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
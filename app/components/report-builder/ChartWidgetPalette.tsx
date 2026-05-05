import { useReportBuilder } from "./ReportBuilderContext";
import type { WidgetType } from "~/lib/api/reports";
import {
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  HashtagIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const WIDGET_TYPES: {
  type: WidgetType;
  label: string;
  description: string;
  icon: typeof ChartBarIcon;
}[] = [
  {
    type: "metric",
    label: "Metric Card",
    description: "Single value with optional comparison",
    icon: HashtagIcon,
  },
  {
    type: "bar",
    label: "Bar Chart",
    description: "Compare values across categories",
    icon: ChartBarIcon,
  },
  {
    type: "pie",
    label: "Pie Chart",
    description: "Show proportions of a whole",
    icon: ChartPieIcon,
  },
  {
    type: "line",
    label: "Line Chart",
    description: "Track trends over time",
    icon: PresentationChartLineIcon,
  },
  {
    type: "area",
    label: "Area Chart",
    description: "Visualize cumulative trends",
    icon: Squares2X2Icon,
  },
  {
    type: "table",
    label: "Data Table",
    description: "Display raw data in a grid",
    icon: TableCellsIcon,
  },
];

export default function ChartWidgetPalette() {
  const { addWidget, entity } = useReportBuilder();

  if (!entity) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          Add Visualization
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Drag or click to add a chart widget to your dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {WIDGET_TYPES.map(({ type, label, description, icon: Icon }) => (
          <button
            key={type}
            onClick={() => addWidget(type)}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-primary hover:shadow-sm transition-all group text-left"
          >
            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2 group-hover:bg-brand-primary/10 transition-colors">
              <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-brand-primary" />
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {label}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-0.5 leading-tight">
              {description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact version for toolbar
export function ChartWidgetToolbar() {
  const { addWidget, entity } = useReportBuilder();

  if (!entity) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {WIDGET_TYPES.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => addWidget(type)}
          title={`Add ${label}`}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

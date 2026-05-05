import { useReportBuilder } from "./ReportBuilderContext";
import SimpleSelect from "~/components/ui/SimpleSelect";
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const ENTITY_CONFIG = {
  contacts: {
    label: "Contacts",
    description: "Track contact creation, status changes, and engagement",
    icon: UserGroupIcon,
  },
  deals: {
    label: "Deals",
    description: "Analyze deal pipeline, values, and win rates",
    icon: CurrencyDollarIcon,
  },
  activities: {
    label: "Activities",
    description: "Monitor activity volume, types, and completion rates",
    icon: ClipboardDocumentListIcon,
  },
};

export default function EntitySelector() {
  const { entity, setEntity, schema } = useReportBuilder();

  const entities = schema?.entities || [];

  // Card-based selection for new reports
  if (!entity) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select Data Source
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose which entity you want to create a report for
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entities.map((e) => {
            const config = ENTITY_CONFIG[e.name as keyof typeof ENTITY_CONFIG];
            const Icon = config?.icon || ClipboardDocumentListIcon;

            return (
              <button
                key={e.name}
                onClick={() => setEntity(e.name)}
                className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-primary hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-brand-primary" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {config?.label || e.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {config?.description || `Report on ${e.name}`}
                </p>
                <span className="text-xs text-brand-primary mt-2">
                  {e.attributes.length} attributes available
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact dropdown for editing existing reports
  const options = entities.map((e) => ({
    value: e.name,
    label: ENTITY_CONFIG[e.name as keyof typeof ENTITY_CONFIG]?.label || e.name,
  }));

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Data Source:
      </label>
      <SimpleSelect
        options={options}
        value={entity}
        onChange={setEntity}
        placeholder="Select entity..."
        className="w-48"
        size="sm"
      />
    </div>
  );
}

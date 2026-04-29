import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { useModules } from "~/hooks/useModules";
import { useNodeContext } from "~/contexts/NodeContext";
import type { ModuleCategory } from "~/lib/api/types";
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon,
  BellIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Module - CRM Dashboard" },
    { name: "description", content: "Create a new automation module" },
  ];
};

const CATEGORIES: { value: ModuleCategory; label: string; description: string }[] = [
  { value: "automation", label: "Automation", description: "Automate repetitive tasks and processes" },
  { value: "integration", label: "Integration", description: "Connect with external services and APIs" },
  { value: "notification", label: "Notification", description: "Send alerts and notifications to users" },
  { value: "workflow", label: "Workflow", description: "Define multi-step business workflows" },
];

const ICONS = [
  { value: "cog", label: "Cog", Icon: CogIcon },
  { value: "bell", label: "Bell", Icon: BellIcon },
  { value: "user-plus", label: "User Plus", Icon: UserPlusIcon },
  { value: "envelope", label: "Envelope", Icon: EnvelopeIcon },
  { value: "phone", label: "Phone", Icon: PhoneIcon },
  { value: "calendar", label: "Calendar", Icon: CalendarIcon },
  { value: "chart", label: "Chart", Icon: ChartBarIcon },
  { value: "shield", label: "Shield", Icon: ShieldCheckIcon },
  { value: "globe", label: "Globe", Icon: GlobeAltIcon },
];

interface ModuleFormData {
  name: string;
  description: string;
  category: ModuleCategory;
  icon: string;
  trigger_types: string[];
}

interface FormErrors {
  name?: string;
  category?: string;
}

const COMMON_TRIGGER_TYPES = [
  "contact.created",
  "contact.updated",
  "deal.created",
  "deal.stage_changed",
  "deal.won",
  "deal.lost",
  "form.submitted",
  "email.opened",
  "email.clicked",
  "call.completed",
  "task.completed",
  "tag.added",
  "tag.removed",
];

export default function CreateModule() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { buildListPath } = useNodeContext();
  const { createModule } = useModules();

  const [formData, setFormData] = useState<ModuleFormData>({
    name: "",
    description: "",
    category: "automation",
    icon: "cog",
    trigger_types: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [customTrigger, setCustomTrigger] = useState("");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Module name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Module name must be at least 2 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (activate = false) => {
    if (!validate()) return;

    setSaving(true);
    try {
      const result = await createModule({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        icon: formData.icon,
        trigger_types: formData.trigger_types,
      });

      if (result?.data) {
        navigate(`/organizations/${orgId}/modules/${result.data.id}`);
      }
    } catch (err) {
      console.error("Failed to create module:", err);
      alert("Failed to create module. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(buildListPath('modules'));
  };

  const updateField = <K extends keyof ModuleFormData>(field: K, value: ModuleFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleTrigger = (trigger: string) => {
    setFormData((prev) => ({
      ...prev,
      trigger_types: prev.trigger_types.includes(trigger)
        ? prev.trigger_types.filter((t) => t !== trigger)
        : [...prev.trigger_types, trigger],
    }));
  };

  const addCustomTrigger = () => {
    const trimmed = customTrigger.trim();
    if (trimmed && !formData.trigger_types.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        trigger_types: [...prev.trigger_types, trimmed],
      }));
      setCustomTrigger("");
    }
  };

  const getCategoryColor = (category: ModuleCategory) => {
    switch (category) {
      case "automation":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "integration":
        return "border-purple-500 bg-purple-50 dark:bg-purple-900/20";
      case "notification":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "workflow":
        return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={buildListPath('modules')} className="hover:text-gray-700 dark:hover:text-gray-200">
                Modules
              </Link>
              <span>/</span>
              <span>Create New Module</span>
            </nav>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to={buildListPath('modules')}
                  className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Modules
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Module</h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Define a new automation module with triggers and configuration
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                      Saving...
                    </>
                  ) : (
                    "Save as Inactive"
                  )}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                      Create & Activate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Module Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <CogIcon className="h-5 w-5 mr-2" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Module Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.name ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="e.g., Welcome Email Automation"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Describe what this module does..."
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Category *</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => updateField("category", cat.value)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.category === cat.value
                            ? getCategoryColor(cat.value)
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.description}</p>
                      </button>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Icon</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {ICONS.map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateField("icon", value)}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                          formData.icon === value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trigger Types */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Trigger Types</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select which events this module can respond to
                  </p>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_TRIGGER_TYPES.map((trigger) => (
                      <button
                        key={trigger}
                        type="button"
                        onClick={() => toggleTrigger(trigger)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          formData.trigger_types.includes(trigger)
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {trigger}
                      </button>
                    ))}
                  </div>

                  {/* Custom trigger input */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customTrigger}
                      onChange={(e) => setCustomTrigger(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomTrigger();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Add a custom trigger type..."
                    />
                    <button
                      type="button"
                      onClick={addCustomTrigger}
                      disabled={!customTrigger.trim()}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 sticky top-6">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Module Preview</h3>
                </div>
                <div className="p-6">
                  {/* Preview Card */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="inline-flex p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                        {(() => {
                          const iconDef = ICONS.find((i) => i.value === formData.icon);
                          const IconComponent = iconDef?.Icon || CogIcon;
                          return <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-300" />;
                        })()}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        inactive
                      </span>
                    </div>

                    <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {formData.name || "Module Name"}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {formData.description || "No description provided"}
                    </p>

                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          formData.category === "automation"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : formData.category === "integration"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : formData.category === "notification"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {formData.category}
                      </span>
                    </div>

                    {formData.trigger_types.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {formData.trigger_types.slice(0, 3).map((trigger) => (
                          <span
                            key={trigger}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {trigger}
                          </span>
                        ))}
                        {formData.trigger_types.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            +{formData.trigger_types.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Summary</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">Name:</dt>
                        <dd className="text-gray-900 dark:text-gray-100 font-medium truncate ml-2">
                          {formData.name || "\u2014"}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">Category:</dt>
                        <dd className="text-gray-900 dark:text-gray-100 capitalize">{formData.category}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">Icon:</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{formData.icon}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">Triggers:</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{formData.trigger_types.length} selected</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

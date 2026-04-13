import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import Layout from "~/components/layout/Layout";
import { tagColors, tagPriorities, getTagColorClass, getTagPriorityClass } from "~/components/tags/TagsData";
import SimpleSelect from "~/components/ui/SimpleSelect";
import { useTag } from "~/hooks/useTags";
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  EyeIcon,
  SwatchIcon,
  ExclamationTriangleIcon,
  StarIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Tag - CRM Dashboard" },
    { name: "description", content: "Edit tag properties and settings" },
  ];
};

interface EditableTag {
  name: string;
  color: string;
  priority: "low" | "medium" | "high" | "critical";
  level: number;
  description: string;
  category: string;
}

export default function EditTag() {
  const params = useParams();
  const navigate = useNavigate();
  const { orgId, tagId } = params;
  const { tag: originalTag, loading, error: tagError, updateTag: updateTagAPI } = useTag(tagId!);
  
  const [tagData, setTagData] = useState<EditableTag>({
    name: "",
    color: "blue",
    priority: "medium",
    level: 3,
    description: "",
    category: ""
  });

  const [showPreview, setShowPreview] = useState(true);
  const [errors, setErrors] = useState<Partial<EditableTag>>({});
  const [saving, setSaving] = useState(false);

  const categories = [
    "Customer Type",
    "Priority",
    "Role",
    "Status",
    "Characteristics",
    "Source",
    "Industry",
    "Size",
    "Other"
  ];

  // Load existing tag data when tag is loaded
  useEffect(() => {
    if (originalTag) {
      setTagData({
        name: originalTag.attributes.name,
        color: originalTag.attributes.color || "blue",
        priority: (originalTag.attributes.priority as EditableTag["priority"]) || "medium",
        level: originalTag.attributes.level || 3,
        description: originalTag.attributes.description || "",
        category: originalTag.attributes.category || ""
      });
    }
  }, [originalTag]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EditableTag> = {};
    
    if (!tagData.name.trim()) {
      newErrors.name = "Tag name is required";
    } else if (tagData.name.length < 2) {
      newErrors.name = "Tag name must be at least 2 characters";
    } else if (tagData.name.length > 50) {
      newErrors.name = "Tag name must be less than 50 characters";
    }

    if (tagData.description && tagData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    if (tagData.level < 1 || tagData.level > 5) {
      newErrors.level = "Level must be between 1 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !originalTag) {
      return;
    }
    
    setSaving(true);
    try {
      const updatedTag = await updateTagAPI(tagData);
      if (updatedTag) {
        console.log("Tag updated successfully:", updatedTag);
        // Navigate back to tags list
        navigate(`/organizations/${orgId}/tags`);
      } else {
        alert("Failed to update tag. Please try again.");
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      alert("Failed to update tag. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/organizations/${orgId}/tags`);
  };

  const updateField = <K extends keyof EditableTag>(field: K, value: EditableTag[K]) => {
    setTagData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getLevelDescription = (level: number): string => {
    switch (level) {
      case 1: return "Minimal importance";
      case 2: return "Low importance";
      case 3: return "Medium importance";
      case 4: return "High importance";
      case 5: return "Critical importance";
      default: return "";
    }
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < level
            ? "text-yellow-400 fill-current"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading tag...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (tagError) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Loading Tag</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tagError}</p>
              <Link
                to={`/organizations/${orgId}/tags`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Tags
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!originalTag) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tag Not Found</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                The tag you're looking for doesn't exist or has been deleted.
              </p>
              <Link
                to={`/organizations/${orgId}/tags`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Tags
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={`/organizations/${orgId}/tags`} className="hover:text-gray-700 dark:hover:text-gray-200">
                Tags
              </Link>
              <span>/</span>
              <span>Edit "{originalTag.attributes.name}"</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to={`/organizations/${orgId}/tags`}
                  className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Tags
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Tag
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Modify tag properties and appearance settings
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <EyeIcon className="-ml-1 mr-2 h-4 w-4" />
                  {showPreview ? "Hide" : "Show"} Preview
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Tag Configuration */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tag Name *
                    </label>
                    <input
                      type="text"
                      value={tagData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter tag name"
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
                      value={tagData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Describe what this tag represents (optional)"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {tagData.description.length}/200 characters
                    </p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <SimpleSelect
                      options={[
                        { value: "", label: "Select a category (optional)" },
                        ...categories.map(category => ({
                          value: category,
                          label: category
                        }))
                      ]}
                      value={tagData.category}
                      onChange={(value) => updateField('category', value)}
                    />
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <SwatchIcon className="h-5 w-5 mr-2" />
                    Appearance
                  </h3>
                </div>
                <div className="p-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Color
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {tagColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => updateField('color', color.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            tagData.color === color.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full ${color.class.split(' ')[0]} border`} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{color.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority & Level */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Priority & Level
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {tagPriorities.map((priority) => (
                        <button
                          key={priority.value}
                          onClick={() => updateField('priority', priority.value as any)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            tagData.priority === priority.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                        >
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priority.class}`}>
                            {priority.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Importance Level: {tagData.level}/5
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(tagData.level)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {getLevelDescription(tagData.level)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={tagData.level}
                      onChange={(e) => updateField('level', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                    {errors.level && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.level}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tag Metadata */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Tag Information
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">Created:</dt>
                      <dd className="text-gray-900 dark:text-gray-100">
                        {new Date(originalTag.attributes.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-gray-500 dark:text-gray-400">Tag ID:</dt>
                      <dd className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                        {originalTag.id}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            {showPreview && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Live Preview</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Tag Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tag Appearance</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Small size:</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColorClass(tagData.color)}`}>
                            {tagData.name || "Tag Name"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Medium size:</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getTagColorClass(tagData.color)}`}>
                            {tagData.name || "Tag Name"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Priority Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Priority Badge</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagPriorityClass(tagData.priority)}`}>
                        {tagData.priority}
                      </span>
                    </div>

                    {/* Level Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Importance Level</h4>
                      <div className="flex items-center space-x-2">
                        {renderStars(tagData.level)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {tagData.level}/5
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getLevelDescription(tagData.level)}
                      </p>
                    </div>

                    {/* Before/After Comparison */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Changes Preview</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Before:</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getTagColorClass(originalTag.attributes.color)}`}>
                            {originalTag.attributes.name}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">After:</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getTagColorClass(tagData.color)}`}>
                            {tagData.name || "Tag Name"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Updated Tag Summary</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-500 dark:text-gray-400">Name:</dt>
                          <dd className="text-gray-900 dark:text-gray-100 font-medium">
                            {tagData.name || "—"}
                          </dd>
                        </div>
                        {tagData.category && (
                          <div className="flex justify-between text-sm">
                            <dt className="text-gray-500 dark:text-gray-400">Category:</dt>
                            <dd className="text-gray-900 dark:text-gray-100">{tagData.category}</dd>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-500 dark:text-gray-400">Priority:</dt>
                          <dd className="text-gray-900 dark:text-gray-100 capitalize">{tagData.priority}</dd>
                        </div>
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-500 dark:text-gray-400">Level:</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{tagData.level}/5</dd>
                        </div>
                      </dl>
                      {tagData.description && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{tagData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
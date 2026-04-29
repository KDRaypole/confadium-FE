import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState } from "react";
import SimpleSelect from "~/components/ui/SimpleSelect";
import { useActivity } from "~/hooks/useActivities";
import { useNodeContext } from "~/contexts/NodeContext";
import type { ActivityAttributes } from "~/lib/api/types";
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  ClockIcon,
  UserIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Activity Details - CRM Dashboard" },
    { name: "description", content: "View and edit activity details" },
  ];
};

const kindIcons: Record<string, React.ReactNode> = {
  call: <PhoneIcon className="h-6 w-6" />,
  email: <EnvelopeIcon className="h-6 w-6" />,
  meeting: <CalendarIcon className="h-6 w-6" />,
  task: <ClipboardDocumentListIcon className="h-6 w-6" />,
  note: <PencilSquareIcon className="h-6 w-6" />,
};

const kindColors: Record<string, string> = {
  call: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  email: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  meeting: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  task: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  note: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

function getActivityStatus(attrs: ActivityAttributes): { label: string; color: string } {
  if (attrs.completed_at) {
    return { label: "completed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
  }
  if (attrs.due_at && new Date(attrs.due_at) < new Date()) {
    return { label: "overdue", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  }
  return { label: "scheduled", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
}

export default function ActivityShow() {
  const { orgId, activityId } = useParams();
  const navigate = useNavigate();
  const { buildListPath, buildDetailPath } = useNodeContext();
  const { activity, contact, deal, loading, updateActivity, deleteActivity } = useActivity(activityId);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ActivityAttributes>>({});
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    if (activity?.attributes) {
      setEditData({ ...activity.attributes });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateActivity(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update activity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity();
        navigate(buildListPath('activities'));
      } catch (error) {
        console.error('Failed to delete activity:', error);
      }
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateActivity({ completed_at: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to mark complete:', error);
    }
  };

  const updateField = (field: keyof ActivityAttributes, value: string | null) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Activity not found.</p>
            <Link to={buildListPath('activities')} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Activities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const attrs = activity.attributes;
  const displayAttrs = isEditing ? editData : attrs;
  const status = attrs ? getActivityStatus(attrs) : null;

  return (
    <div className="py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to={buildListPath('activities')} className="hover:text-gray-700 dark:hover:text-gray-200">
              Activities
            </Link>
            <span>/</span>
            <span>{attrs?.subject}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={buildListPath('activities')}
                className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Link>
              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${kindColors[attrs?.kind || ''] || kindColors.note}`}>
                  {kindIcons[attrs?.kind || ''] || kindIcons.note}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{attrs?.subject}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${kindColors[attrs?.kind || ''] || kindColors.note}`}>
                      {attrs?.kind}
                    </span>
                    {status && (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button onClick={handleCancel} className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                    <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  {!attrs?.completed_at && (
                    <button onClick={handleMarkComplete} className="inline-flex items-center px-4 py-2 border border-green-300 dark:border-green-600 text-sm font-medium rounded-md shadow-sm text-green-700 dark:text-green-200 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20">
                      <CheckCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                      Mark Complete
                    </button>
                  )}
                  <button onClick={handleDelete} className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md shadow-sm text-red-700 dark:text-red-200 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
                    Delete
                  </button>
                  <button onClick={handleEdit} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Details */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Activity Details</h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {/* Kind */}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                    {isEditing ? (
                      <div className="mt-1">
                        <SimpleSelect
                          options={[
                            { value: "call", label: "Call" },
                            { value: "email", label: "Email" },
                            { value: "meeting", label: "Meeting" },
                            { value: "task", label: "Task" },
                            { value: "note", label: "Note" },
                          ]}
                          value={(displayAttrs?.kind as string) || 'call'}
                          onChange={(v) => updateField('kind', v)}
                          size="sm"
                        />
                      </div>
                    ) : (
                      <dd className="mt-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${kindColors[attrs?.kind || ''] || kindColors.note}`}>
                          {attrs?.kind}
                        </span>
                      </dd>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</dt>
                    {isEditing ? (
                      <input
                        type="text"
                        value={(displayAttrs?.subject as string) || ''}
                        onChange={(e) => updateField('subject', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{attrs?.subject}</dd>
                    )}
                  </div>

                  {/* Due At */}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</dt>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={(displayAttrs?.due_at as string)?.slice(0, 16) || ''}
                        onChange={(e) => updateField('due_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDateTime(attrs?.due_at)}</dd>
                    )}
                  </div>

                  {/* Completed At */}
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</dt>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={(displayAttrs?.completed_at as string)?.slice(0, 16) || ''}
                        onChange={(e) => updateField('completed_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {attrs?.completed_at ? (
                          <span className="text-green-600 dark:text-green-400">{formatDateTime(attrs.completed_at)}</span>
                        ) : (
                          'Not completed'
                        )}
                      </dd>
                    )}
                  </div>
                </dl>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Description
                </h3>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={(displayAttrs?.body as string) || ''}
                    onChange={(e) => updateField('body', e.target.value || null)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {attrs?.body || 'No description provided.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Related Contact */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Contact
                </h3>
              </div>
              <div className="p-6">
                {contact ? (
                  <div>
                    <Link
                      to={buildDetailPath('contacts', contact.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {`${contact.attributes?.first_name || ''} ${contact.attributes?.last_name || ''}`.trim()}
                    </Link>
                    {contact.attributes?.company && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{contact.attributes.company}</p>
                    )}
                    {contact.attributes?.email && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{contact.attributes.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No contact linked</p>
                )}
              </div>
            </div>

            {/* Related Deal */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Deal
                </h3>
              </div>
              <div className="p-6">
                {deal ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{deal.attributes?.name}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      {deal.attributes?.stage && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {deal.attributes.stage}
                        </span>
                      )}
                      {deal.attributes?.value != null && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.attributes.value)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No deal linked</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Timeline
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(attrs?.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(attrs?.updated_at)}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

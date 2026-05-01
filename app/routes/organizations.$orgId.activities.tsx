import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, Outlet, useLocation } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import SimpleSelect from "~/components/ui/SimpleSelect";
import { useActivities } from "~/hooks/useActivities";
import { useContacts } from "~/hooks/useContacts";
import { useOptionalNodeContext } from "~/contexts/NodeContext";
import type { ActivityAttributes } from "~/lib/api/types";
import {
  PlusIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Activities - Confadium" },
    { name: "description", content: "Track your sales activities" },
  ];
};

const kindIcons: Record<string, React.ReactNode> = {
  call: <PhoneIcon className="h-5 w-5" />,
  email: <EnvelopeIcon className="h-5 w-5" />,
  meeting: <CalendarIcon className="h-5 w-5" />,
  task: <ClipboardDocumentListIcon className="h-5 w-5" />,
  note: <PencilSquareIcon className="h-5 w-5" />,
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

const emptyForm: Partial<ActivityAttributes> & { contact_id?: string; deal_id?: string } = {
  kind: 'call',
  subject: '',
  body: '',
  due_at: '',
  contact_id: '',
  deal_id: '',
};

export default function Activities() {
  const { orgId } = useParams();
  const location = useLocation();
  const nodeCtx = useOptionalNodeContext();
  const { activities, loading, createActivity } = useActivities();
  const { contacts } = useContacts();

  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const filteredActivities = activities.filter((activity) => {
    const attrs = activity.attributes;
    if (!attrs) return false;

    if (kindFilter !== 'all' && attrs.kind !== kindFilter) return false;

    if (statusFilter !== 'all') {
      const status = getActivityStatus(attrs);
      if (status.label !== statusFilter) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable = [attrs.subject, attrs.body].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });

  // Summary counts
  const completedCount = activities.filter(a => a.attributes?.completed_at).length;
  const overdueCount = activities.filter(a => {
    const attrs = a.attributes;
    return attrs && !attrs.completed_at && attrs.due_at && new Date(attrs.due_at) < new Date();
  }).length;
  const scheduledCount = activities.length - completedCount - overdueCount;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.kind) errors.kind = 'Kind is required';
    if (!formData.subject?.trim()) errors.subject = 'Subject is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        kind: formData.kind,
        subject: formData.subject,
        body: formData.body || null,
        due_at: formData.due_at || null,
      };
      if (formData.contact_id) payload.contact_id = formData.contact_id;
      if (formData.deal_id) payload.deal_id = formData.deal_id;

      await createActivity(payload as Partial<ActivityAttributes> & { contact_id?: string; deal_id?: string });
      setIsCreateModalOpen(false);
      setFormData({ ...emptyForm });
      setFormErrors({});
    } catch (error) {
      console.error('Failed to create activity:', error);
    } finally {
      setCreating(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOnDetailPage = location.pathname.match(/\/activities\/[^/]+$/);

  return (
    <Layout>
      <Outlet />
      {!isOnDetailPage && (
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
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Activity
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><CalendarIcon className="h-8 w-8 text-blue-600" /></div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{activities.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><ClockIcon className="h-8 w-8 text-blue-500" /></div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Scheduled</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{scheduledCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><CheckCircleIcon className="h-8 w-8 text-green-600" /></div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{completedCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><ExclamationCircleIcon className="h-8 w-8 text-red-600" /></div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Overdue</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{overdueCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm mb-6">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      placeholder="Search activities..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <SimpleSelect
                    options={[
                      { value: "all", label: "All Types" },
                      { value: "call", label: "Call" },
                      { value: "email", label: "Email" },
                      { value: "meeting", label: "Meeting" },
                      { value: "task", label: "Task" },
                      { value: "note", label: "Note" },
                    ]}
                    value={kindFilter}
                    onChange={(value) => setKindFilter(value)}
                  />
                  <SimpleSelect
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "completed", label: "Completed" },
                      { value: "overdue", label: "Overdue" },
                    ]}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Activities ({filteredActivities.length})
              </h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {activities.length === 0 ? 'No activities yet. Log your first activity.' : 'No activities match your filters.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredActivities.map((activity) => {
                  const attrs = activity.attributes!;
                  const status = getActivityStatus(attrs);
                  return (
                    <Link
                      key={activity.id}
                      to={nodeCtx?.buildDetailPath('activities', activity.id) ?? `/organizations/${orgId}/activities/${activity.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${kindColors[attrs.kind] || kindColors.note}`}>
                          {kindIcons[attrs.kind] || kindIcons.note}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {attrs.subject}
                            </p>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                          </div>
                          {attrs.body && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                              {attrs.body}
                            </p>
                          )}
                          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${kindColors[attrs.kind] || kindColors.note}`}>
                              {attrs.kind}
                            </span>
                            {attrs.due_at && (
                              <span>Due: {formatDate(attrs.due_at)}</span>
                            )}
                            {attrs.completed_at && (
                              <span className="text-green-600 dark:text-green-400">Completed: {formatDate(attrs.completed_at)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Create Activity Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">New Activity</h3>
                <button onClick={() => { setIsCreateModalOpen(false); setFormData({ ...emptyForm }); setFormErrors({}); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                    <SimpleSelect
                      options={[
                        { value: "call", label: "Call" },
                        { value: "email", label: "Email" },
                        { value: "meeting", label: "Meeting" },
                        { value: "task", label: "Task" },
                        { value: "note", label: "Note" },
                      ]}
                      value={formData.kind || 'call'}
                      onChange={(value) => updateForm('kind', value)}
                      size="sm"
                    />
                    {formErrors.kind && <p className="mt-1 text-xs text-red-600">{formErrors.kind}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                    <input
                      type="datetime-local"
                      value={formData.due_at || ''}
                      onChange={(e) => updateForm('due_at', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={formData.subject || ''}
                    onChange={(e) => updateForm('subject', e.target.value)}
                    className={`w-full px-3 py-2 border ${formErrors.subject ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    autoFocus
                  />
                  {formErrors.subject && <p className="mt-1 text-xs text-red-600">{formErrors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={formData.body || ''}
                    onChange={(e) => updateForm('body', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</label>
                  <SimpleSelect
                    options={[
                      { value: "", label: "None" },
                      ...contacts.map(c => ({
                        value: c.id,
                        label: `${c.attributes?.first_name || ''} ${c.attributes?.last_name || ''}`.trim(),
                      })),
                    ]}
                    value={formData.contact_id || ''}
                    onChange={(value) => updateForm('contact_id', value)}
                    size="sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsCreateModalOpen(false); setFormData({ ...emptyForm }); setFormErrors({}); }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Activity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, useNavigate } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import SimpleSelect from "~/components/ui/SimpleSelect";
import { useContact } from "~/hooks/useContacts";
import { useTags } from "~/hooks/useTags";
import { useNodeContext } from "~/contexts/NodeContext";
import { getTagColorClass } from "~/components/tags/TagsData";
import type { ContactAttributes } from "~/lib/api/types";
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BanknotesIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  CurrencyDollarIcon,
  BoltIcon,
  TagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Contact Details - Confadium" },
    { name: "description", content: "View and edit contact information" },
  ];
};

const statusColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  prospect: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  customer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  churned: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function ContactShow() {
  const { orgId, contactId } = useParams();
  const navigate = useNavigate();
  const { buildListPath } = useNodeContext();
  const { contact, deals, activities, contactTags, loading, updateContact, deleteContact, addTag, removeTag } = useContact(contactId);
  const { tags: allTags } = useTags();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ContactAttributes>>({});
  const [saving, setSaving] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    if (contact?.attributes) {
      setEditData({ ...contact.attributes });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContact(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      try {
        await deleteContact();
        navigate(buildListPath('contacts'));
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const updateField = (field: keyof ContactAttributes, value: string | null) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Close tag dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const assignedTagIds = new Set(contactTags.map(ct => ct.tagId));
  const availableTags = allTags
    .filter(t => !assignedTagIds.has(t.id))
    .filter(t => {
      if (!tagSearch) return true;
      return t.attributes?.name?.toLowerCase().includes(tagSearch.toLowerCase());
    });

  const handleAddTag = async (tagId: string) => {
    try {
      await addTag(tagId);
      setTagSearch('');
      setShowTagDropdown(false);
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleRemoveTag = async (taggingId: string) => {
    try {
      await removeTag(taggingId);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
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

  if (!contact) {
    return (
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Contact not found.</p>
            <Link to={buildListPath('contacts')} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Contacts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const attrs = contact.attributes;
  const displayAttrs = isEditing ? editData : attrs;

  const renderField = (
    label: string,
    field: keyof ContactAttributes,
    type: "text" | "email" | "tel" | "select" | "textarea" = "text",
    options?: { value: string; label: string }[]
  ) => {
    const value = displayAttrs?.[field] as string | null | undefined;

    if (!isEditing) {
      return (
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value || 'Not specified'}</dd>
        </div>
      );
    }

    if (type === "select" && options) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
          <SimpleSelect
            options={options}
            value={(value as string) || ''}
            onChange={(v) => updateField(field, v || null)}
            size="sm"
          />
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
          <textarea
            rows={4}
            value={(value as string) || ''}
            onChange={(e) => updateField(field, e.target.value || null)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input
          type={type}
          value={(value as string) || ''}
          onChange={(e) => updateField(field, e.target.value || null)}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to={buildListPath('contacts')} className="hover:text-gray-700 dark:hover:text-gray-200">
              Contacts
            </Link>
            <span>/</span>
            <span>{`${attrs?.first_name || ''} ${attrs?.last_name || ''}`.trim()}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={buildListPath('contacts')}
                className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {`${attrs?.first_name || ''} ${attrs?.last_name || ''}`.trim()}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  {attrs?.title && attrs?.company && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{attrs.title} at {attrs.company}</span>
                  )}
                  {attrs?.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[attrs.status] || ''}`}>
                      {attrs.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md shadow-sm text-red-700 dark:text-red-200 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                    Edit Contact
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {renderField("First Name", "first_name")}
                  {renderField("Last Name", "last_name")}
                  {renderField("Email Address", "email", "email")}
                  {renderField("Phone Number", "phone", "tel")}
                  {renderField("Title", "title")}
                  {renderField("Company", "company")}
                  {renderField("Status", "status", "select", [
                    { value: "lead", label: "Lead" },
                    { value: "prospect", label: "Prospect" },
                    { value: "customer", label: "Customer" },
                    { value: "churned", label: "Churned" },
                  ])}
                  {renderField("Source", "source", "select", [
                    { value: "", label: "None" },
                    { value: "website", label: "Website" },
                    { value: "referral", label: "Referral" },
                    { value: "social", label: "Social Media" },
                    { value: "event", label: "Event" },
                    { value: "other", label: "Other" },
                  ])}
                </dl>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Notes
                </h3>
              </div>
              <div className="p-6">
                {renderField("Notes", "notes", "textarea")}
              </div>
            </div>

            {/* Deals */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Deals ({deals.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {deals.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No deals associated with this contact.
                  </div>
                ) : (
                  deals.map((deal) => (
                    <div key={deal.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {deal.attributes?.name}
                          </h4>
                          <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            {deal.attributes?.stage && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {deal.attributes.stage}
                              </span>
                            )}
                            {deal.attributes?.probability != null && (
                              <span>{deal.attributes.probability}% probability</span>
                            )}
                          </div>
                          {deal.attributes?.notes && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{deal.attributes.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {deal.attributes?.value != null && (
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.attributes.value)}
                            </p>
                          )}
                          {deal.attributes?.expected_close_date && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Close: {formatDate(deal.attributes.expected_close_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <BoltIcon className="h-5 w-5 mr-2" />
                  Activities ({activities.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No activities recorded for this contact.
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            {activity.attributes?.kind && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {activity.attributes.kind}
                              </span>
                            )}
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.attributes?.subject}
                            </h4>
                          </div>
                          {activity.attributes?.body && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{activity.attributes.body}</p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {activity.attributes?.due_at && (
                            <p>Due: {formatDate(activity.attributes.due_at)}</p>
                          )}
                          {activity.attributes?.completed_at && (
                            <p className="text-green-600 dark:text-green-400">Completed: {formatDate(activity.attributes.completed_at)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Meta */}
          <div className="space-y-6">
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

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2" />
                  Tags ({contactTags.length})
                </h3>
              </div>
              <div className="p-6">
                {/* Current tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {contactTags.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tags assigned</p>
                  ) : (
                    contactTags.map((ct) => (
                      <span
                        key={ct.taggingId}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColorClass(ct.tag.attributes?.color || '')}`}
                      >
                        {ct.tag.attributes?.name}
                        <button
                          onClick={() => handleRemoveTag(ct.taggingId)}
                          className="ml-1 inline-flex items-center p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add tag */}
                <div className="relative" ref={tagDropdownRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => {
                        setTagSearch(e.target.value);
                        setShowTagDropdown(true);
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                      placeholder="Search tags to add..."
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  {showTagDropdown && availableTags.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 rounded-md py-1 max-h-48 overflow-auto">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                        >
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTagColorClass(tag.attributes?.color || '')}`}>
                            {tag.attributes?.name}
                          </span>
                          {tag.attributes?.category && (
                            <span className="text-xs text-gray-400">{tag.attributes.category}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {showTagDropdown && availableTags.length === 0 && tagSearch && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 rounded-md py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      No matching tags found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                {attrs?.email && (
                  <a
                    href={`mailto:${attrs.email}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <EnvelopeIcon className="-ml-1 mr-2 h-4 w-4" />
                    Send Email
                  </a>
                )}
                {attrs?.phone && (
                  <a
                    href={`tel:${attrs.phone}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <PhoneIcon className="-ml-1 mr-2 h-4 w-4" />
                    Call Contact
                  </a>
                )}
                <Link
                  to={`/organizations/${orgId}/deals/new?contact=${contactId}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <BanknotesIcon className="-ml-1 mr-2 h-4 w-4" />
                  Create Deal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, Outlet, useLocation } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import SimpleSelect from "~/components/ui/SimpleSelect";
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useContacts } from "~/hooks/useContacts";
import type { ContactAttributes, ContactStatus } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Contacts - CRM Dashboard" },
    { name: "description", content: "Manage your contacts" },
  ];
};

const statusColors: Record<string, string> = {
  lead: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  prospect: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  customer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  churned: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const emptyForm: Partial<ContactAttributes> = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  title: '',
  status: 'lead',
  source: '',
  notes: '',
};

export default function Contacts() {
  const { orgId } = useParams();
  const location = useLocation();
  const { contacts, loading, createContact } = useContacts();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ContactAttributes>>({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const filteredContacts = contacts.filter((contact) => {
    const attrs = contact.attributes;
    if (!attrs) return false;

    if (statusFilter !== 'all' && attrs.status !== statusFilter) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable = [attrs.first_name, attrs.last_name, attrs.email, attrs.company].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.first_name?.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) errors.last_name = 'Last name is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCreating(true);
    try {
      await createContact(formData);
      setIsCreateModalOpen(false);
      setFormData({ ...emptyForm });
      setFormErrors({});
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      setCreating(false);
    }
  };

  const updateForm = (field: keyof ContactAttributes, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Check if we're on a nested route (contact details page)
  const isOnContactDetailsPage = location.pathname.match(/\/contacts\/[^/]+$/);

  return (
    <Layout>
      <Outlet />
      {!isOnContactDetailsPage && (
      <div className="py-6">
        <div className="w-full px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span>Contacts</span>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contacts</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage your customer and prospect contacts
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                  New Contact
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Search & Filter</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search contacts..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <SimpleSelect
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "lead", label: "Lead" },
                      { value: "prospect", label: "Prospect" },
                      { value: "customer", label: "Customer" },
                      { value: "churned", label: "Churned" }
                    ]}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {contacts.length === 0 ? 'No contacts yet. Create your first contact to get started.' : 'No contacts match your search.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <Link
                              to={`/organizations/${orgId}/contacts/${contact.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {`${contact.attributes?.first_name || ''} ${contact.attributes?.last_name || ''}`.trim()}
                            </Link>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {contact.attributes?.email || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {contact.attributes?.company || '-'}
                            </div>
                            {contact.attributes?.title && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {contact.attributes.title}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {contact.attributes?.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {contact.attributes?.status && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[contact.attributes.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                              {contact.attributes.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {contact.attributes?.source || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/organizations/${orgId}/contacts/${contact.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Create Contact Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">New Contact</h3>
                <button onClick={() => { setIsCreateModalOpen(false); setFormData({ ...emptyForm }); setFormErrors({}); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => updateForm('first_name', e.target.value)}
                      className={`w-full px-3 py-2 border ${formErrors.first_name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      autoFocus
                    />
                    {formErrors.first_name && <p className="mt-1 text-xs text-red-600">{formErrors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => updateForm('last_name', e.target.value)}
                      className={`w-full px-3 py-2 border ${formErrors.last_name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {formErrors.last_name && <p className="mt-1 text-xs text-red-600">{formErrors.last_name}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => updateForm('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <SimpleSelect
                      options={[
                        { value: "lead", label: "Lead" },
                        { value: "prospect", label: "Prospect" },
                        { value: "customer", label: "Customer" },
                        { value: "churned", label: "Churned" }
                      ]}
                      value={formData.status || 'lead'}
                      onChange={(value) => updateForm('status', value)}
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                    <SimpleSelect
                      options={[
                        { value: "", label: "Select..." },
                        { value: "website", label: "Website" },
                        { value: "referral", label: "Referral" },
                        { value: "social", label: "Social Media" },
                        { value: "event", label: "Event" },
                        { value: "other", label: "Other" }
                      ]}
                      value={formData.source || ''}
                      onChange={(value) => updateForm('source', value)}
                      size="sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    {creating ? 'Creating...' : 'Create Contact'}
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

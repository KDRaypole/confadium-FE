import type { MetaFunction } from "@remix-run/node";
import { Link, useParams, Outlet, useLocation } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import ContactModal from "~/components/contacts/ContactModal";
import ContactEditModal from "~/components/contacts/ContactEditModal";
import SimpleSelect from "~/components/ui/SimpleSelect";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Contacts - CRM Dashboard" },
    { name: "description", content: "Manage your contacts" },
  ];
};

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: "hot" | "warm" | "cold";
  lastContact: string;
  notes?: string;
  address?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Inc.",
    position: "CEO",
    status: "hot",
    lastContact: "2024-01-15",
    notes: "Interested in our enterprise solution. Follow up on Q1 proposal requirements. Very responsive to calls and emails.",
    address: "123 Tech Street, San Francisco, CA 94105",
    socialMedia: {
      linkedin: "https://linkedin.com/in/johnsmith",
      twitter: "https://twitter.com/johnsmith_ceo"
    }
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@innovation.com",
    phone: "+1 (555) 234-5678",
    company: "Innovation Labs",
    position: "CTO",
    status: "warm",
    lastContact: "2024-01-12",
    notes: "Completed product demo. Waiting for technical team review. Prefers email communication over calls.",
    address: "456 Innovation Ave, Austin, TX 78701",
    socialMedia: {
      linkedin: "https://linkedin.com/in/sarahjohnson-cto"
    }
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "mike@startup.io",
    phone: "+1 (555) 345-6789",
    company: "StartupXYZ",
    position: "Founder",
    status: "cold",
    lastContact: "2024-01-08",
    notes: "Early stage startup. Budget concerns but shows interest. Need to follow up in Q2 when they have more funding.",
    address: "789 Startup Blvd, Seattle, WA 98101"
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@bigcorp.com",
    phone: "+1 (555) 456-7890",
    company: "BigCorp Enterprise",
    position: "VP Sales",
    status: "hot",
    lastContact: "2024-01-14",
    notes: "Ready to move forward with implementation. Discussed pricing and timeline. Expects contract by end of month.",
    address: "321 Corporate Plaza, New York, NY 10001"
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david@smallbiz.com",
    phone: "+1 (555) 567-8901",
    company: "Small Business Co.",
    position: "Owner",
    status: "warm",
    lastContact: "2024-01-10",
    notes: "Small business owner looking for cost-effective solution. Interested in basic package with room to grow.",
    address: "654 Main Street, Denver, CO 80202"
  }
];

export default function Contacts() {
  const { orgId } = useParams();
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedContact(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedContact(null);
  };

  const handleSaveContact = (updatedContact: Contact) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  };
  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "hot":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "warm":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cold":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Check if we're on a nested route (contact details page)
  const isOnContactDetailsPage = location.pathname.match(/\/contacts\/[^\/]+$/);

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
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Import
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                  New
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
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search contacts..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <SimpleSelect
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "hot", label: "Hot" },
                      { value: "warm", label: "Warm" },
                      { value: "cold", label: "Cold" }
                    ]}
                    value="all"
                    onChange={(value) => {/* Handle status filter */}}
                  />
                  <SimpleSelect
                    options={[
                      { value: "all", label: "All Companies" },
                      { value: "techcorp", label: "TechCorp Inc." },
                      { value: "innovation", label: "Innovation Labs" },
                      { value: "startup", label: "StartupXYZ" }
                    ]}
                    value="all"
                    onChange={(value) => {/* Handle company filter */}}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company & Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link 
                            to={`/organizations/${orgId}/contacts/${contact.id}`}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {contact.name}
                          </Link>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {contact.company}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.position}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {contact.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(contact.lastContact).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/organizations/${orgId}/contacts/${contact.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View
                          </Link>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <button 
                            onClick={() => handleEditContact(contact)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}
      
      <ContactModal 
        contact={selectedContact}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        onEdit={handleEditContact}
      />
      
      <ContactEditModal 
        contact={selectedContact}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveContact}
      />
    </Layout>
  );
}
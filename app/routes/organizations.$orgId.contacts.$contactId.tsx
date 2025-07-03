import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState } from "react";
import { getAllTags, getTagColorClass, type Tag } from "~/components/tags/TagsData";
import SimpleSelect from "~/components/ui/SimpleSelect";
import { 
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  LinkIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Contact Details - CRM Dashboard" },
    { name: "description", content: "View and edit contact information" },
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
  // Extended fields for detailed view
  leadSource: string;
  leadScore: number;
  estimatedValue: number;
  territory: string;
  assignedTo: string;
  tags: string[];
  createdDate: string;
  lastActivity: string;
  totalDeals: number;
  wonDeals: number;
  totalRevenue: number;
  communicationPreference: "email" | "phone" | "text" | "any";
  timezone: string;
  industry: string;
  companySize: string;
  birthday?: string;
  website?: string;
}

// Mock data for contact details
const getContactData = (contactId: string): Contact => {
  const contacts: Record<string, Contact> = {
    "1": {
      id: "1",
      name: "John Smith",
      email: "john@techcorp.com",
      phone: "+1 (555) 123-4567",
      company: "TechCorp Inc.",
      position: "CEO",
      status: "hot",
      lastContact: "2024-01-15",
      notes: "Interested in our enterprise solution. Follow up on Q1 proposal requirements. Very responsive to calls and emails. Has budget approved for Q1 purchase.",
      address: "123 Tech Street, San Francisco, CA 94105",
      socialMedia: {
        linkedin: "https://linkedin.com/in/johnsmith",
        twitter: "https://twitter.com/johnsmith_ceo"
      },
      leadSource: "Website",
      leadScore: 95,
      estimatedValue: 250000,
      territory: "West Coast",
      assignedTo: "Sarah Johnson",
      tags: ["Enterprise", "High Priority", "Decision Maker", "Budget Approved"],
      createdDate: "2023-11-15",
      lastActivity: "2024-01-15",
      totalDeals: 3,
      wonDeals: 1,
      totalRevenue: 75000,
      communicationPreference: "email",
      timezone: "PST",
      industry: "Technology",
      companySize: "500-1000",
      birthday: "1975-06-15",
      website: "https://techcorp.com"
    },
    "2": {
      id: "2",
      name: "Sarah Wilson",
      email: "sarah@startup.io",
      phone: "+1 (555) 234-5678",
      company: "StartupIO",
      position: "CTO",
      status: "warm",
      lastContact: "2024-01-12",
      notes: "Evaluating multiple solutions. Price sensitive. Needs technical demo.",
      address: "456 Innovation Ave, Austin, TX 78701",
      socialMedia: {
        linkedin: "https://linkedin.com/in/sarahwilson"
      },
      leadSource: "Referral",
      leadScore: 72,
      estimatedValue: 45000,
      territory: "Central",
      assignedTo: "Mike Chen",
      tags: ["Startup", "Technical Buyer", "Price Sensitive"],
      createdDate: "2023-12-01",
      lastActivity: "2024-01-12",
      totalDeals: 1,
      wonDeals: 0,
      totalRevenue: 0,
      communicationPreference: "phone",
      timezone: "CST",
      industry: "Technology",
      companySize: "10-50",
      website: "https://startup.io"
    }
  };
  
  return contacts[contactId] || contacts["1"];
};

const statusColors = {
  hot: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  warm: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  cold: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
};

const leadSources = ["Website", "Email", "Phone", "Social Media", "Referral", "Event", "Advertisement", "Other"];
const communicationPreferences = ["email", "phone", "text", "any"];
const territories = ["West Coast", "East Coast", "Central", "International"];
const industries = ["Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education", "Other"];
const companySizes = ["1-10", "10-50", "50-200", "200-500", "500-1000", "1000+"];

export default function ContactShow() {
  const params = useParams();
  const { orgId, contactId } = params;
  
  const [contact, setContact] = useState<Contact>(getContactData(contactId!));
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact>(contact);
  const [availableTags] = useState<Tag[]>(getAllTags());
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const handleEdit = () => {
    setEditedContact(contact);
    setIsEditing(true);
  };

  const handleSave = () => {
    setContact(editedContact);
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log("Saving contact:", editedContact);
  };

  const handleCancel = () => {
    setEditedContact(contact);
    setIsEditing(false);
  };

  const updateField = (field: keyof Contact, value: any) => {
    setEditedContact(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setEditedContact(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof Contact],
        [field]: value
      }
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !editedContact.tags.includes(tag.trim())) {
      updateField('tags', [...editedContact.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', editedContact.tags.filter(tag => tag !== tagToRemove));
  };

  const addTagFromDropdown = (tagName: string) => {
    if (!editedContact.tags.includes(tagName)) {
      updateField('tags', [...editedContact.tags, tagName]);
    }
    setShowTagDropdown(false);
  };

  const getAvailableTagsForDropdown = () => {
    return availableTags.filter(tag => !editedContact.tags.includes(tag.name));
  };

  const renderField = (
    label: string,
    field: keyof Contact,
    type: "text" | "email" | "tel" | "select" | "number" | "date" | "textarea" = "text",
    options?: string[]
  ) => {
    const value = isEditing ? editedContact[field] : contact[field];
    
    if (!isEditing) {
      return (
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {value || "Not specified"}
          </dd>
        </div>
      );
    }

    if (type === "select" && options) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
          <SimpleSelect
            options={options.map(option => ({
              value: option,
              label: option
            }))}
            value={value as string}
            onChange={(optionValue) => updateField(field, optionValue)}
            size="sm"
          />
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
          <textarea
            rows={4}
            value={value as string || ""}
            onChange={(e) => updateField(field, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <input
          type={type}
          value={value as string || ""}
          onChange={(e) => updateField(field, type === "number" ? Number(e.target.value) : e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to={`/organizations/${orgId}/contacts`} className="hover:text-gray-700 dark:hover:text-gray-200">
                Contacts
              </Link>
              <span>/</span>
              <span>{contact.name}</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to={`/organizations/${orgId}/contacts`}
                  className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Contacts
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contact.name}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{contact.position} at {contact.company}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[contact.status]}`}>
                      {contact.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                    Edit Contact
                  </button>
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
                    {renderField("Full Name", "name")}
                    {renderField("Email Address", "email", "email")}
                    {renderField("Phone Number", "phone", "tel")}
                    {renderField("Position", "position")}
                    {renderField("Company", "company")}
                    {renderField("Status", "status", "select", ["hot", "warm", "cold"])}
                  </dl>
                </div>
              </div>

              {/* Address & Location */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Address & Location
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {renderField("Address", "address", "textarea")}
                    {renderField("Territory", "territory", "select", territories)}
                    {renderField("Timezone", "timezone")}
                    {renderField("Industry", "industry", "select", industries)}
                  </dl>
                </div>
              </div>

              {/* Sales Information */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2" />
                    Sales Information
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {renderField("Lead Source", "leadSource", "select", leadSources)}
                    {renderField("Lead Score", "leadScore", "number")}
                    {renderField("Estimated Value", "estimatedValue", "number")}
                    {renderField("Assigned To", "assignedTo")}
                    {renderField("Company Size", "companySize", "select", companySizes)}
                    {renderField("Communication Preference", "communicationPreference", "select", communicationPreferences)}
                  </dl>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Additional Information
                  </h3>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {renderField("Website", "website")}
                    {renderField("Birthday", "birthday", "date")}
                    
                    {/* Social Media Links */}
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Social Media</dt>
                      <div className="space-y-2">
                        {isEditing ? (
                          <>
                            <input
                              type="url"
                              placeholder="LinkedIn URL"
                              value={editedContact.socialMedia?.linkedin || ""}
                              onChange={(e) => updateNestedField("socialMedia", "linkedin", e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <input
                              type="url"
                              placeholder="Twitter URL"
                              value={editedContact.socialMedia?.twitter || ""}
                              onChange={(e) => updateNestedField("socialMedia", "twitter", e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </>
                        ) : (
                          <div className="space-y-1">
                            {contact.socialMedia?.linkedin && (
                              <a href={contact.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                LinkedIn Profile
                              </a>
                            )}
                            {contact.socialMedia?.twitter && (
                              <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                Twitter Profile
                              </a>
                            )}
                            {!contact.socialMedia?.linkedin && !contact.socialMedia?.twitter && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">No social media links</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
            </div>

            {/* Right Column - Stats & Meta */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Quick Stats
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Lead Score</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{contact.leadScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Deals</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{contact.totalDeals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Won Deals</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{contact.wonDeals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contact.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Est. Value</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contact.estimatedValue)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Timeline */}
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
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(contact.createdDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Contact</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(contact.lastContact)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Activity</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatDate(contact.lastActivity)}</dd>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2" />
                    Tags
                  </h3>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Current Tags */}
                      <div className="flex flex-wrap gap-2">
                        {editedContact.tags.map((tagName, index) => {
                          const tagData = availableTags.find(t => t.name === tagName);
                          return (
                            <span 
                              key={index} 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tagData ? getTagColorClass(tagData.color) : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {tagName}
                              <button
                                onClick={() => removeTag(tagName)}
                                className="ml-1 inline-flex items-center p-0.5 rounded-full hover:bg-black/10 focus:outline-none"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>

                      {/* Add Tags Section */}
                      <div className="space-y-3">
                        {/* Dropdown for Available Tags */}
                        {getAvailableTagsForDropdown().length > 0 && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowTagDropdown(!showTagDropdown)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Select from available tags
                              <ChevronDownIcon className="ml-2 h-4 w-4" />
                            </button>
                            
                            {showTagDropdown && (
                              <div className="absolute z-10 mt-1 w-full max-w-sm bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 rounded-md py-1 max-h-60 overflow-auto">
                                {getAvailableTagsForDropdown().map((tag) => (
                                  <button
                                    key={tag.id}
                                    onClick={() => addTagFromDropdown(tag.name)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColorClass(tag.color)}`}>
                                        {tag.name}
                                      </span>
                                      {tag.description && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {tag.description}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      Level {tag.level}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Manual Tag Input */}
                        <input
                          type="text"
                          placeholder="Add custom tag and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Select from available tags or type a custom tag name
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.length > 0 ? (
                        contact.tags.map((tagName, index) => {
                          const tagData = availableTags.find(t => t.name === tagName);
                          return (
                            <span 
                              key={index} 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tagData ? getTagColorClass(tagData.color) : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {tagName}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No tags assigned</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <a
                    href={`mailto:${contact.email}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <EnvelopeIcon className="-ml-1 mr-2 h-4 w-4" />
                    Send Email
                  </a>
                  <a
                    href={`tel:${contact.phone}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <PhoneIcon className="-ml-1 mr-2 h-4 w-4" />
                    Call Contact
                  </a>
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
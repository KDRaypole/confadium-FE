import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, UserIcon } from "@heroicons/react/24/outline";

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

interface ContactEditModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
}

export default function ContactEditModal({ contact, isOpen, onClose, onSave }: ContactEditModalProps) {
  const [formData, setFormData] = useState<Contact | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact) {
      setFormData({ ...contact });
      setErrors({});
    }
  }, [contact]);

  if (!contact || !formData) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof Contact, value: string) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCancel = () => {
    setFormData(contact ? { ...contact } : null);
    setErrors({});
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={handleCancel}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                        Edit Contact
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Update contact information and details
                      </p>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Section */}
                        <div className="flex items-center space-x-3 pb-6 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Contact Profile</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{formData.name}</p>
                          </div>
                        </div>

                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Basic Information</h3>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="Enter full name"
                              />
                              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                            </div>

                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="Enter email address"
                              />
                              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="Enter phone number"
                              />
                              {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Professional Information</h3>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Company *
                              </label>
                              <input
                                type="text"
                                id="company"
                                value={formData.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.company ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="Enter company name"
                              />
                              {errors.company && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company}</p>}
                            </div>

                            <div>
                              <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Position *
                              </label>
                              <input
                                type="text"
                                id="position"
                                value={formData.position}
                                onChange={(e) => handleInputChange('position', e.target.value)}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.position ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                placeholder="Enter job position"
                              />
                              {errors.position && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.position}</p>}
                            </div>

                            <div>
                              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                              </label>
                              <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="hot">Hot</option>
                                <option value="warm">Warm</option>
                                <option value="cold">Cold</option>
                              </select>
                            </div>

                            <div>
                              <label htmlFor="lastContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Last Contact Date
                              </label>
                              <input
                                type="date"
                                id="lastContact"
                                value={formData.lastContact}
                                onChange={(e) => handleInputChange('lastContact', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Additional Information</h3>
                          
                          <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Address
                            </label>
                            <input
                              type="text"
                              id="address"
                              value={formData.address || ''}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter address"
                            />
                          </div>

                          <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Notes
                            </label>
                            <textarea
                              id="notes"
                              rows={4}
                              value={formData.notes || ''}
                              onChange={(e) => handleInputChange('notes', e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter notes about this contact"
                            />
                          </div>

                          {/* Social Media */}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Social Media</h4>
                            <div className="space-y-3">
                              <div>
                                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  LinkedIn
                                </label>
                                <input
                                  type="url"
                                  id="linkedin"
                                  value={formData.socialMedia?.linkedin || ''}
                                  onChange={(e) => {
                                    setFormData(prev => prev ? {
                                      ...prev,
                                      socialMedia: {
                                        ...prev.socialMedia,
                                        linkedin: e.target.value
                                      }
                                    } : null);
                                  }}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="https://linkedin.com/in/username"
                                />
                              </div>
                              <div>
                                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Twitter
                                </label>
                                <input
                                  type="url"
                                  id="twitter"
                                  value={formData.socialMedia?.twitter || ''}
                                  onChange={(e) => {
                                    setFormData(prev => prev ? {
                                      ...prev,
                                      socialMedia: {
                                        ...prev.socialMedia,
                                        twitter: e.target.value
                                      }
                                    } : null);
                                  }}
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="https://twitter.com/username"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex space-x-3">
                            <button
                              type="submit"
                              className="flex-1 bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                            >
                              Save Changes
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
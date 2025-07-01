import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, PhoneIcon, EnvelopeIcon, BuildingOfficeIcon, CalendarIcon, ChatBubbleLeftRightIcon, MapPinIcon } from "@heroicons/react/24/outline";

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

interface ContactModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contact: Contact) => void;
}

export default function ContactModal({ contact, isOpen, onClose, onEdit }: ContactModalProps) {
  if (!contact) return null;

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "hot":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-yellow-100 text-yellow-800";
      case "cold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const recentActivities = [
    {
      id: "1",
      type: "call",
      description: "Called regarding Q1 proposal",
      date: "2024-01-15",
      time: "10:30 AM"
    },
    {
      id: "2",
      type: "email",
      description: "Sent follow-up email with pricing",
      date: "2024-01-12",
      time: "2:15 PM"
    },
    {
      id: "3",
      type: "meeting",
      description: "Product demo meeting",
      date: "2024-01-10",
      time: "11:00 AM"
    }
  ];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                        onClick={onClose}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                        Contact Details
                      </Dialog.Title>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {/* Contact Header */}
                      <div className="flex items-center space-x-3 pb-6 border-b border-gray-200">
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xl font-medium text-gray-700">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
                          <p className="text-sm text-gray-500">{contact.position}</p>
                          <p className="text-sm text-gray-500">{contact.company}</p>
                          <span className={`inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                            {contact.status}
                          </span>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="mt-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-900">{contact.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-sm font-medium text-gray-900">{contact.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Company</p>
                                <p className="text-sm font-medium text-gray-900">{contact.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Last Contact</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(contact.lastContact).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {contact.address && (
                              <div className="flex items-center space-x-3">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Address</p>
                                  <p className="text-sm font-medium text-gray-900">{contact.address}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Social Media */}
                        {(contact.socialMedia?.linkedin || contact.socialMedia?.twitter) && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                            <div className="space-y-3">
                              {contact.socialMedia?.linkedin && (
                                <div className="flex items-center space-x-3">
                                  <div className="h-5 w-5 flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-sm">in</span>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">LinkedIn</p>
                                    <a href={contact.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                      View Profile
                                    </a>
                                  </div>
                                </div>
                              )}
                              {contact.socialMedia?.twitter && (
                                <div className="flex items-center space-x-3">
                                  <div className="h-5 w-5 flex items-center justify-center">
                                    <span className="text-blue-400 font-bold text-sm">𝕏</span>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Twitter</p>
                                    <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                      View Profile
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recent Activities */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                          <div className="space-y-3">
                            {recentActivities.map((activity) => (
                              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(activity.date).toLocaleDateString()} at {activity.time}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                              {contact.notes || "No notes available for this contact."}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-gray-200">
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              className="flex-1 bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PhoneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                              Call
                            </button>
                            <button
                              type="button"
                              className="flex-1 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                              Email
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (onEdit) {
                                onEdit(contact);
                                onClose();
                              }
                            }}
                            className="w-full mt-3 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Edit Contact
                          </button>
                        </div>
                      </div>
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
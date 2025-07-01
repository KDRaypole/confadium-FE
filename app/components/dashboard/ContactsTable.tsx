interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "hot" | "warm" | "cold";
  lastContact: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    company: "TechCorp Inc.",
    status: "hot",
    lastContact: "2024-01-15"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    company: "Innovation Labs",
    status: "warm",
    lastContact: "2024-01-12"
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "mike@startup.io",
    company: "StartupXYZ",
    status: "cold",
    lastContact: "2024-01-08"
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@bigcorp.com",
    company: "BigCorp Enterprise",
    status: "hot",
    lastContact: "2024-01-14"
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david@smallbiz.com",
    company: "Small Business Co.",
    status: "warm",
    lastContact: "2024-01-10"
  }
];

export default function ContactsTable() {
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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Recent Contacts
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {contact.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contact.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contact.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(contact.lastContact).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-gray-200">
        <div className="text-sm">
          <a href="/contacts" className="font-medium text-blue-600 hover:text-blue-500">
            View all contacts →
          </a>
        </div>
      </div>
    </div>
  );
}
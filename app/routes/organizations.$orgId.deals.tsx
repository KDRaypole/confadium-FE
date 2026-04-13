import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/layout/Layout";
import { PlusIcon } from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Deals - CRM Dashboard" },
    { name: "description", content: "Manage your sales deals" },
  ];
};

interface DealAttributes {
  title: string;
  company: string;
  contact: string;
  value: number;
  stage: "prospect" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  probability: number;
  close_date: string;
}

interface Deal {
  id: string;
  type: string;
  attributes: DealAttributes;
}

const mockDeals: Deal[] = [
  {
    id: "1",
    type: "deal",
    attributes: {
      title: "Enterprise Software License",
      company: "TechCorp Inc.",
      contact: "John Smith",
      value: 250000,
      stage: "negotiation",
      probability: 80,
      close_date: "2024-02-15"
    }
  },
  {
    id: "2",
    type: "deal",
    attributes: {
      title: "Cloud Migration Project",
      company: "Innovation Labs",
      contact: "Sarah Johnson",
      value: 150000,
      stage: "proposal",
      probability: 60,
      close_date: "2024-02-28"
    }
  },
  {
    id: "3",
    type: "deal",
    attributes: {
      title: "Consulting Services",
      company: "StartupXYZ",
      contact: "Michael Brown",
      value: 75000,
      stage: "qualified",
      probability: 40,
      close_date: "2024-03-15"
    }
  },
  {
    id: "4",
    type: "deal",
    attributes: {
      title: "Annual Support Contract",
      company: "BigCorp Enterprise",
      contact: "Emily Davis",
      value: 120000,
      stage: "closed-won",
      probability: 100,
      close_date: "2024-01-10"
    }
  }
];

export default function Deals() {
  const getStageColor = (stage: DealAttributes["stage"]) => {
    switch (stage) {
      case "prospect":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "qualified":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "proposal":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "negotiation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "closed-won":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed-lost":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalPipeline = mockDeals
    .filter(deal => !['closed-won', 'closed-lost'].includes(deal.attributes.stage))
    .reduce((sum, deal) => sum + (deal.attributes.value * deal.attributes.probability / 100), 0);

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deals</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Track and manage your sales opportunities
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md border border-gray-100-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Deal
              </button>
            </div>
          </div>

          {/* Pipeline Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">💼</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Pipeline
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(totalPipeline)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Won This Month
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(120000)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Open Deals
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {mockDeals.filter(deal => !['closed-won', 'closed-lost'].includes(deal.attributes.stage)).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">📈</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Win Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        75%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deals Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                All Deals
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Company/Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Probability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Close Date
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mockDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {deal.attributes.title || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {deal.attributes.company || ''}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {deal.attributes.contact || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(deal.attributes.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.attributes.stage)}`}>
                          {deal.attributes.stage.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                              style={{ width: `${deal.attributes.probability}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{deal.attributes.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(deal.attributes.close_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import Layout from "~/components/layout/Layout";
import { getTagColorClass } from "~/components/tags/TagsData";
import { useTags, type Tag } from "~/hooks/useTags";
import { useDarkMode } from "~/contexts/DarkModeContext";
import D3Chart, { type ChartData } from "~/components/charts/D3Chart";
import { 
  ArrowLeftIcon,
  FunnelIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Report Details - Confadium" },
    { name: "description", content: "View detailed report analytics and visualizations" },
  ];
};

interface ReportData {
  id: string;
  name: string;
  description: string;
  category: "sales" | "contacts" | "calls" | "activities";
  lastGenerated: string;
  icon: string;
}

interface EntityData {
  id: string;
  name: string;
  value: number;
  category?: string;
  created_at: string;
  tags: string[];
  status?: string;
  // Entity-specific fields
  revenue?: number;
  probability?: number;
  duration?: number;
  outcome?: string;
  stage?: string;
}

// Mock reports data
const mockReports: Record<string, ReportData> = {
  "1": {
    id: "1",
    name: "Sales Performance",
    description: "Monthly sales performance and revenue trends",
    category: "sales",
    lastGenerated: "2024-01-15",
    icon: "chart"
  },
  "2": {
    id: "2",
    name: "Contact Activity Summary",
    description: "Contact engagement and interaction summary",
    category: "contacts",
    lastGenerated: "2024-01-14",
    icon: "users"
  },
  "3": {
    id: "3",
    name: "Call Log Analysis",
    description: "Call volume, duration, and success rate analysis",
    category: "calls",
    lastGenerated: "2024-01-13",
    icon: "phone"
  }
};

// Mock data generator
const generateMockData = (category: string, count: number = 50): EntityData[] => {
  const tags = ["High Priority", "Enterprise", "Startup", "Technical", "Budget Approved", "Decision Maker"];
  const data: EntityData[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomTags = tags.slice(0, Math.floor(Math.random() * 3) + 1);
    const baseData = {
      id: `${category}-${i}`,
      name: `${category.charAt(0).toUpperCase()}${category.slice(1)} ${i + 1}`,
      value: Math.floor(Math.random() * 100000) + 1000,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      tags: randomTags
    };

    if (category === "sales") {
      data.push({
        ...baseData,
        revenue: Math.floor(Math.random() * 500000) + 10000,
        probability: Math.floor(Math.random() * 100),
        stage: ["prospect", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"][Math.floor(Math.random() * 6)]
      });
    } else if (category === "calls") {
      data.push({
        ...baseData,
        duration: Math.floor(Math.random() * 60) + 5,
        outcome: ["successful", "busy", "no-answer", "voicemail"][Math.floor(Math.random() * 4)]
      });
    } else if (category === "contacts") {
      data.push({
        ...baseData,
        status: ["hot", "warm", "cold"][Math.floor(Math.random() * 3)]
      });
    } else {
      data.push(baseData);
    }
  }
  
  return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export default function ReportShow() {
  const params = useParams();
  const { reportId } = params;
  const { isDarkMode } = useDarkMode();
  
  const [report] = useState<ReportData | null>(mockReports[reportId || ""] || null);
  const [data, setData] = useState<EntityData[]>([]);
  const [filteredData, setFilteredData] = useState<EntityData[]>([]);
  const { tags: availableTags } = useTags();
  
  // Filter states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  

  // Generate mock data on mount
  useEffect(() => {
    if (report) {
      const mockData = generateMockData(report.category);
      setData(mockData);
      setFilteredData(mockData);
    }
  }, [report]);

  // Apply filters
  useEffect(() => {
    let filtered = [...data];
    
    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(item => new Date(item.created_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(item => new Date(item.created_at) <= new Date(dateRange.end));
    }
    
    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }
    
    setFilteredData(filtered);
  }, [data, dateRange, selectedTags]);

  // Convert EntityData to ChartData format
  const chartData: ChartData[] = filteredData.map(item => ({
    id: item.id,
    name: item.name,
    value: item.value,
    category: item.status || item.stage || item.outcome,
    created_at: item.created_at,
    tags: item.tags,
    revenue: item.revenue,
    duration: item.duration,
    probability: item.probability
  }));

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setSelectedTags([]);
  };

  if (!report) {
    return (
      <Layout>
        <div className="py-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Report Not Found</h1>
              <Link to="/reports" className="text-blue-600 hover:text-blue-500">
                Back to Reports
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to="/reports" className="hover:text-gray-700 dark:hover:text-gray-200">
                Reports
              </Link>
              <span>/</span>
              <span>{report.name}</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to="/reports"
                  className="mr-4 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Reports
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{report.name}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                  Filters
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  <DocumentArrowDownIcon className="-ml-1 mr-2 h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters</h3>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <CalendarIcon className="inline h-4 w-4 mr-1" />
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <TagIcon className="inline h-4 w-4 mr-1" />
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.slice(0, 6).map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.name)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedTags.includes(tag.name)
                              ? getTagColorClass(tag.color)
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {tag.name}
                          {selectedTags.includes(tag.name) && (
                            <XMarkIcon className="ml-1 h-3 w-3" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Clear all filters
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredData.length} of {data.length} records
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Value Distribution
                </h3>
              </div>
              <div className="p-6">
                <D3Chart
                  data={chartData}
                  type="bar"
                  width={400}
                  height={250}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Status Distribution
                </h3>
              </div>
              <div className="p-6">
                <D3Chart
                  data={chartData}
                  type="pie"
                  width={400}
                  height={250}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Timeline Activity
              </h3>
            </div>
            <div className="p-6">
              <D3Chart
                data={chartData}
                type="timeline"
                width={700}
                height={250}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Additional Visualization - Scatter Plot for Sales/Revenue data */}
          {report?.category === 'sales' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Value vs Revenue Correlation
                </h3>
              </div>
              <div className="p-6">
                <D3Chart
                  data={chartData}
                  type="scatter"
                  width={700}
                  height={300}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
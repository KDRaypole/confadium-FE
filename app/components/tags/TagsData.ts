export interface Tag {
  id: string;
  name: string;
  color: string;
  priority: "low" | "medium" | "high" | "critical";
  level: number; // 1-5 scale
  description?: string;
  createdDate: string;
  usageCount: number;
  category?: string;
}

export const tagColors = [
  { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "green", label: "Green", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "red", label: "Red", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "orange", label: "Orange", class: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { value: "pink", label: "Pink", class: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  { value: "gray", label: "Gray", class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" }
];

export const tagPriorities = [
  { value: "low", label: "Low", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "medium", label: "Medium", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "high", label: "High", class: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { value: "critical", label: "Critical", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
];

// Mock tags data
export const mockTags: Tag[] = [
  {
    id: "1",
    name: "Enterprise",
    color: "blue",
    priority: "high",
    level: 5,
    description: "Large enterprise customers",
    createdDate: "2024-01-01",
    usageCount: 15,
    category: "Customer Type"
  },
  {
    id: "2",
    name: "High Priority",
    color: "red",
    priority: "critical",
    level: 5,
    description: "Urgent attention required",
    createdDate: "2024-01-01",
    usageCount: 8,
    category: "Priority"
  },
  {
    id: "3",
    name: "Decision Maker",
    color: "purple",
    priority: "high",
    level: 4,
    description: "Primary decision maker",
    createdDate: "2024-01-01",
    usageCount: 12,
    category: "Role"
  },
  {
    id: "4",
    name: "Budget Approved",
    color: "green",
    priority: "high",
    level: 4,
    description: "Budget has been approved",
    createdDate: "2024-01-01",
    usageCount: 6,
    category: "Status"
  },
  {
    id: "5",
    name: "Technical Buyer",
    color: "indigo",
    priority: "medium",
    level: 3,
    description: "Technical evaluation role",
    createdDate: "2024-01-01",
    usageCount: 9,
    category: "Role"
  },
  {
    id: "6",
    name: "Price Sensitive",
    color: "orange",
    priority: "medium",
    level: 3,
    description: "Cost is a major factor",
    createdDate: "2024-01-01",
    usageCount: 7,
    category: "Characteristics"
  },
  {
    id: "7",
    name: "Startup",
    color: "pink",
    priority: "medium",
    level: 2,
    description: "Startup company",
    createdDate: "2024-01-01",
    usageCount: 5,
    category: "Customer Type"
  },
  {
    id: "8",
    name: "Referral",
    color: "yellow",
    priority: "low",
    level: 2,
    description: "Came through referral",
    createdDate: "2024-01-01",
    usageCount: 4,
    category: "Source"
  }
];

export const getTagById = (id: string): Tag | undefined => {
  return mockTags.find(tag => tag.id === id);
};

export const getTagsByIds = (ids: string[]): Tag[] => {
  return mockTags.filter(tag => ids.includes(tag.id));
};

export const getAllTags = (): Tag[] => {
  return mockTags;
};

export const getTagColorClass = (color: string): string => {
  const colorObj = tagColors.find(c => c.value === color);
  return colorObj ? colorObj.class : tagColors[0].class;
};

export const getTagPriorityClass = (priority: string): string => {
  const priorityObj = tagPriorities.find(p => p.value === priority);
  return priorityObj ? priorityObj.class : tagPriorities[0].class;
};

export const getTagsByCategory = (): Record<string, Tag[]> => {
  const categories: Record<string, Tag[]> = {};
  mockTags.forEach(tag => {
    const category = tag.category || "Uncategorized";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(tag);
  });
  return categories;
};
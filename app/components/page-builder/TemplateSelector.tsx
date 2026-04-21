import { usePageTemplates } from "~/hooks/usePages";
import type { PageComponentNode, PageTheme, PageTemplateCategory } from "~/lib/api/types";
import {
  RectangleGroupIcon,
  PhotoIcon,
  PhoneIcon,
  CubeIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

// Built-in starter templates when no API templates exist
const BUILT_IN_TEMPLATES: {
  name: string;
  category: PageTemplateCategory;
  description: string;
  structure: PageComponentNode;
  theme: PageTheme;
}[] = [
  {
    name: 'Blank Page',
    category: 'blank',
    description: 'Start from scratch with an empty page',
    structure: {
      selector: '0',
      node: true,
      type: 'Root',
      props: {
        children: [
          { selector: '0-0', node: false, type: 'Navigation', props: { logo: 'My Site' } },
          {
            selector: '0-1',
            node: false,
            type: 'Section',
            props: { children: [], rows: { lg: 12, sm: 12 } },
            grid: { lg: { x: 0, y: 0, w: 12, h: 6 }, sm: { x: 0, y: 0, w: 4, h: 4 } },
          },
          { selector: '0-2', node: false, type: 'Footer', props: {} },
        ],
      },
    },
    theme: {
      colorPalette: { color1: '#7c3aed', color2: '#a78bfa', color3: '#f5f3ff', color4: '#1e1b4b', color5: '#ffffff' },
    },
  },
  {
    name: 'Landing Page',
    category: 'landing',
    description: 'A lead capture landing page with hero, features, and CTA',
    structure: {
      selector: '0',
      node: true,
      type: 'Root',
      props: {
        children: [
          { selector: '0-0', node: false, type: 'Navigation', props: { logo: 'Brand' } },
          {
            selector: '0-1',
            node: false,
            type: 'Section',
            props: {
              children: [
                { selector: '0-1-0', node: false, type: 'Text', props: { verbiage: 'Welcome to Your Business', tagType: 'heading_1', textAlign: 'center', color: '' } },
                { selector: '0-1-1', node: false, type: 'Text', props: { verbiage: 'Describe what makes your product or service unique. Capture leads and grow your business.', tagType: 'paragraph_1', textAlign: 'center', color: '' } },
                { selector: '0-1-2', node: false, type: 'ContentButton', props: { text: 'Get Started', link: '#contact', linkType: 'anchor', buttonType: 'primary' } },
              ],
              rows: { lg: 12, sm: 12 },
            },
          },
          {
            selector: '0-2',
            node: false,
            type: 'Section',
            props: {
              children: [
                { selector: '0-2-0', node: false, type: 'Text', props: { verbiage: 'Our Features', tagType: 'heading_2', textAlign: 'center', color: '' } },
                { selector: '0-2-1', node: false, type: 'Text', props: { verbiage: 'Feature 1 - Describe the first key feature of your product or service.', tagType: 'paragraph_1', textAlign: 'left', color: '' } },
                { selector: '0-2-2', node: false, type: 'Text', props: { verbiage: 'Feature 2 - Explain another benefit that your customers will love.', tagType: 'paragraph_1', textAlign: 'left', color: '' } },
                { selector: '0-2-3', node: false, type: 'Text', props: { verbiage: 'Feature 3 - Highlight what sets you apart from the competition.', tagType: 'paragraph_1', textAlign: 'left', color: '' } },
              ],
              rows: { lg: 12, sm: 12 },
            },
          },
          { selector: '0-3', node: false, type: 'Footer', props: {} },
        ],
      },
    },
    theme: {
      colorPalette: { color1: '#2563eb', color2: '#60a5fa', color3: '#eff6ff', color4: '#1e3a5f', color5: '#ffffff' },
    },
  },
  {
    name: 'Contact Page',
    category: 'contact',
    description: 'A page with embedded form for collecting inquiries',
    structure: {
      selector: '0',
      node: true,
      type: 'Root',
      props: {
        children: [
          { selector: '0-0', node: false, type: 'Navigation', props: { logo: 'Brand' } },
          {
            selector: '0-1',
            node: false,
            type: 'Section',
            props: {
              children: [
                { selector: '0-1-0', node: false, type: 'Text', props: { verbiage: 'Contact Us', tagType: 'heading_1', textAlign: 'center', color: '' } },
                { selector: '0-1-1', node: false, type: 'Text', props: { verbiage: 'We\'d love to hear from you. Fill out the form below and we\'ll get back to you shortly.', tagType: 'paragraph_1', textAlign: 'center', color: '' } },
                { selector: '0-1-2', node: false, type: 'FormEmbed', props: { formId: '', formName: '' } },
              ],
              rows: { lg: 12, sm: 12 },
            },
          },
          { selector: '0-2', node: false, type: 'Footer', props: {} },
        ],
      },
    },
    theme: {
      colorPalette: { color1: '#059669', color2: '#34d399', color3: '#ecfdf5', color4: '#064e3b', color5: '#ffffff' },
    },
  },
  {
    name: 'Product Page',
    category: 'product',
    description: 'Showcase and sell a product with pricing and purchase options',
    structure: {
      selector: '0',
      node: true,
      type: 'Root',
      props: {
        children: [
          { selector: '0-0', node: false, type: 'Navigation', props: { logo: 'Store' } },
          {
            selector: '0-1',
            node: false,
            type: 'Section',
            props: {
              children: [
                { selector: '0-1-0', node: false, type: 'Image', props: { src: '', alt: 'Product Image', objectFit: 'cover', radiusType: 'rounded' } },
                { selector: '0-1-1', node: false, type: 'Text', props: { verbiage: 'Product Name', tagType: 'heading_1', textAlign: 'left', color: '' } },
                { selector: '0-1-2', node: false, type: 'Text', props: { verbiage: 'Describe your product in detail. Highlight key features and benefits.', tagType: 'paragraph_1', textAlign: 'left', color: '' } },
                { selector: '0-1-3', node: false, type: 'ProductEmbed', props: { productId: '', productName: '' } },
              ],
              rows: { lg: 12, sm: 12 },
            },
          },
          { selector: '0-2', node: false, type: 'Footer', props: {} },
        ],
      },
    },
    theme: {
      colorPalette: { color1: '#ea580c', color2: '#fb923c', color3: '#fff7ed', color4: '#431407', color5: '#ffffff' },
    },
  },
];

const CATEGORY_ICONS: Record<string, typeof RectangleGroupIcon> = {
  landing: RectangleGroupIcon,
  portfolio: PhotoIcon,
  contact: PhoneIcon,
  product: CubeIcon,
  blank: DocumentIcon,
};

interface TemplateSelectorProps {
  onSelect: (structure: PageComponentNode, theme: PageTheme, templateName: string) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { templates: apiTemplates, loading } = usePageTemplates();

  const allTemplates = [
    ...BUILT_IN_TEMPLATES.map((t) => ({
      id: `builtin-${t.name}`,
      name: t.name,
      category: t.category,
      description: t.description,
      structure: t.structure,
      theme: t.theme,
      isBuiltIn: true,
    })),
    ...apiTemplates.map((t) => ({
      id: t.id,
      name: t.attributes.name,
      category: t.attributes.category || 'blank',
      description: t.attributes.description || '',
      structure: t.attributes.structure as PageComponentNode,
      theme: t.attributes.theme,
      isBuiltIn: false,
    })),
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Choose a Template</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Start with a template or begin from scratch. You can customize everything after.
      </p>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTemplates.map((template) => {
          const Icon = CATEGORY_ICONS[template.category] || DocumentIcon;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.structure, template.theme, template.name)}
              className="text-left p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{template.category}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
              {/* Color preview */}
              {template.theme.colorPalette && (
                <div className="flex space-x-1 mt-3">
                  {Object.values(template.theme.colorPalette).filter(Boolean).slice(0, 5).map((color, i) => (
                    <div key={i} className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: color as string }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

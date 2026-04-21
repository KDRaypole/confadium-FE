import { usePageBuilder, DEFAULT_COMPONENTS } from "./PageBuilderContext";
import {
  Bars3BottomLeftIcon,
  PhotoIcon,
  CursorArrowRaysIcon,
  VideoCameraIcon,
  MinusIcon,
  ListBulletIcon,
  ChevronDownIcon,
  StarIcon,
  Square2StackIcon,
  DocumentTextIcon,
  CubeIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";

const PALETTE_ITEMS = [
  { type: 'Section', label: 'Section', icon: RectangleGroupIcon, description: 'Layout section with grid' },
  { type: 'Text', label: 'Text', icon: Bars3BottomLeftIcon, description: 'Headings and paragraphs' },
  { type: 'Image', label: 'Image', icon: PhotoIcon, description: 'Photo or graphic' },
  { type: 'Button', label: 'Button', icon: CursorArrowRaysIcon, description: 'Call to action button' },
  { type: 'Video', label: 'Video', icon: VideoCameraIcon, description: 'Embedded video' },
  { type: 'Divider', label: 'Divider', icon: MinusIcon, description: 'Horizontal divider' },
  { type: 'List', label: 'List', icon: ListBulletIcon, description: 'Bulleted list' },
  { type: 'Accordion', label: 'Accordion', icon: ChevronDownIcon, description: 'Collapsible sections' },
  { type: 'Icon', label: 'Icon', icon: StarIcon, description: 'Icon element' },
  { type: 'Box', label: 'Box', icon: Square2StackIcon, description: 'Container with background' },
  { type: 'FormEmbed', label: 'Form', icon: DocumentTextIcon, description: 'Embed a CRM form' },
  { type: 'ProductEmbed', label: 'Product', icon: CubeIcon, description: 'Embed a product card' },
];

interface ComponentPaletteProps {
  targetSelector?: string;
}

export default function ComponentPalette({ targetSelector }: ComponentPaletteProps) {
  const { addComponent, structure } = usePageBuilder();

  const handleAdd = (type: string) => {
    // Find the first section to add to, or add to root
    const target = targetSelector || findFirstSection() || '0';
    addComponent(target, type);
  };

  const findFirstSection = (): string | null => {
    if (!structure?.props.children) return null;
    const children = structure.props.children as { selector: string; type: string }[];
    const section = children.find(c => c.type === 'Section');
    return section?.selector || null;
  };

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
        Components
      </h3>
      {PALETTE_ITEMS.map((item) => (
        <button
          key={item.type}
          onClick={() => handleAdd(item.type)}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <div className="text-left">
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

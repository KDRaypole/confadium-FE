import { usePageBuilder } from "./PageBuilderContext";
import type { PageComponentNode } from "~/lib/api/types";
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
  PlusIcon,
  CheckIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";

/** Content items that go INSIDE sections (via grid) */
const CONTENT_ITEMS = [
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
  { type: 'Carousel', label: 'Carousel', icon: ViewColumnsIcon, description: 'Image & text carousel slider' },
];

export default function ComponentPalette() {
  const { structure, addComponent, addToSection, selectedSelector, getComponent, select } = usePageBuilder();

  const rootChildren = (structure?.props.children as PageComponentNode[]) || [];
  const sections = rootChildren.filter((c) => c.type === 'Section');

  // Find which section is targeted for adding content
  const getTargetSectionSelector = (): string | null => {
    if (selectedSelector) {
      // If a section itself is selected
      const selected = getComponent(selectedSelector);
      if (selected?.type === 'Section') return selected.selector;

      // If a child of a section is selected, find the parent section
      for (const section of sections) {
        const sectionChildren = (section.props.children as PageComponentNode[]) || [];
        if (sectionChildren.some((c) => c.selector === selectedSelector)) {
          return section.selector;
        }
      }
    }
    // Default to first section
    return sections[0]?.selector || null;
  };

  const targetSelector = getTargetSectionSelector();
  const targetIndex = sections.findIndex((s) => s.selector === targetSelector);

  const handleAddContent = (type: string) => {
    if (!targetSelector) {
      // No sections exist — create one first, then the structure will update and they can add next click
      addComponent('0', 'Section');
      return;
    }
    addToSection(targetSelector, type);
  };

  const handleAddSection = () => {
    addComponent('0', 'Section');
  };

  const handleSelectSection = (selector: string) => {
    select(selector);
  };

  return (
    <div className="space-y-4">
      {/* Layout — add section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
          Layout
        </h3>
        <button
          onClick={handleAddSection}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <RectangleGroupIcon className="h-5 w-5 flex-shrink-0" />
          <div className="text-left">
            <div className="font-medium">Add Section</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">New content section with grid</div>
          </div>
        </button>
      </div>

      {/* Section picker — choose which section to add content to */}
      {sections.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
            Target Section
          </h3>
          <div className="space-y-1 px-1">
            {sections.map((section, i) => {
              const childCount = ((section.props.children as PageComponentNode[]) || []).length;
              const isTarget = section.selector === targetSelector;
              return (
                <button
                  key={section.selector}
                  onClick={() => handleSelectSection(section.selector)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs transition-colors ${
                    isTarget
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isTarget && <CheckIcon className="h-3 w-3" />}
                    Section {i + 1}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {childCount} item{childCount !== 1 ? 's' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content components — click to add to target section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
          Content
        </h3>
        {sections.length === 0 && (
          <p className="px-3 text-xs text-gray-400 dark:text-gray-500 mb-2">
            Add a section first, then add content to it.
          </p>
        )}
        <div className="space-y-0.5">
          {CONTENT_ITEMS.map((item) => (
            <button
              key={item.type}
              onClick={() => handleAddContent(item.type)}
              disabled={sections.length === 0}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <div className="text-left flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
              </div>
              <PlusIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

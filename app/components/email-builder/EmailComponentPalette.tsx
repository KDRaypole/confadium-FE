import { useEmailBuilder } from "./EmailBuilderContext";
import {
  PhotoIcon,
  CursorArrowRaysIcon,
  MinusIcon,
  Bars3BottomLeftIcon,
  RectangleGroupIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  EnvelopeIcon,
  ArrowsUpDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const PALETTE_ITEMS = [
  { type: 'EmailHeader', label: 'Header', icon: EnvelopeIcon, desc: 'Logo and preheader' },
  { type: 'EmailText', label: 'Text', icon: Bars3BottomLeftIcon, desc: 'Paragraph or heading' },
  { type: 'EmailImage', label: 'Image', icon: PhotoIcon, desc: 'Responsive image' },
  { type: 'EmailButton', label: 'Button', icon: CursorArrowRaysIcon, desc: 'Call-to-action button' },
  { type: 'EmailDivider', label: 'Divider', icon: MinusIcon, desc: 'Horizontal line' },
  { type: 'EmailSpacer', label: 'Spacer', icon: ArrowsUpDownIcon, desc: 'Vertical spacing' },
  { type: 'EmailColumns', label: 'Columns', icon: RectangleGroupIcon, desc: '2–3 column layout' },
  { type: 'EmailSocial', label: 'Social', icon: GlobeAltIcon, desc: 'Social media links' },
  { type: 'EmailFooter', label: 'Footer', icon: EnvelopeIcon, desc: 'Unsubscribe & legal' },
  { type: 'EmailHtml', label: 'HTML', icon: CodeBracketIcon, desc: 'Raw HTML block' },
];

export default function EmailComponentPalette() {
  const { addComponent, selectedId } = useEmailBuilder();

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
        Email Components
      </h3>
      {PALETTE_ITEMS.map((item) => (
        <button
          key={item.type}
          onClick={() => addComponent(item.type, selectedId || undefined)}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <div className="text-left flex-1">
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
          </div>
          <PlusIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}

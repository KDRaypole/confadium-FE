import { useState, useCallback } from "react";
import { PageBuilderProvider, usePageBuilder } from "./PageBuilderContext";
import ComponentRenderer from "./ComponentRenderer";
import ComponentPalette from "./ComponentPalette";
import ComponentEditor from "./ComponentEditor";
import ThemeEditor from "./ThemeEditor";
import type { PageComponentNode, PageTheme } from "~/lib/api/types";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  PaintBrushIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
  EyeIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";

type SidebarTab = 'components' | 'properties' | 'theme';

interface PageBuilderProps {
  initialStructure: PageComponentNode | null;
  initialTheme: PageTheme;
  onSave: (structure: PageComponentNode | null, theme: PageTheme) => void;
  saving?: boolean;
  websiteId?: string;
  pageId?: string;
}

export default function PageBuilder({ initialStructure, initialTheme, onSave, saving, websiteId, pageId }: PageBuilderProps) {
  const [currentStructure, setCurrentStructure] = useState<PageComponentNode | null>(initialStructure);
  const [currentTheme, setCurrentTheme] = useState<PageTheme>(initialTheme);

  const handleChange = useCallback((structure: PageComponentNode | null, theme: PageTheme) => {
    setCurrentStructure(structure);
    setCurrentTheme(theme);
  }, []);

  return (
    <PageBuilderProvider initialStructure={initialStructure} initialTheme={initialTheme} onChange={handleChange} websiteId={websiteId} pageId={pageId}>
      <BuilderLayout onSave={() => onSave(currentStructure, currentTheme)} saving={saving} />
    </PageBuilderProvider>
  );
}

function BuilderLayout({ onSave, saving }: { onSave: () => void; saving?: boolean }) {
  const { structure, device, setDevice, undo, redo, canUndo, canRedo, selectedSelector, showGrid, setShowGrid, editMode, setEditMode, select } = usePageBuilder();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('components');

  const togglePreview = () => {
    if (editMode) {
      // Entering preview: disable edit mode, deselect, hide grid
      select(null);
      setEditMode(false);
    } else {
      // Leaving preview: re-enable edit mode
      setEditMode(true);
    }
  };

  // Auto-switch to properties when a content component is selected.
  const isSelectedSection = (() => {
    if (!selectedSelector || !structure) return false;
    const rootChildren = (structure.props.children as PageComponentNode[]) || [];
    return rootChildren.some(c => c.selector === selectedSelector && c.type === 'Section');
  })();

  const activeTab = selectedSelector && sidebarTab === 'components' && !isSelectedSection
    ? 'properties'
    : sidebarTab;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {editMode && (
            <>
              <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Undo">
                <ArrowUturnLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30" title="Redo">
                <ArrowUturnRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />
            </>
          )}

          {/* Device toggle */}
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded ${device === 'desktop' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            <ComputerDesktopIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded ${device === 'mobile' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            <DevicePhoneMobileIcon className="h-4 w-4" />
          </button>

          {editMode && (
            <>
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-2" />
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 rounded ${showGrid ? 'bg-purple-100 dark:bg-purple-900 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                title={showGrid ? 'Hide grid' : 'Show grid'}
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePreview}
            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md ${
              !editMode ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            {!editMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — hidden in preview */}
        {editMode && (
          <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button onClick={() => setSidebarTab('components')} className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'components' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <Squares2X2Icon className="h-4 w-4 mx-auto mb-0.5" /> Add
              </button>
              <button onClick={() => setSidebarTab('properties')} className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'properties' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <Cog6ToothIcon className="h-4 w-4 mx-auto mb-0.5" /> Edit
              </button>
              <button onClick={() => setSidebarTab('theme')} className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'theme' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <PaintBrushIcon className="h-4 w-4 mx-auto mb-0.5" /> Theme
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {activeTab === 'components' && <ComponentPalette />}
              {activeTab === 'properties' && <ComponentEditor />}
              {activeTab === 'theme' && <ThemeEditor />}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className={`flex-1 overflow-y-auto ${editMode ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-950'}`}>
          <div
            className={`mx-auto transition-all ${
              device === 'mobile' ? 'max-w-[375px]' : editMode ? 'max-w-[1280px]' : ''
            } ${editMode ? 'p-4' : ''}`}
          >
            <div className={`bg-white dark:bg-gray-800 ${editMode ? 'shadow-lg rounded-lg overflow-hidden' : ''} min-h-[600px]`}>
              {structure ? (
                <ComponentRenderer node={structure} />
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-400">
                  <p>No page structure. Start by adding components.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

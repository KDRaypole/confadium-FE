import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { EmailBuilderProvider, useEmailBuilder } from "./EmailBuilderContext";
import EmailComponentRenderer from "./EmailComponentRenderer";
import EmailComponentPalette from "./EmailComponentPalette";
import EmailComponentEditor from "./EmailComponentEditor";
import EmailThemeEditor from "./EmailThemeEditor";
import EmailVariablesPanel from "./EmailVariablesPanel";
import type { EmailComponentNode, EmailTheme } from "~/lib/api/types";
import { compileEmailHtml, compileEmailText } from "~/lib/email/compiler";
import { parseEmailHtml, isBuilderHtml, extractVariablesFromComponents } from "~/lib/email/parser";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EyeIcon,
  Squares2X2Icon,
  PaintBrushIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  VariableIcon,
} from "@heroicons/react/24/outline";

type EditorMode = 'visual' | 'preview';
type SidebarTab = 'components' | 'properties' | 'theme' | 'variables';
type PreviewDevice = 'desktop' | 'mobile';

interface EmailBuilderProps {
  initialComponents: EmailComponentNode[];
  initialTheme: EmailTheme;
  initialHtmlContent: string;
  onSave: (data: { html_content: string; text_content: string; structure: EmailComponentNode[]; theme: EmailTheme; variables: string[] }) => void;
  saving?: boolean;
}

export default function EmailBuilder({ initialComponents, initialTheme, initialHtmlContent, onSave, saving }: EmailBuilderProps) {
  // Ensure initialComponents is always an array
  const safeInitialComponents = Array.isArray(initialComponents) ? initialComponents : [];
  const safeInitialTheme = initialTheme || {};

  // If no components provided but HTML exists, try to parse components from HTML
  const [parsedData] = useState(() => {
    if (safeInitialComponents.length === 0 && initialHtmlContent && isBuilderHtml(initialHtmlContent)) {
      const parsed = parseEmailHtml(initialHtmlContent);
      if (parsed && parsed.components.length > 0) {
        return parsed;
      }
    }
    return null;
  });

  const [components, setComponents] = useState<EmailComponentNode[]>(
    parsedData?.components || safeInitialComponents
  );
  const [emailTheme, setEmailTheme] = useState<EmailTheme>(
    parsedData?.theme || safeInitialTheme
  );

  // Initialize rawHtml from initialHtmlContent OR compile from components
  const [rawHtml, setRawHtml] = useState(() => {
    // If we have HTML content, use it
    if (initialHtmlContent) {
      return initialHtmlContent;
    }
    // Otherwise compile from components (for new templates or when structure exists but no HTML)
    const comps = parsedData?.components || safeInitialComponents;
    const theme = parsedData?.theme || safeInitialTheme;
    if (comps.length > 0) {
      return compileEmailHtml(comps, theme);
    }
    return '';
  });
  const [mode, setMode] = useState<EditorMode>('visual');

  // Track if we've received HTML content (for async loading)
  const hasInitializedRef = useRef(!!initialHtmlContent || safeInitialComponents.length > 0);

  // Handle async template loading - update state when initialHtmlContent arrives
  useEffect(() => {
    // Only run if we haven't initialized yet and now have content
    if (!hasInitializedRef.current && initialHtmlContent) {
      hasInitializedRef.current = true;

      // Try to parse components from HTML
      if (isBuilderHtml(initialHtmlContent)) {
        const parsed = parseEmailHtml(initialHtmlContent);
        if (parsed && parsed.components.length > 0) {
          setComponents(parsed.components);
          setEmailTheme(parsed.theme);
          setRawHtml(initialHtmlContent);
          return;
        }
      }

      // If we can't parse, just set the raw HTML
      setRawHtml(initialHtmlContent);
    }
  }, [initialHtmlContent]);

  const handleBuilderChange = useCallback((comps: EmailComponentNode[], theme: EmailTheme) => {
    setComponents(comps);
    setEmailTheme(theme);
    // Keep raw HTML in sync
    setRawHtml(compileEmailHtml(comps, theme));
  }, []);

  const handleSave = useCallback(() => {
    const html = compileEmailHtml(components, emailTheme);
    const text = compileEmailText(components);
    const variables = extractVariablesFromComponents(components);
    onSave({ html_content: html, text_content: text, structure: components, theme: emailTheme, variables });
  }, [components, emailTheme, onSave]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Mode toggle toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
          <button
            onClick={() => setMode('visual')}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded ${mode === 'visual' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Squares2X2Icon className="h-3.5 w-3.5 mr-1" /> Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded ${mode === 'preview' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <EyeIcon className="h-3.5 w-3.5 mr-1" /> Preview
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {mode === 'visual' && (
          <EmailBuilderProvider initialComponents={components} initialTheme={emailTheme} onChange={handleBuilderChange}>
            <VisualBuilder />
          </EmailBuilderProvider>
        )}
        {mode === 'preview' && (
          <EmailPreview html={rawHtml} />
        )}
      </div>
    </div>
  );
}

function VisualBuilder() {
  const { undo, redo, canUndo, canRedo, selectedId, theme, components } = useEmailBuilder();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('components');

  const activeTab = selectedId && sidebarTab === 'components' ? 'properties' : sidebarTab;

  // Count detected variables for badge
  const variableCount = useMemo(() => {
    return extractVariablesFromComponents(components).length;
  }, [components]);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setSidebarTab('components')} className={`flex-1 px-2 py-2 text-xs font-medium ${activeTab === 'components' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <Squares2X2Icon className="h-4 w-4 mx-auto mb-0.5" /> Add
          </button>
          <button onClick={() => setSidebarTab('properties')} className={`flex-1 px-2 py-2 text-xs font-medium ${activeTab === 'properties' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <Cog6ToothIcon className="h-4 w-4 mx-auto mb-0.5" /> Edit
          </button>
          <button onClick={() => setSidebarTab('theme')} className={`flex-1 px-2 py-2 text-xs font-medium ${activeTab === 'theme' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <PaintBrushIcon className="h-4 w-4 mx-auto mb-0.5" /> Theme
          </button>
          <button onClick={() => setSidebarTab('variables')} className={`flex-1 px-2 py-2 text-xs font-medium relative ${activeTab === 'variables' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <VariableIcon className="h-4 w-4 mx-auto mb-0.5" />
            <span className="flex items-center justify-center">
              Vars
              {variableCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                  {variableCount}
                </span>
              )}
            </span>
          </button>
        </div>
        <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100 dark:border-gray-700">
          <div className="flex space-x-1">
            <button onClick={undo} disabled={!canUndo} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" title="Undo"><ArrowUturnLeftIcon className="h-3.5 w-3.5 text-gray-500" /></button>
            <button onClick={redo} disabled={!canRedo} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" title="Redo"><ArrowUturnRightIcon className="h-3.5 w-3.5 text-gray-500" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'components' && <EmailComponentPalette />}
          {activeTab === 'properties' && <EmailComponentEditor />}
          {activeTab === 'theme' && <EmailThemeEditor />}
          {activeTab === 'variables' && <EmailVariablesPanel />}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="max-w-[640px] mx-auto p-4">
          <div style={{ backgroundColor: theme.bodyBg || '#f4f4f5', padding: '20px 10px', borderRadius: '8px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: theme.contentBg || '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
              <EmailComponentRenderer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ html }: { html: string }) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center justify-center py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={() => setDevice('desktop')}
          className={`p-1.5 rounded ${device === 'desktop' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <ComputerDesktopIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setDevice('mobile')}
          className={`p-1.5 rounded ml-1 ${device === 'mobile' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <DevicePhoneMobileIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 flex justify-center items-start p-4 overflow-auto">
        <iframe
          srcDoc={html}
          title="Email Preview"
          style={{
            width: device === 'mobile' ? '375px' : '620px',
            minHeight: '500px',
            height: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          }}
          sandbox="allow-same-origin allow-popups"
        />
      </div>
    </div>
  );
}

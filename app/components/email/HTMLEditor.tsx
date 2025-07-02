import { useState, useRef, useEffect } from "react";
import { 
  CodeBracketIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

interface HTMLEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  isDarkMode?: boolean;
}

export default function HTMLEditor({
  value,
  onChange,
  placeholder = "Enter HTML content...",
  height = "300px",
  isDarkMode = false
}: HTMLEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Update line numbers when content changes
  useEffect(() => {
    const lines = value.split('\n');
    const numbers = lines.map((_, index) => (index + 1).toString());
    setLineNumbers(numbers);
  }, [value]);

  // Search functionality
  useEffect(() => {
    if (searchTerm && value) {
      const regex = new RegExp(searchTerm, 'gi');
      const matches = value.match(regex);
      setTotalMatches(matches ? matches.length : 0);
      setCurrentMatch(matches && matches.length > 0 ? 1 : 0);
    } else {
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  }, [searchTerm, value]);

  const highlightSyntax = (code: string) => {
    // Basic HTML syntax highlighting
    return code
      .replace(/(&lt;)([^&\s]*?)(&gt;)/g, '<span class="text-blue-600 dark:text-blue-400">$1$2$3</span>')
      .replace(/(\{\{[^}]*\}\})/g, '<span class="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1 rounded">$1</span>')
      .replace(/(style=)(["'][^"']*["'])/g, '$1<span class="text-green-600 dark:text-green-400">$2</span>')
      .replace(/(class=)(["'][^"']*["'])/g, '$1<span class="text-yellow-600 dark:text-yellow-400">$2</span>');
  };

  const insertTemplate = (template: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + template + value.substring(end);
      onChange(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + template.length, start + template.length);
      }, 0);
    }
  };

  const formatHTML = () => {
    // Basic HTML formatting
    let formatted = value
      .replace(/></g, '>\n<')
      .replace(/^\s+|\s+$/gm, ''); // Remove leading/trailing whitespace
    
    // Add proper indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indentedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return '';
      
      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indented = '  '.repeat(indentLevel) + trimmed;
      
      // Increase indent for opening tags (but not self-closing or closing tags)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indentLevel++;
      }
      
      return indented;
    });
    
    onChange(indentedLines.join('\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
  };

  const goToNextMatch = () => {
    if (totalMatches > 0) {
      setCurrentMatch(currentMatch >= totalMatches ? 1 : currentMatch + 1);
    }
  };

  const goToPrevMatch = () => {
    if (totalMatches > 0) {
      setCurrentMatch(currentMatch <= 1 ? totalMatches : currentMatch - 1);
    }
  };

  const quickInserts = [
    { name: "Button", code: '<a href="{{link_url}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">{{button_text}}</a>' },
    { name: "Header", code: '<h1 style="color: #333; text-align: center; margin: 20px 0;">{{header_text}}</h1>' },
    { name: "Paragraph", code: '<p style="color: #666; line-height: 1.6; margin: 16px 0;">{{paragraph_text}}</p>' },
    { name: "Image", code: '<img src="{{image_url}}" alt="{{alt_text}}" style="max-width: 100%; height: auto; border-radius: 8px;">' },
    { name: "Divider", code: '<hr style="border: none; height: 1px; background: #ddd; margin: 30px 0;">' },
    { name: "Container", code: '<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">\n  {{content}}\n</div>' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded ${
              showPreview
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            {showPreview ? "Code" : "Preview"}
          </button>
          <button
            onClick={formatHTML}
            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500"
          >
            <CodeBracketIcon className="h-3 w-3 mr-1" />
            Format
          </button>
          <button
            onClick={() => setSearchVisible(!searchVisible)}
            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500"
          >
            <MagnifyingGlassIcon className="h-3 w-3 mr-1" />
            Find
          </button>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500"
          >
            <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
            Copy
          </button>
        </div>
        
        {/* Quick Insert Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value) {
                insertTemplate(e.target.value);
                e.target.value = "";
              }
            }}
            className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded px-2 py-1"
          >
            <option value="">Insert Element...</option>
            {quickInserts.map((item) => (
              <option key={item.name} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      {searchVisible && (
        <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/20">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search in code..."
            className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          {totalMatches > 0 && (
            <div className="flex items-center space-x-2 ml-3">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {currentMatch}/{totalMatches}
              </span>
              <button
                onClick={goToPrevMatch}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <ChevronUpIcon className="h-3 w-3" />
              </button>
              <button
                onClick={goToNextMatch}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <ChevronDownIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          <button
            onClick={() => setSearchVisible(false)}
            className="ml-2 p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative" style={{ height }}>
        {showPreview ? (
          // Safe HTML Preview using iframe
          <iframe
            ref={previewRef}
            srcDoc={value}
            className="w-full h-full border-0 bg-white"
            title="HTML Preview"
            sandbox="allow-same-origin"
          />
        ) : (
          // Code Editor
          <div className="flex h-full">
            {/* Line Numbers */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 px-3 py-3 border-r border-gray-200 dark:border-gray-600">
              <div className="text-xs font-mono text-gray-500 dark:text-gray-400 leading-5">
                {lineNumbers.map((num, index) => (
                  <div key={index} className="text-right">
                    {num}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Code Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full p-3 bg-transparent border-0 resize-none outline-none text-sm font-mono text-gray-900 dark:text-gray-100 leading-5"
                spellCheck={false}
                style={{
                  tabSize: 2,
                  MozTabSize: 2,
                }}
                onKeyDown={(e) => {
                  // Handle tab indentation
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const textarea = e.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newValue = value.substring(0, start) + '  ' + value.substring(end);
                    onChange(newValue);
                    setTimeout(() => {
                      textarea.setSelectionRange(start + 2, start + 2);
                    }, 0);
                  }
                }}
              />
              
              {/* Syntax Highlighting Overlay */}
              <div
                className="absolute inset-0 p-3 pointer-events-none text-sm font-mono leading-5 whitespace-pre-wrap break-words"
                style={{ color: 'transparent' }}
                dangerouslySetInnerHTML={{
                  __html: highlightSyntax(value.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Lines: {lineNumbers.length}</span>
          <span>Characters: {value.length}</span>
          {searchTerm && totalMatches > 0 && (
            <span>Matches: {totalMatches}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Use variable_name for variables • Tab for indent • Ctrl+/ for format
        </div>
      </div>
    </div>
  );
}
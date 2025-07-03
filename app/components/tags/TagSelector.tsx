import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getTagColorClass } from '~/components/tags/TagsData';
import { useTags } from '~/hooks/useTags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxTags?: number;
}

export default function TagSelector({
  selectedTags = [],
  onTagsChange,
  placeholder = "Select tags...",
  className = "",
  disabled = false,
  multiple = true,
  maxTags
}: TagSelectorProps) {
  const { tags: availableTags, incrementUsage } = useTags();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available tags based on search term and already selected tags
  const filteredTags = availableTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const notSelected = !selectedTags.includes(tag.name);
    return matchesSearch && notSelected;
  });

  const handleTagSelect = async (tagName: string) => {
    if (disabled) return;

    let newTags: string[];
    
    if (multiple) {
      if (maxTags && selectedTags.length >= maxTags) {
        return; // Don't add more tags if at max
      }
      newTags = [...selectedTags, tagName];
    } else {
      newTags = [tagName];
      setIsOpen(false);
    }

    onTagsChange(newTags);

    // Increment usage count
    const tag = availableTags.find(t => t.name === tagName);
    if (tag) {
      await incrementUsage(tag.id);
    }

    setSearchTerm('');
    if (!multiple) {
      setIsOpen(false);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    if (disabled) return;
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  const getSelectedTagData = (tagName: string) => {
    return availableTags.find(tag => tag.name === tagName);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags Display */}
      {multiple && selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selectedTags.map(tagName => {
            const tagData = getSelectedTagData(tagName);
            return (
              <span
                key={tagName}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  tagData ? getTagColorClass(tagData.color) : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {tagName}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tagName)}
                    className="ml-1 inline-flex items-center p-0.5 rounded-full hover:bg-black/10 focus:outline-none"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-700 px-3 py-2 text-left shadow-sm
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          hover:border-gray-400 dark:hover:border-gray-500
          ${disabled 
            ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400' 
            : ''
          }
          ${isOpen ? 'ring-1 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <span className="block truncate text-sm text-gray-900 dark:text-gray-100">
          {!multiple && selectedTags.length > 0 
            ? selectedTags[0]
            : multiple && selectedTags.length > 0 
            ? `${selectedTags.length} tag${selectedTags.length === 1 ? '' : 's'} selected`
            : placeholder
          }
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {/* Search Input */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-2 py-1 text-sm border-gray-300 dark:border-gray-600 rounded border bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Tag Options */}
          <div className="max-h-60 overflow-auto">
            {filteredTags.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No tags found' : 'No available tags'}
              </div>
            ) : (
              filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagSelect(tag.name)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColorClass(tag.color)}`}>
                      {tag.name}
                    </span>
                    {tag.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {tag.description}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    Used {tag.usageCount} times
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {multiple && selectedTags.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-600 px-3 py-2">
              <button
                type="button"
                onClick={() => onTagsChange([])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear all tags
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
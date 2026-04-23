import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface SimpleSelectOption {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  options: SimpleSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SimpleSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  size = 'md'
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; openUp: boolean }>({ top: 0, left: 0, width: 0, openUp: false });

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownMaxHeight = 248;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownMaxHeight && rect.top > dropdownMaxHeight;

    setPosition({
      top: openUp ? rect.top : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUp,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, updatePosition]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updatePosition();
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Detect dark mode from the root element to pass to the portal
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className={`relative ${className}`}>
      {/* Select Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative w-full cursor-pointer rounded-md border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-700 text-left shadow-sm
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          hover:border-gray-400 dark:hover:border-gray-500
          ${sizeClasses[size]}
          ${disabled
            ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            : ''
          }
          ${isOpen ? 'ring-1 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <span className={`block truncate ${!value ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
          {displayValue}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon
            className={`${iconSizeClasses[size]} text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {/* Dropdown - portal with dark class wrapper */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className={isDark ? 'dark' : ''}>
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              left: position.left,
              width: Math.max(position.width, 80),
              zIndex: 9999,
              ...(position.openUp
                ? { bottom: window.innerHeight - position.top + 4, top: 'auto' }
                : { top: position.top }
              ),
            }}
            className="rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto"
          >
            {options.map((option) => {
              const isSelected = value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-left text-sm
                    transition-colors duration-150
                    ${isSelected
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                    {option.label}
                  </span>

                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

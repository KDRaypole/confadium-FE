import { useState } from 'react';
import { ShareIcon, ClipboardDocumentIcon, CheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ShareLinkButtonProps {
  url: string;
  title?: string;
  iconOnly?: boolean;
  className?: string;
}

export default function ShareLinkButton({ url, title = "Share Link", iconOnly = true, className }: ShareLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className={className || "text-brand-primary hover:text-brand-primary-hover"}
        title={title}
      >
        {iconOnly ? (
          <ShareIcon className="h-4 w-4" />
        ) : (
          <span className="inline-flex items-center">
            <ShareIcon className="h-4 w-4 mr-1.5" />
            Share
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => { setIsOpen(false); setCopied(false); }}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" />

            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-primary/10 mx-auto">
                <ShareIcon className="h-6 w-6 text-brand-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100 text-center">{title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Copy the link below to share. Anyone with the link can view it.
              </p>

              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-hover transition-colors"
                >
                  {copied ? (
                    <><CheckIcon className="h-4 w-4 mr-1" /> Copied!</>
                  ) : (
                    <><ClipboardDocumentIcon className="h-4 w-4 mr-1" /> Copy</>
                  )}
                </button>
              </div>

              <div className="mt-4 flex justify-between">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-brand-primary hover:text-brand-primary-hover"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                  Open in new tab
                </a>
                <button
                  onClick={() => { setIsOpen(false); setCopied(false); }}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

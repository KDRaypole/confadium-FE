import {
  ClipboardDocumentIcon,
  TagIcon,
  EnvelopeIcon,
  PencilIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import type { Resource } from '~/lib/api/client';
import type { EventLogAttributes } from '~/lib/api/types';

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'clipboard': ClipboardDocumentIcon,
  'tag': TagIcon,
  'envelope': EnvelopeIcon,
  'pencil': PencilIcon,
  'currency-dollar': CurrencyDollarIcon,
  'user-plus': UserPlusIcon,
  'bolt': BoltIcon,
};

const statusColors: Record<string, string> = {
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  skipped: 'bg-gray-400',
};

interface EventTimelineItemProps {
  log: Resource<EventLogAttributes>;
  isLast: boolean;
  onClick: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function EventTimelineItem({ log, isLast, onClick }: EventTimelineItemProps) {
  const Icon = iconMap[log.attributes.icon] || BoltIcon;
  const statusColor = statusColors[log.attributes.status] || 'bg-gray-400';

  return (
    <li>
      <div className="relative pb-8">
        {!isLast && (
          <span
            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
            aria-hidden="true"
          />
        )}
        <div className="relative flex space-x-3">
          <div>
            <span
              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${statusColor}`}
            >
              <Icon className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
            <div className="min-w-0 flex-1">
              <button
                onClick={onClick}
                className="text-sm text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 hover:underline text-left truncate block w-full"
              >
                {log.attributes.description}
              </button>
              {log.attributes.error_message && (
                <p className="text-xs text-red-500 mt-0.5 truncate">
                  {log.attributes.error_message}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                {log.attributes.configuration_name}
              </p>
            </div>
            <div className="whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(log.attributes.executed_at)}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

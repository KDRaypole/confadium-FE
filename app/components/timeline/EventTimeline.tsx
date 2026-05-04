import { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useEventLogs } from '~/hooks/useEventLogs';
import { EventTimelineItem } from './EventTimelineItem';
import { EventLogDetailModal } from './EventLogDetailModal';
import type { Resource } from '~/lib/api/client';
import type { EventLogAttributes } from '~/lib/api/types';

interface EventTimelineProps {
  entityType: 'contacts' | 'deals' | 'activities';
  entityId: string;
  maxItems?: number;
}

export default function EventTimeline({ entityType, entityId, maxItems = 5 }: EventTimelineProps) {
  const { eventLogs, loading, error } = useEventLogs(entityType, entityId);
  const [selectedLog, setSelectedLog] = useState<Resource<EventLogAttributes> | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayLogs = showAll ? eventLogs : eventLogs.slice(0, maxItems);
  const hasMore = eventLogs.length > maxItems;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-sm text-red-500 dark:text-red-400">
        Failed to load automation history
      </div>
    );
  }

  if (eventLogs.length === 0) {
    return (
      <div className="text-center py-6">
        <ClockIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No automation history yet
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Actions from automations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {displayLogs.map((log, idx) => (
          <EventTimelineItem
            key={log.id}
            log={log}
            isLast={idx === displayLogs.length - 1 && !hasMore}
            onClick={() => setSelectedLog(log)}
          />
        ))}
      </ul>

      {hasMore && !showAll && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            Show {eventLogs.length - maxItems} more
          </button>
        </div>
      )}

      {showAll && hasMore && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setShowAll(false)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Show less
          </button>
        </div>
      )}

      {selectedLog && (
        <EventLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

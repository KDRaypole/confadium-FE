import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  MinusCircleIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useRelatedEventLogs } from '~/hooks/useEventLogs';
import type { Resource } from '~/lib/api/client';
import type { EventLogAttributes } from '~/lib/api/types';

interface EventLogDetailModalProps {
  log: Resource<EventLogAttributes>;
  onClose: () => void;
}

const statusConfig: Record<string, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; bgColor: string; label: string }> = {
  completed: {
    icon: CheckCircleIcon,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Completed',
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Failed',
  },
  skipped: {
    icon: MinusCircleIcon,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Skipped',
  },
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function EventLogDetailModal({ log, onClose }: EventLogDetailModalProps) {
  const { relatedLogs, loading: loadingRelated } = useRelatedEventLogs(log.id, true);
  const status = statusConfig[log.attributes.status] || statusConfig.skipped;
  const StatusIcon = status.icon;

  const hasParameters = Object.keys(log.attributes.parameters || {}).length > 0;
  const hasResultData = Object.keys(log.attributes.result_data || {}).length > 0;

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${status.bgColor}`}>
                      <StatusIcon className={`h-5 w-5 ${status.color}`} />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {log.attributes.description}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {log.attributes.module_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Details */}
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Executed</dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      {formatDateTime(log.attributes.executed_at)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Action Type</dt>
                    <dd className="text-gray-900 dark:text-gray-100 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {log.attributes.action_type}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Configuration</dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      {log.attributes.configuration_name}
                    </dd>
                  </div>
                  {log.attributes.trigger_entity_type && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">Triggered By</dt>
                      <dd className="text-gray-900 dark:text-gray-100">
                        {log.attributes.trigger_entity_type} {log.attributes.trigger_action}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Parameters */}
                {hasParameters && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Parameters
                    </h4>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-32 text-gray-700 dark:text-gray-300">
                      {JSON.stringify(log.attributes.parameters, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Result Data */}
                {hasResultData && log.attributes.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Result
                    </h4>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-32 text-gray-700 dark:text-gray-300">
                      {JSON.stringify(log.attributes.result_data, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Error Message */}
                {log.attributes.error_message && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Error
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {log.attributes.error_message}
                    </p>
                  </div>
                )}

                {/* Related Actions */}
                {relatedLogs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1.5" />
                      Related Actions ({relatedLogs.length})
                    </h4>
                    <ul className="space-y-2">
                      {relatedLogs.map((related) => {
                        const relatedStatus = statusConfig[related.attributes.status];
                        const RelatedIcon = relatedStatus?.icon || MinusCircleIcon;
                        return (
                          <li
                            key={related.id}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <RelatedIcon className={`h-4 w-4 ${relatedStatus?.color || 'text-gray-400'}`} />
                            <span className="text-gray-700 dark:text-gray-300">
                              {related.attributes.description}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {loadingRelated && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Loading related actions...
                  </div>
                )}

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

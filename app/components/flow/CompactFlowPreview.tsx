import React from 'react';
import { 
  BoltIcon, 
  FunnelIcon, 
  PlayIcon, 
  ArrowRightIcon,
  PlayCircleIcon 
} from '@heroicons/react/24/outline';
import { useDarkMode } from '~/contexts/DarkModeContext';

interface FlowConfiguration {
  trigger?: {
    entityType: string;
    action: string;
    attributeFilter?: string;
  };
  conditions: Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
    logicOperator?: 'AND' | 'OR';
  }>;
  actions: Array<{
    id: string;
    type: string;
    target: string;
    parameters: Record<string, any>;
  }>;
}

interface CompactFlowPreviewProps {
  configuration: FlowConfiguration;
  className?: string;
}

const CompactFlowPreview: React.FC<CompactFlowPreviewProps> = ({
  configuration,
  className = ''
}) => {
  const { isDarkMode } = useDarkMode();
  const hasConfiguration = configuration.trigger || configuration.conditions.length > 0 || configuration.actions.length > 0;

  if (!hasConfiguration) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <PlayCircleIcon className="mx-auto h-8 w-8" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No workflow configured
          </p>
        </div>
      </div>
    );
  }

  const entityTypeLabels: Record<string, string> = {
    contact: 'Contact',
    deal: 'Deal',
    activity: 'Activity',
    email: 'Email',
    form: 'Form',
    call: 'Call'
  };

  const actionLabels: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    sent: 'Sent',
    opened: 'Opened',
    clicked: 'Clicked',
    bounced: 'Bounced',
    replied: 'Replied',
    submitted: 'Submitted',
    completed: 'Completed',
    missed: 'Missed'
  };

  const actionTypeLabels: Record<string, string> = {
    assign_lead: 'Assign Lead',
    send_email: 'Send Email',
    create_task: 'Create Task',
    update_field: 'Update Field',
    change_status: 'Change Status',
    add_tag: 'Add Tag',
    remove_tag: 'Remove Tag',
    send_notification: 'Send Notification',
    create_deal: 'Create Deal',
    schedule_followup: 'Schedule Follow-up',
    webhook: 'Send Webhook'
  };

  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      {/* Start Indicator */}
      <div className="flex-shrink-0">
        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
          <PlayCircleIcon className="h-3 w-3 text-white" />
        </div>
      </div>

      {/* Trigger */}
      {configuration.trigger && (
        <>
          <ArrowRightIcon className="h-3 w-3 text-gray-400" />
          <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            <BoltIcon className="h-3 w-3" />
            <span className="font-medium">
              {entityTypeLabels[configuration.trigger.entityType] || configuration.trigger.entityType}
            </span>
            <span>
              {actionLabels[configuration.trigger.action] || configuration.trigger.action}
            </span>
          </div>
        </>
      )}

      {/* Conditions */}
      {configuration.conditions.length > 0 && (
        <>
          <ArrowRightIcon className="h-3 w-3 text-gray-400" />
          <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            <FunnelIcon className="h-3 w-3" />
            <span className="font-medium">
              {configuration.conditions.length} condition{configuration.conditions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </>
      )}

      {/* Actions */}
      {configuration.actions.length > 0 && (
        <>
          <ArrowRightIcon className="h-3 w-3 text-gray-400" />
          <div className="flex items-center space-x-1">
            {configuration.actions.slice(0, 2).map((action, index) => (
              <div key={action.id} className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                <PlayIcon className="h-3 w-3" />
                <span className="font-medium">
                  {actionTypeLabels[action.type] || action.type}
                </span>
              </div>
            ))}
            {configuration.actions.length > 2 && (
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                +{configuration.actions.length - 2} more
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CompactFlowPreview;
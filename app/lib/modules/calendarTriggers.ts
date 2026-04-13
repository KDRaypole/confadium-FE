import { CalendarTriggerType, CalendarActionType, CalendarTriggerData, CalendarActionConfig } from '~/lib/api/calendar';

// Calendar trigger definitions for modules system
export const CALENDAR_TRIGGER_TYPES = {
  TIMESLOT_CREATED: 'timeslot_created',
  TIMESLOT_CANCELLED: 'timeslot_cancelled', 
  TIMESLOT_MOVED: 'timeslot_moved',
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  EVENT_REMINDER: 'event_reminder'
} as const;

// Calendar action types for modules system
export const CALENDAR_ACTION_TYPES = {
  CREATE_TIMESLOT: 'create_timeslot',
  CANCEL_TIMESLOT: 'cancel_timeslot',
  MOVE_TIMESLOT: 'move_timeslot',
  CREATE_EVENT: 'create_event',
  UPDATE_EVENT: 'update_event',
  SEND_NOTIFICATION: 'send_notification',
  SYNC_CALENDAR: 'sync_calendar'
} as const;

// Trigger configurations
export interface CalendarModuleTrigger {
  id: string;
  type: CalendarTriggerType;
  name: string;
  description: string;
  entityType: 'calendar_event' | 'timeslot';
  availableFields: string[];
}

export const CALENDAR_TRIGGERS: CalendarModuleTrigger[] = [
  {
    id: 'timeslot_created',
    type: 'timeslot_created',
    name: 'Timeslot Created',
    description: 'Triggered when a new timeslot is created',
    entityType: 'timeslot',
    availableFields: [
      'timeslot.id',
      'timeslot.title',
      'timeslot.start',
      'timeslot.end',
      'timeslot.calendarId',
      'timeslot.isAvailable',
      'creator.id',
      'creator.email',
      'creator.name'
    ]
  },
  {
    id: 'timeslot_cancelled',
    type: 'timeslot_cancelled',
    name: 'Timeslot Cancelled',
    description: 'Triggered when a timeslot is cancelled',
    entityType: 'timeslot',
    availableFields: [
      'timeslot.id',
      'timeslot.title',
      'timeslot.start',
      'timeslot.end',
      'timeslot.calendarId',
      'timeslot.bookingId',
      'cancellation.reason',
      'cancellation.timestamp',
      'cancelledBy.id',
      'cancelledBy.email',
      'cancelledBy.name'
    ]
  },
  {
    id: 'timeslot_moved',
    type: 'timeslot_moved',
    name: 'Timeslot Moved',
    description: 'Triggered when a timeslot is rescheduled to a different time',
    entityType: 'timeslot',
    availableFields: [
      'timeslot.id',
      'timeslot.title',
      'timeslot.start',
      'timeslot.end',
      'timeslot.calendarId',
      'previous.start',
      'previous.end',
      'movedBy.id',
      'movedBy.email',
      'movedBy.name'
    ]
  },
  {
    id: 'event_created',
    type: 'event_created',
    name: 'Event Created',
    description: 'Triggered when a new calendar event is created',
    entityType: 'calendar_event',
    availableFields: [
      'event.id',
      'event.title',
      'event.description',
      'event.start',
      'event.end',
      'event.allDay',
      'event.location',
      'event.status',
      'event.attendees',
      'event.attendees_count',
      'organizer.id',
      'organizer.email',
      'organizer.name'
    ]
  },
  {
    id: 'event_cancelled',
    type: 'event_cancelled',
    name: 'Event Cancelled',
    description: 'Triggered when a calendar event is cancelled',
    entityType: 'calendar_event',
    availableFields: [
      'event.id',
      'event.title',
      'event.description',
      'event.start',
      'event.end',
      'event.location',
      'event.attendees',
      'event.attendees_count',
      'cancellation.reason',
      'cancellation.timestamp',
      'cancelledBy.id',
      'cancelledBy.email',
      'cancelledBy.name'
    ]
  },
  {
    id: 'event_updated',
    type: 'event_updated',
    name: 'Event Updated',
    description: 'Triggered when a calendar event is modified',
    entityType: 'calendar_event',
    availableFields: [
      'event.id',
      'event.title',
      'event.description',
      'event.start',
      'event.end',
      'event.location',
      'event.attendees',
      'event.attendees_count',
      'previous.title',
      'previous.start',
      'previous.end',
      'previous.location',
      'changes.fields',
      'updatedBy.id',
      'updatedBy.email',
      'updatedBy.name'
    ]
  },
  {
    id: 'event_reminder',
    type: 'event_reminder',
    name: 'Event Reminder',
    description: 'Triggered at specified time before an event starts',
    entityType: 'calendar_event',
    availableFields: [
      'event.id',
      'event.title',
      'event.description',
      'event.start',
      'event.end',
      'event.location',
      'event.attendees',
      'event.attendees_count',
      'reminder.minutes_before',
      'reminder.type'
    ]
  }
];

// Action configurations
export interface CalendarModuleAction {
  id: string;
  type: CalendarActionType;
  name: string;
  description: string;
  parameters: {
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'email' | 'datetime';
    required: boolean;
    description: string;
    options?: string[];
    default?: any;
  }[];
}

export const CALENDAR_ACTIONS: CalendarModuleAction[] = [
  {
    id: 'create_timeslot',
    type: 'create_timeslot',
    name: 'Create Timeslot',
    description: 'Create a new available timeslot',
    parameters: [
      {
        name: 'calendarId',
        type: 'select',
        required: true,
        description: 'Calendar to create the timeslot in',
        options: [] // Will be populated with available calendars
      },
      {
        name: 'title',
        type: 'text',
        required: true,
        description: 'Title for the timeslot',
        default: 'Available Slot'
      },
      {
        name: 'duration',
        type: 'number',
        required: true,
        description: 'Duration in minutes',
        default: 60
      },
      {
        name: 'startTime',
        type: 'datetime',
        required: false,
        description: 'Start time (leave blank to use trigger time)',
      },
      {
        name: 'isAvailable',
        type: 'boolean',
        required: false,
        description: 'Make timeslot immediately available for booking',
        default: true
      }
    ]
  },
  {
    id: 'cancel_timeslot',
    type: 'cancel_timeslot',
    name: 'Cancel Timeslot',
    description: 'Cancel an existing timeslot',
    parameters: [
      {
        name: 'timeslotId',
        type: 'text',
        required: true,
        description: 'ID of timeslot to cancel (use {timeslot.id} from trigger)'
      },
      {
        name: 'reason',
        type: 'text',
        required: false,
        description: 'Reason for cancellation',
        default: 'Cancelled by automation'
      },
      {
        name: 'notifyBooker',
        type: 'boolean',
        required: false,
        description: 'Send notification to person who booked the slot',
        default: true
      }
    ]
  },
  {
    id: 'move_timeslot',
    type: 'move_timeslot',
    name: 'Move Timeslot',
    description: 'Reschedule a timeslot to a different time',
    parameters: [
      {
        name: 'timeslotId',
        type: 'text',
        required: true,
        description: 'ID of timeslot to move'
      },
      {
        name: 'newStart',
        type: 'datetime',
        required: true,
        description: 'New start time'
      },
      {
        name: 'newEnd',
        type: 'datetime',
        required: false,
        description: 'New end time (calculated from duration if not provided)'
      },
      {
        name: 'notifyBooker',
        type: 'boolean',
        required: false,
        description: 'Send notification about the change',
        default: true
      }
    ]
  },
  {
    id: 'create_event',
    type: 'create_event',
    name: 'Create Event',
    description: 'Create a new calendar event',
    parameters: [
      {
        name: 'calendarId',
        type: 'select',
        required: true,
        description: 'Calendar to create the event in',
        options: []
      },
      {
        name: 'title',
        type: 'text',
        required: true,
        description: 'Event title'
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        description: 'Event description'
      },
      {
        name: 'start',
        type: 'datetime',
        required: true,
        description: 'Event start time'
      },
      {
        name: 'end',
        type: 'datetime',
        required: true,
        description: 'Event end time'
      },
      {
        name: 'location',
        type: 'text',
        required: false,
        description: 'Event location'
      },
      {
        name: 'attendees',
        type: 'text',
        required: false,
        description: 'Comma-separated list of attendee emails'
      },
      {
        name: 'allDay',
        type: 'boolean',
        required: false,
        description: 'All-day event',
        default: false
      }
    ]
  },
  {
    id: 'update_event',
    type: 'update_event',
    name: 'Update Event',
    description: 'Update an existing calendar event',
    parameters: [
      {
        name: 'eventId',
        type: 'text',
        required: true,
        description: 'ID of event to update'
      },
      {
        name: 'title',
        type: 'text',
        required: false,
        description: 'New event title'
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        description: 'New event description'
      },
      {
        name: 'start',
        type: 'datetime',
        required: false,
        description: 'New event start time'
      },
      {
        name: 'end',
        type: 'datetime',
        required: false,
        description: 'New event end time'
      },
      {
        name: 'location',
        type: 'text',
        required: false,
        description: 'New event location'
      }
    ]
  },
  {
    id: 'send_notification',
    type: 'send_notification',
    name: 'Send Notification',
    description: 'Send notification about calendar events',
    parameters: [
      {
        name: 'recipients',
        type: 'select',
        required: true,
        description: 'Who to notify',
        options: ['organizer', 'all_attendees', 'specific_email', 'creator']
      },
      {
        name: 'specificEmail',
        type: 'email',
        required: false,
        description: 'Specific email address (if recipients = specific_email)'
      },
      {
        name: 'subject',
        type: 'text',
        required: true,
        description: 'Notification subject'
      },
      {
        name: 'message',
        type: 'text',
        required: true,
        description: 'Notification message'
      },
      {
        name: 'channels',
        type: 'select',
        required: true,
        description: 'Notification channels',
        options: ['email', 'in_app', 'sms', 'all']
      }
    ]
  },
  {
    id: 'sync_calendar',
    type: 'sync_calendar',
    name: 'Sync Calendar',
    description: 'Trigger calendar synchronization',
    parameters: [
      {
        name: 'calendarId',
        type: 'select',
        required: false,
        description: 'Specific calendar to sync (leave blank for all)',
        options: []
      },
      {
        name: 'direction',
        type: 'select',
        required: false,
        description: 'Sync direction',
        options: ['bidirectional', 'import_only', 'export_only'],
        default: 'bidirectional'
      },
      {
        name: 'conflictResolution',
        type: 'select',
        required: false,
        description: 'How to handle conflicts',
        options: ['overwrite_local', 'overwrite_remote', 'skip', 'merge'],
        default: 'skip'
      }
    ]
  }
];

// Helper function to get available trigger fields for a specific trigger type
export function getTriggerFields(triggerType: CalendarTriggerType): string[] {
  const trigger = CALENDAR_TRIGGERS.find(t => t.type === triggerType);
  return trigger?.availableFields || [];
}

// Helper function to get action parameters for a specific action type
export function getActionParameters(actionType: CalendarActionType) {
  const action = CALENDAR_ACTIONS.find(a => a.type === actionType);
  return action?.parameters || [];
}

// Helper function to validate calendar trigger data
export function validateCalendarTriggerData(triggerType: CalendarTriggerType, data: any): boolean {
  const trigger = CALENDAR_TRIGGERS.find(t => t.type === triggerType);
  if (!trigger) return false;

  // Basic validation - ensure required fields exist
  switch (triggerType) {
    case 'timeslot_created':
    case 'timeslot_cancelled':
    case 'timeslot_moved':
      return data.timeSlot && data.timeSlot.id;
    case 'event_created':
    case 'event_updated':
    case 'event_cancelled':
    case 'event_reminder':
      return data.event && data.event.id;
    default:
      return false;
  }
}

// Helper function to execute calendar actions
export async function executeCalendarAction(
  actionType: CalendarActionType,
  parameters: Record<string, any>,
  triggerData: CalendarTriggerData
): Promise<boolean> {
  // This would integrate with the actual calendar API hooks
  // For now, return a mock implementation
  console.log(`Executing calendar action: ${actionType}`, { parameters, triggerData });
  
  // Here you would call the appropriate calendar API functions
  // based on the action type and parameters
  
  return true;
}
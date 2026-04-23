/**
 * JSON:API Resource Attribute Types
 *
 * These types represent the `attributes` object inside each JSON:API resource.
 * The full resource shape is Resource<T> from ./client.ts.
 */

// ── Timestamps (mixed into every resource) ──────────────────

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// ── Organization ────────────────────────────────────────────

export interface OrganizationAttributes extends Timestamps {
  name: string;
  slug: string;
}

// ── Contact ─────────────────────────────────────────────────

export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'churned';

export interface ContactAttributes extends Timestamps {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  title: string | null;
  status: ContactStatus | null;
  source: string | null;
  notes: string | null;
  alerted: boolean;
}

// ── Deal ────────────────────────────────────────────────────

export type DealStage = 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface DealAttributes extends Timestamps {
  name: string;
  value: number | null;
  stage: DealStage | null;
  probability: number | null;
  expected_close_date: string | null;
  notes: string | null;
  alerted: boolean;
}

// ── Activity ────────────────────────────────────────────────

export type ActivityKind = 'call' | 'email' | 'meeting' | 'task' | 'note';

export interface ActivityAttributes extends Timestamps {
  kind: ActivityKind;
  subject: string;
  body: string | null;
  due_at: string | null;
  completed_at: string | null;
}

// ── Call ─────────────────────────────────────────────────────

export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'completed' | 'missed' | 'voicemail' | 'in_progress';

export interface CallAttributes extends Timestamps {
  direction: CallDirection;
  status: CallStatus;
  duration: number | null;
  recording_url: string | null;
  notes: string | null;
}

// ── Form ────────────────────────────────────────────────────

export interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
  spacing?: string;
  headerImage?: string;
  headerImageHeight?: string;
  headerImageFit?: string;
  headerImageOpacity?: number;
}

export interface FormSettings {
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  notificationEmail?: string;
  redirectUrl?: string;
  storeSubmissions?: boolean;
  requireAuth?: boolean;
  enableCaptcha?: boolean;
  submissionLimit?: number;
  submissionLimitPeriod?: string;
  startDate?: string;
  endDate?: string;
  closedMessage?: string;
  allowMultipleSubmissions?: boolean;
  showProgressBar?: boolean;
  autoSaveDraft?: boolean;
  enableMultiStage?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
  showStepIndicator?: boolean;
  allowStepNavigation?: boolean;
  obfuscateFormId?: boolean;
}

export interface ConditionalAction {
  id: string;
  triggerValue: string;
  type: 'remove_options' | 'add_options' | 'enable_options' | 'hide_question' | 'show_question' | 'end_form';
  targetFieldId?: string;
  options?: string[];
  endMessage?: string;
  endTitle?: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface StatefulAttributes {
  state: { action: string; name: string } | null;
  transitioning: { action: string; name: string } | null;
  transitions: { action: string; name: string }[];
  state_changed_at: string | null;
}

export interface FormAttributes extends Timestamps, StatefulAttributes {
  name: string;
  description: string | null;
  theme: FormTheme;
  settings: FormSettings;
  alerted: boolean;
}

export type FormFieldType = 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'url' | 'phone';

export interface FormFieldAttributes extends Timestamps {
  label: string;
  field_type: FormFieldType;
  position: number;
  required: boolean;
  options: Record<string, unknown>;
  placeholder: string | null;
  description: string | null;
  conditional_actions: ConditionalAction[];
  validation: FormFieldValidation;
}

export interface FormSubmissionAttributes extends Timestamps {
  data: Record<string, unknown>;
  submitted_at: string | null;
}

// ── Email Template ──────────────────────────────────────────

export type EmailTemplateCategory = 'welcome' | 'follow_up' | 'nurturing' | 'promotion' | 'notification' | 'reminder';

export interface EmailTheme {
  bodyBg?: string;
  contentBg?: string;
  primaryColor?: string;
  textColor?: string;
  headingColor?: string;
  linkColor?: string;
  fontFamily?: string;
  headingFontSize?: string;
  bodyFontSize?: string;
  smallFontSize?: string;
}

export interface EmailComponentNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface EmailTemplateAttributes extends Timestamps {
  name: string;
  category: EmailTemplateCategory | null;
  subject: string | null;
  html_content: string;
  text_content: string | null;
  description: string | null;
  preview_text: string | null;
  variables: string[];
  structure: EmailComponentNode[] | Record<string, unknown>;
  theme: EmailTheme;
}

// ── Automation Module ───────────────────────────────────────

export type ModuleCategory = 'automation' | 'integration' | 'notification' | 'workflow';
export type ModuleStatus = 'active' | 'inactive' | 'configured';

export interface AutomationModuleAttributes extends Timestamps {
  name: string;
  description: string | null;
  category: ModuleCategory;
  status: ModuleStatus | null;
  icon: string | null;
  trigger_types: string[];
}

export type ConfigurationStatus = 'active' | 'inactive' | 'draft';

export interface TriggerConfig {
  entityType?: string;
  action?: string;
  attributeFilter?: string;
}

export interface ConditionConfig {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: 'AND' | 'OR';
}

export interface ActionConfig {
  id: string;
  type: string;
  target?: string;
  parameters?: Record<string, unknown>;
}

export interface ModuleConfigurationAttributes extends Timestamps {
  name: string;
  description: string | null;
  trigger: TriggerConfig;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  status: ConfigurationStatus | null;
}

// ── Triggerable Schema ──────────────────────────────────────

export interface TriggerableConditionField {
  name: string;
  type: 'string' | 'select' | 'number' | 'date' | 'tag' | 'boolean';
  options?: string[];
  description?: string;
}

export interface TriggerableActionParam {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description?: string;
  source: 'static' | 'field' | 'any';
  source_options?: string[];
  resource?: string;
}

export interface TriggerableActionPreset {
  name: string;
  class_name: string | null;
  description: string | null;
  params: TriggerableActionParam[];
  available_fields: TriggerableConditionField[];
}

export interface TriggerableModelTrigger {
  event: string;
  conditions: TriggerableConditionField[];
  actions: TriggerableActionPreset[];
}

export interface TriggerableModel {
  model: string;
  triggers: TriggerableModelTrigger[];
}

export interface TriggerableSchema {
  models: TriggerableModel[];
  action_presets: TriggerableActionPreset[];
  lifecycle_events: string[];
  condition_operators: string[];
}

// ── Tag ─────────────────────────────────────────────────────

export type TagPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TagAttributes extends Timestamps {
  name: string;
  color: string | null;
  priority: TagPriority | null;
  level: number | null;
  description: string | null;
  category: string | null;
}

// ── Calendar ────────────────────────────────────────────────

export type CalendarVisibility = 'public' | 'private' | 'shared';

export interface CalendarAttributes extends Timestamps {
  name: string;
  description: string | null;
  color: string | null;
  is_default: boolean;
  visibility: CalendarVisibility | null;
  sync_enabled: boolean;
  last_sync_at: string | null;
}

// ── Calendar Event ──────────────────────────────────────────

export interface Attendee {
  email: string;
  name?: string;
  role: 'required' | 'optional' | 'chair';
  status: 'needsAction' | 'accepted' | 'declined' | 'tentative';
}

export interface RecurrenceRule {
  frequency?: string;
  interval?: number;
  until?: string;
  count?: number;
  byWeekDay?: string[];
  byMonth?: number[];
  byMonthDay?: number[];
}

export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

export interface CalendarEventAttributes extends Timestamps {
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  location: string | null;
  attendees: Attendee[];
  recurrence: RecurrenceRule;
  status: EventStatus | null;
  visibility: CalendarVisibility | null;
}

// ── Time Slot ───────────────────────────────────────────────

export interface TimeSlotAttributes extends Timestamps {
  title: string | null;
  start_at: string;
  end_at: string;
  is_available: boolean;
}

// ── Calendar Integration ────────────────────────────────────

export type IntegrationProvider = 'google' | 'outlook' | 'apple' | 'caldav';

export interface CalendarIntegrationAttributes extends Timestamps {
  provider: IntegrationProvider;
  external_id: string | null;
  sync_enabled: boolean;
  last_sync_at: string | null;
}

// ── Page Builder ────────────────────────────────────────────

export interface PageComponentNode {
  selector: string;
  node: boolean;
  type: string;
  props: Record<string, unknown> & {
    children?: PageComponentNode[];
  };
  grid?: {
    lg: GridPosition;
    sm: GridPosition;
  };
}

export interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface PageThemeFonts {
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

export interface PageThemeButton {
  padding?: string;
  style?: 'solid' | 'outline';
  shape?: 'square' | 'rounded' | 'pill';
}

export interface PageTheme {
  fonts?: {
    headings?: PageThemeFonts;
    paragraphs?: PageThemeFonts;
    buttons?: PageThemeFonts;
  };
  buttons?: {
    primary?: PageThemeButton;
    secondary?: PageThemeButton;
    tertiary?: PageThemeButton;
  };
  colorPalette?: {
    color1?: string;
    color2?: string;
    color3?: string;
    color4?: string;
    color5?: string;
  };
  selectedTheme?: string;
}

export interface PageSettings {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  favicon?: string;
  customCss?: string;
  customJs?: string;
  analyticsId?: string;
  passwordProtected?: boolean;
  password?: string;
}

export interface PageAttributes extends Timestamps, StatefulAttributes {
  name: string;
  slug: string;
  description: string | null;
  layout: string | null;
  structure: PageComponentNode | Record<string, unknown>;
  theme: PageTheme;
  theme_overrides: PageTheme;
  template_name: string | null;
  published_url: string | null;
  settings: PageSettings;
  website_id: string | null;
  position: number | null;
  is_homepage: boolean;
}

// ── Website ─────────────────────────────────────────────────

export interface WebsiteAttributes extends Timestamps, StatefulAttributes {
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  theme: PageTheme;
  settings: PageSettings;
}

// ── Page Template ───────────────────────────────────────────

export type PageTemplateCategory = 'landing' | 'portfolio' | 'contact' | 'product' | 'blank';

export interface PageTemplateAttributes extends Timestamps {
  name: string;
  description: string | null;
  category: PageTemplateCategory | null;
  thumbnail_url: string | null;
  structure: PageComponentNode | Record<string, unknown>;
  theme: PageTheme;
}

// ── Product ─────────────────────────────────────────────────

export type PricingType = 'fixed' | 'variable' | 'tiered';

export interface PricingTier {
  min_quantity: number;
  max_quantity: number | null;
  price_cents: number;
}

export interface PricingConfig {
  tiers?: PricingTier[];
  min_cents?: number;
  max_cents?: number;
}

export interface ProductAttributes extends Timestamps, StatefulAttributes {
  name: string;
  description: string | null;
  sku: string | null;
  price_cents: number | null;
  currency: string;
  pricing_type: PricingType;
  pricing_config: PricingConfig;
  category: string | null;
  image_url: string | null;
  available: boolean;
  inventory_count: number | null;
  metadata: Record<string, unknown>;
}

// ── Product Variant ─────────────────────────────────────────

export interface ProductVariantAttributes extends Timestamps {
  name: string;
  sku: string | null;
  price_cents: number | null;
  options: Record<string, unknown>;
  available: boolean;
  inventory_count: number | null;
}

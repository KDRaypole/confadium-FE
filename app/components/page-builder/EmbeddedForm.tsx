import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formsApi } from "~/lib/api/forms";
import type { FormTheme, FormSettings } from "~/lib/api/types";
import { usePageBuilder } from "./PageBuilderContext";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

/** Shape of a field as embedded in the form show response */
interface EmbeddedField {
  id: string;
  type: string;
  label: string;
  position: number;
  required: boolean;
  placeholder: string | null;
  description: string | null;
  options: string[] | Record<string, unknown>;
  conditionalActions: ConditionalAction[];
  validation: Record<string, unknown>;
}

interface ConditionalAction {
  id: string;
  triggerValue: string;
  type: string;
  targetFieldId?: string;
  options?: string[];
  endMessage?: string;
  endTitle?: string;
}

interface EmbeddedFormProps {
  formId: string;
}

/**
 * Renders a live preview of a CRM form inside the page builder.
 * Supports single-page and multi-step forms, conditional logic,
 * progress bars, step indicators, and full form theme styling.
 */
export default function EmbeddedForm({ formId }: EmbeddedFormProps) {
  const { editMode } = usePageBuilder();

  // Use public endpoint when not in edit mode (public page viewing)
  const { data: formResource, isLoading: loading, error } = useQuery({
    queryKey: ['embedded-form', formId, editMode],
    queryFn: async () => {
      if (editMode) {
        const result = await formsApi.getFormById(formId);
        return result.data;
      } else {
        return await formsApi.getPublicForm(formId);
      }
    },
    enabled: !!formId,
    retry: 1,
  });

  const form = (editMode ? formResource?.attributes : formResource) as any;
  const fields: EmbeddedField[] = form?.fields || [];
  const theme: FormTheme = form?.theme || {};
  const settings: FormSettings = form?.settings || {};

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '2rem', height: '2rem',
          border: '2px solid #e5e7eb', borderTopColor: '#7c3aed',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }} />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>Loading form...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        <p style={{ color: '#ef4444', marginBottom: '0.25rem' }}>
          {error ? 'Failed to load form.' : 'Form not found.'}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
          Try re-selecting the form in the editor panel.
        </p>
      </div>
    );
  }

  const isMultiStep = settings.enableMultiStage && fields.length > 1;

  return (
    <div style={{
      backgroundColor: theme.backgroundColor || '#ffffff',
      borderRadius: theme.borderRadius ? `${theme.borderRadius}px` : '0.5rem',
      border: `1px solid ${theme.borderColor || '#e5e7eb'}`,
      fontFamily: theme.fontFamily || 'inherit',
      fontSize: theme.fontSize || '0.875rem',
      overflow: 'hidden',
    }}>
      {/* Header image */}
      {theme.headerImage && (
        <div style={{
          height: theme.headerImageHeight || '120px',
          backgroundImage: `url(${theme.headerImage})`,
          backgroundSize: theme.headerImageFit || 'cover',
          backgroundPosition: 'center',
          opacity: theme.headerImageOpacity ?? 1,
        }} />
      )}

      <div style={{ padding: theme.spacing ? `${parseInt(theme.spacing) * 1.5}px` : '1.5rem' }}>
        {isMultiStep ? (
          <MultiStepPreview
            formId={formId}
            formName={form.name}
            description={form.description}
            fields={fields}
            theme={theme}
            settings={settings}
            editMode={editMode}
          />
        ) : (
          <SinglePagePreview
            formId={formId}
            formName={form.name}
            description={form.description}
            fields={fields}
            theme={theme}
            settings={settings}
            editMode={editMode}
          />
        )}
      </div>
    </div>
  );
}

// ── Single-page form ───────────────────────────────────────

function SinglePagePreview({
  formId, formName, description, fields, theme, settings, editMode,
}: {
  formId: string;
  formName: string;
  description: string | null;
  fields: EmbeddedField[];
  theme: FormTheme;
  settings: FormSettings;
  editMode: boolean;
}) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const visibleFields = useVisibleFields(fields, values);

  const handleSubmit = async () => {
    if (editMode || submitting) return;
    setSubmitting(true);
    try {
      // Remap field UUIDs to labels
      const labeled: Record<string, any> = {};
      for (const [fieldId, value] of Object.entries(values)) {
        const field = fields.find(f => f.id === fieldId);
        labeled[field?.label || fieldId] = value;
      }
      await formsApi.submitForm(formId, labeled);
      setSubmitted(true);
    } catch (e) {
      console.error('Form submission failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#10003;</div>
        <h3 style={{ fontWeight: 600, fontSize: '1.125rem', color: theme.textColor || '#1f2937', marginBottom: '0.5rem', fontFamily: theme.fontFamily }}>
          {settings.confirmationTitle || 'Thank you!'}
        </h3>
        <p style={{ color: theme.textColor ? `${theme.textColor}99` : '#6b7280', fontFamily: theme.fontFamily }}>
          {settings.confirmationMessage || 'Your response has been submitted.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <FormHeader name={formName} description={description} theme={theme} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing ? `${parseInt(theme.spacing) * 0.75}px` : '1rem' }}>
        {visibleFields.map((field) => (
          <div key={field.id}>
            {field.type !== 'checkbox' && (
              <label style={{
                display: 'block', fontWeight: 500, marginBottom: '0.375rem',
                fontSize: theme.fontSize || '0.875rem',
                color: theme.textColor || '#374151',
                fontFamily: theme.fontFamily,
              }}>
                {field.label}
                {field.required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
              </label>
            )}
            {field.description && (
              <p style={{ fontSize: '0.75rem', color: theme.textColor ? `${theme.textColor}99` : '#9ca3af', marginBottom: '0.375rem', fontFamily: theme.fontFamily }}>
                {field.description}
              </p>
            )}
            <FieldRenderer
              field={field}
              theme={theme}
              value={values[field.id]}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
              disabled={false}
            />
          </div>
        ))}

        {fields.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
            This form has no fields yet.
          </p>
        )}
      </div>

      {fields.length > 0 && (
        <div onClick={handleSubmit}>
          <SubmitButton label={submitting ? 'Submitting...' : (settings.submitButtonText || 'Submit')} theme={theme} disabled={editMode || submitting} />
        </div>
      )}
    </>
  );
}

// ── Multi-step form ────────────────────────────────────────

function MultiStepPreview({
  formId, formName, description, fields, theme, settings, editMode,
}: {
  formId: string;
  formName: string;
  description: string | null;
  fields: EmbeddedField[];
  theme: FormTheme;
  settings: FormSettings;
  editMode: boolean;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const visibleFields = useVisibleFields(fields, values);
  const totalSteps = visibleFields.length;
  const currentField = visibleFields[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const progressPct = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // Check if form should end due to conditional logic
  const endState = useEndFormCheck(fields, values);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection('next');
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection('prev');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (idx: number) => {
    if (settings.allowStepNavigation) {
      setDirection(idx > currentStep ? 'next' : 'prev');
      setCurrentStep(idx);
    }
  };

  const handleSubmit = async () => {
    if (editMode || submitting) return;
    setSubmitting(true);
    try {
      const labeled: Record<string, any> = {};
      for (const [fieldId, value] of Object.entries(values)) {
        const field = fields.find(f => f.id === fieldId);
        labeled[field?.label || fieldId] = value;
      }
      await formsApi.submitForm(formId, labeled);
      setSubmitted(true);
    } catch (e) {
      console.error('Form submission failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#10003;</div>
          <h2 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: theme.textColor || '#1f2937', fontSize: '1.125rem', fontFamily: theme.fontFamily }}>
            {settings.confirmationTitle || 'Thank you!'}
          </h2>
          <p style={{ color: theme.textColor ? `${theme.textColor}99` : '#6b7280', fontFamily: theme.fontFamily }}>
            {settings.confirmationMessage || 'Your response has been submitted.'}
          </p>
        </div>
      </div>
    );
  }

  if (endState.shouldEnd) {
    return (
      <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontWeight: 'bold', marginBottom: '1rem',
            color: theme.textColor || '#1f2937',
            fontSize: '1.25rem', fontFamily: theme.fontFamily,
          }}>
            {endState.endTitle || 'Form Complete'}
          </h2>
          <p style={{ color: theme.textColor || '#6b7280', fontFamily: theme.fontFamily }}>
            {endState.endMessage || 'Thank you for your responses!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FormHeader name={formName} description={description} theme={theme} />

      {/* Progress bar */}
      {settings.showProgressBar && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.375rem', color: theme.textColor || '#6b7280' }}>
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', backgroundColor: theme.borderColor || '#e5e7eb' }}>
            <div style={{
              height: '6px', borderRadius: '3px',
              backgroundColor: theme.primaryColor || '#7c3aed',
              width: `${progressPct}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Step indicator dots */}
      {settings.showStepIndicator && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {visibleFields.map((_, i) => (
            <button
              key={i}
              onClick={() => handleStepClick(i)}
              disabled={!settings.allowStepNavigation}
              style={{
                width: '0.625rem', height: '0.625rem', borderRadius: '50%',
                border: 'none',
                backgroundColor: i <= currentStep ? (theme.primaryColor || '#7c3aed') : (theme.borderColor || '#d1d5db'),
                cursor: settings.allowStepNavigation ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </div>
      )}

      {/* Current field */}
      {currentField && (
        <div
          key={`${currentField.id}-${currentStep}`}
          style={{ minHeight: '120px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {currentField.type !== 'checkbox' && (
              <label style={{
                display: 'block', fontWeight: 500, marginBottom: '1rem',
                fontSize: '1.125rem',
                color: theme.textColor || '#1f2937',
                fontFamily: theme.fontFamily,
              }}>
                {currentField.label}
                {currentField.required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
              </label>
            )}

            <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
              <FieldRenderer
                field={currentField}
                theme={theme}
                value={values[currentField.id]}
                onChange={(v) => setValues((prev) => ({ ...prev, [currentField.id]: v }))}
                disabled={false}
                autoFocus
              />
            </div>

            {currentField.description && (
              <p style={{
                marginTop: '0.75rem', fontSize: '0.8125rem',
                color: theme.textColor ? `${theme.textColor}99` : '#9ca3af',
                fontFamily: theme.fontFamily,
              }}>
                {currentField.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1rem',
            border: `1px solid ${theme.borderColor || '#d1d5db'}`,
            borderRadius: theme.borderRadius ? `${theme.borderRadius}px` : '0.375rem',
            backgroundColor: 'transparent',
            color: theme.textColor || '#374151',
            fontSize: '0.875rem', fontFamily: theme.fontFamily,
            cursor: currentStep === 0 ? 'default' : 'pointer',
            opacity: currentStep === 0 ? 0.4 : 1,
          }}
        >
          <ChevronLeftIcon style={{ width: '1rem', height: '1rem' }} />
          {settings.previousButtonText || 'Back'}
        </button>

        <button
          onClick={isLastStep ? (!editMode ? handleSubmit : undefined) : handleNext}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1.25rem',
            border: 'none',
            borderRadius: theme.borderRadius ? `${theme.borderRadius}px` : '0.375rem',
            backgroundColor: theme.primaryColor || '#7c3aed',
            color: '#ffffff',
            fontSize: '0.875rem', fontWeight: 500, fontFamily: theme.fontFamily,
            cursor: 'pointer',
          }}
        >
          {isLastStep ? (settings.submitButtonText || 'Submit') : (settings.nextButtonText || 'Next')}
          {!isLastStep && <ChevronRightIcon style={{ width: '1rem', height: '1rem' }} />}
        </button>
      </div>
    </>
  );
}

// ── Shared components ──────────────────────────────────────

function FormHeader({ name, description, theme }: { name: string; description: string | null; theme: FormTheme }) {
  return (
    <>
      <h3 style={{
        fontSize: '1.25rem', fontWeight: 600,
        color: theme.textColor || '#1f2937',
        marginBottom: '0.25rem', fontFamily: theme.fontFamily,
      }}>
        {name}
      </h3>
      {description && (
        <p style={{
          fontSize: '0.875rem',
          color: theme.textColor ? `${theme.textColor}99` : '#6b7280',
          marginBottom: '1.25rem', fontFamily: theme.fontFamily,
        }}>
          {description}
        </p>
      )}
    </>
  );
}

function SubmitButton({ label, theme, disabled }: { label: string; theme: FormTheme; disabled: boolean }) {
  return (
    <button
      disabled={disabled}
      style={{
        marginTop: '1.25rem', width: '100%',
        padding: '0.625rem 1.5rem',
        backgroundColor: theme.primaryColor || '#7c3aed',
        color: '#ffffff', border: 'none',
        borderRadius: theme.borderRadius ? `${theme.borderRadius}px` : '0.375rem',
        fontSize: '0.875rem', fontWeight: 500, fontFamily: theme.fontFamily,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.8 : 1,
      }}
    >
      {label}
    </button>
  );
}

// ── Field renderer ─────────────────────────────────────────

function FieldRenderer({
  field, theme, value, onChange, disabled, autoFocus,
}: {
  field: EmbeddedField;
  theme: FormTheme;
  value: any;
  onChange: (v: any) => void;
  disabled: boolean;
  autoFocus?: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${theme.borderColor || '#d1d5db'}`,
    borderRadius: theme.borderRadius ? `${theme.borderRadius}px` : '0.375rem',
    fontSize: theme.fontSize || '0.875rem',
    color: theme.textColor || '#374151',
    backgroundColor: theme.backgroundColor || '#ffffff',
    fontFamily: theme.fontFamily || 'inherit',
    outline: 'none',
  };

  const options = Array.isArray(field.options) ? field.options : [];

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
    case 'number':
      return (
        <input
          type={field.type === 'phone' ? 'tel' : field.type}
          placeholder={field.placeholder || ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          style={inputStyle}
          autoFocus={autoFocus}
        />
      );

    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder || ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          rows={3}
          style={inputStyle}
          autoFocus={autoFocus}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          style={inputStyle}
          autoFocus={autoFocus}
        />
      );

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          style={inputStyle}
        >
          <option value="">{field.placeholder || 'Select an option...'}</option>
          {options.map((opt, i) => (
            <option key={i} value={String(opt)}>{String(opt)}</option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {options.map((opt, i) => (
            <label key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: theme.fontSize || '0.875rem', color: theme.textColor || '#374151',
              fontFamily: theme.fontFamily, cursor: disabled ? 'default' : 'pointer',
            }}>
              <input
                type="radio"
                name={`field-${field.id}`}
                value={String(opt)}
                checked={value === String(opt)}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                style={{ accentColor: theme.primaryColor || '#7c3aed', width: '1rem', height: '1rem' }}
              />
              {String(opt)}
            </label>
          ))}
          {options.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No options defined</span>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: theme.fontSize || '0.875rem', color: theme.textColor || '#374151',
          fontFamily: theme.fontFamily, cursor: disabled ? 'default' : 'pointer',
        }}>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            style={{ accentColor: theme.primaryColor || '#7c3aed', width: '1rem', height: '1rem' }}
          />
          {field.placeholder || field.label}
        </label>
      );

    default:
      return (
        <input
          type="text"
          placeholder={field.placeholder || ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={inputStyle}
        />
      );
  }
}

// ── Conditional logic (simplified for embedded fields) ─────

function useVisibleFields(fields: EmbeddedField[], values: Record<string, any>): EmbeddedField[] {
  return useMemo(() => {
    const hidden = new Set<string>();

    for (const field of fields) {
      if (!field.conditionalActions || values[field.id] === undefined) continue;
      const fieldValue = String(values[field.id]);

      for (const action of field.conditionalActions) {
        if (action.triggerValue !== fieldValue) continue;

        if (action.type === 'hide_question' && action.targetFieldId) {
          hidden.add(action.targetFieldId);
        }
        if (action.type === 'show_question' && action.targetFieldId) {
          hidden.delete(action.targetFieldId);
        }
      }
    }

    return fields.filter((f) => !hidden.has(f.id));
  }, [fields, values]);
}

function useEndFormCheck(fields: EmbeddedField[], values: Record<string, any>): { shouldEnd: boolean; endMessage?: string; endTitle?: string } {
  return useMemo(() => {
    for (const field of fields) {
      if (!field.conditionalActions || values[field.id] === undefined) continue;
      const fieldValue = String(values[field.id]);

      for (const action of field.conditionalActions) {
        if (action.triggerValue === fieldValue && action.type === 'end_form') {
          return { shouldEnd: true, endMessage: action.endMessage, endTitle: action.endTitle };
        }
      }
    }
    return { shouldEnd: false };
  }, [fields, values]);
}

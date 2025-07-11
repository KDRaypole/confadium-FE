import React, { useState, useEffect } from 'react';
import { Form } from '~/lib/api/forms';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MockRecaptcha from './MockRecaptcha';

interface PublicFormRendererProps {
  form: Form;
  onSubmit: (data: Record<string, any>) => Promise<{ success: boolean; message: string }>;
}

const PublicFormRenderer: React.FC<PublicFormRendererProps> = ({ form, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showRecaptchaError, setShowRecaptchaError] = useState(false);

  const isMultiStage = form.settings.enableMultiStage;
  const totalSteps = form.fields.length;
  const currentField = form.fields[currentStep];
  
  // Debug current field access
  useEffect(() => {
    console.log('Current step data:', {
      currentStep,
      totalSteps,
      currentFieldExists: !!currentField,
      currentFieldId: currentField?.id,
      fieldsCount: form.fields.length,
      allFieldIds: form.fields.map(f => f.id)
    });
  }, [currentStep, currentField, totalSteps, form.fields]);

  // Auto-save functionality
  useEffect(() => {
    if (form.settings.autoSaveDraft && Object.keys(formValues).length > 0) {
      setAutoSaveStatus('saving');
      const saveTimeout = setTimeout(() => {
        localStorage.setItem(`form_draft_${form.id}`, JSON.stringify({
          values: formValues,
          currentStep: isMultiStage ? currentStep : 0,
          timestamp: Date.now()
        }));
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(saveTimeout);
    }
  }, [formValues, currentStep, form.settings.autoSaveDraft, form.id, isMultiStage]);

  // Load draft on component mount
  useEffect(() => {
    if (form.settings.autoSaveDraft) {
      const draftData = localStorage.getItem(`form_draft_${form.id}`);
      if (draftData) {
        try {
          const { values, currentStep: savedStep, timestamp } = JSON.parse(draftData);
          // Only restore draft if it's less than 24 hours old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setFormValues(values);
            if (isMultiStage && savedStep !== undefined) {
              setCurrentStep(savedStep);
            }
          } else {
            // Remove expired draft
            localStorage.removeItem(`form_draft_${form.id}`);
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
          localStorage.removeItem(`form_draft_${form.id}`);
        }
      }
    }
  }, [form.settings.autoSaveDraft, form.id, isMultiStage]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateField = (field: any, value: any): string => {
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return 'This field is required';
    }

    if (field.validation) {
      const val = field.validation;
      
      if (field.type === 'text' || field.type === 'textarea') {
        if (val.minLength && value && value.length < val.minLength) {
          return `Minimum ${val.minLength} characters required`;
        }
        if (val.maxLength && value && value.length > val.maxLength) {
          return `Maximum ${val.maxLength} characters allowed`;
        }
      }
      
      if (field.type === 'number') {
        if (val.min !== undefined && value < val.min) {
          return `Minimum value is ${val.min}`;
        }
        if (val.max !== undefined && value > val.max) {
          return `Maximum value is ${val.max}`;
        }
      }
      
      if (val.pattern && value && !new RegExp(val.pattern).test(value)) {
        return 'Please enter a valid value';
      }
    }

    return '';
  };

  const validateCurrentStep = (): boolean => {
    if (!isMultiStage) {
      // Validate all fields for single-page form
      const newErrors: Record<string, string> = {};
      form.fields.forEach(field => {
        const error = validateField(field, formValues[field.id]);
        if (error) {
          newErrors[field.id] = error;
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } else {
      // Validate current field for multi-stage form
      const error = validateField(currentField, formValues[currentField.id]);
      if (error) {
        setErrors({ [currentField.id]: error });
        return false;
      }
      setErrors({});
      return true;
    }
  };

  const handleNext = () => {
    const actualFinalStep = form.fields.length - 1;
    const canAdvance = currentStep < actualFinalStep;
    
    console.log('handleNext called:', {
      currentStep,
      totalSteps,
      actualFinalStep,
      canAdvance,
      nextStep: currentStep + 1,
      formFieldsLength: form.fields.length
    });
    
    if (!validateCurrentStep()) {
      console.log('Validation failed, not advancing');
      return;
    }
    
    if (canAdvance) {
      console.log('Advancing to next step:', currentStep + 1);
      setDirection('next');
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Already on final step, cannot advance further');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection('prev');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (form.settings.allowStepNavigation) {
      setDirection(stepIndex > currentStep ? 'next' : 'prev');
      setCurrentStep(stepIndex);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter key from submitting the form on non-final steps (except for textarea)
    const isTextarea = (e.target as HTMLElement).tagName.toLowerCase() === 'textarea';
    const actualFinalStep = form.fields.length - 1;
    const isOnFinalStep = currentStep === actualFinalStep;
    
    console.log('Key pressed:', {
      key: e.key,
      currentStep,
      totalSteps,
      actualFinalStep,
      isMultiStage,
      isTextarea,
      isOnFinalStep
    });
    
    if (e.key === 'Enter' && isMultiStage && !isOnFinalStep && !isTextarea) {
      console.log('Enter pressed on non-final step, preventing default and calling handleNext');
      e.preventDefault();
      handleNext(); // Move to next step instead
    }
    
    // For textarea, allow Ctrl+Enter to move to next step
    if (e.key === 'Enter' && e.ctrlKey && isMultiStage && !isOnFinalStep && isTextarea) {
      console.log('Ctrl+Enter pressed in textarea on non-final step');
      e.preventDefault();
      handleNext();
    }
    
    if (e.key === 'Enter' && isMultiStage && isOnFinalStep) {
      console.log('Enter pressed on final step - allowing form submission');
    }
  };

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
    setShowRecaptchaError(false);
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // More robust check: ensure we're actually on the final step
    const actualFinalStep = form.fields.length - 1;
    const isOnActualFinalStep = currentStep === actualFinalStep;
    
    console.log('Form submit triggered:', {
      isMultiStage,
      currentStep,
      totalSteps,
      actualFinalStep,
      isOnActualFinalStep,
      formFieldsLength: form.fields.length
    });
    
    // For multi-stage forms, only submit on the final step
    if (isMultiStage && !isOnActualFinalStep) {
      console.log('Preventing submission - not on final step. Current:', currentStep, 'Required:', actualFinalStep);
      return;
    }
    
    if (!validateCurrentStep()) return;
    
    // Check reCAPTCHA if enabled
    if (form.settings.enableCaptcha && !recaptchaToken) {
      setShowRecaptchaError(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await onSubmit({ ...formValues, recaptchaToken });
      setSubmitResult(result);
      
      if (result.success) {
        // Clear draft data on successful submission
        if (form.settings.autoSaveDraft) {
          localStorage.removeItem(`form_draft_${form.id}`);
        }
        
        // Handle redirect if specified
        if (form.settings.redirectUrl) {
          setTimeout(() => {
            window.location.href = form.settings.redirectUrl!;
          }, 2000); // Wait 2 seconds to show success message
        }
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: form.settings.errorMessage || 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const commonClasses = `w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`;
    const inputClasses = `${commonClasses} focus:ring-purple-500 focus:border-purple-500 ${
      errors[field.id] ? 'border-red-500' : 'border-gray-300'
    }`;
    
    const fieldStyle = {
      borderColor: errors[field.id] ? '#ef4444' : form.theme.borderColor,
      borderRadius: `${form.theme.borderRadius}px`,
      fontSize: isMultiStage ? `${form.theme.fontSize + 4}px` : `${form.theme.fontSize}px`,
      fontFamily: form.theme.fontFamily,
      color: form.theme.textColor,
      backgroundColor: form.theme.backgroundColor,
      minHeight: isMultiStage ? '60px' : 'auto'
    };

    const fieldContent = (() => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'url':
        case 'phone':
          return (
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={formValues[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              onKeyDown={handleKeyDown}
              required={field.required}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              pattern={field.validation?.pattern}
              className={inputClasses}
              style={fieldStyle}
              autoFocus={isMultiStage}
            />
          );

        case 'number':
          return (
            <input
              type="number"
              placeholder={field.placeholder}
              value={formValues[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              onKeyDown={handleKeyDown}
              required={field.required}
              min={field.validation?.min}
              max={field.validation?.max}
              className={inputClasses}
              style={fieldStyle}
              autoFocus={isMultiStage}
            />
          );

        case 'date':
          return (
            <input
              type="date"
              value={formValues[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              onKeyDown={handleKeyDown}
              required={field.required}
              className={inputClasses}
              style={fieldStyle}
              autoFocus={isMultiStage}
            />
          );

        case 'textarea':
          return (
            <textarea
              placeholder={field.placeholder}
              value={formValues[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              onKeyDown={handleKeyDown}
              required={field.required}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              rows={isMultiStage ? 4 : 3}
              className={inputClasses}
              style={fieldStyle}
              autoFocus={isMultiStage}
            />
          );

        case 'select':
          return (
            <select
              value={formValues[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              onKeyDown={handleKeyDown}
              required={field.required}
              className={inputClasses}
              style={fieldStyle}
              autoFocus={isMultiStage}
            >
              <option value="">Select an option...</option>
              {field.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );

        case 'checkbox':
          return (
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formValues[field.id] || false}
                onChange={(e) => handleInputChange(field.id, e.target.checked)}
                required={field.required}
                className={`${isMultiStage ? 'w-6 h-6' : 'w-5 h-5'} rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50`}
                style={{ accentColor: form.theme.primaryColor }}
                autoFocus={isMultiStage}
              />
              <span 
                className={`${isMultiStage ? 'text-lg' : 'text-base'} font-medium`}
                style={{
                  fontSize: isMultiStage ? `${form.theme.fontSize + 2}px` : `${form.theme.fontSize}px`,
                  fontFamily: form.theme.fontFamily,
                  color: form.theme.textColor
                }}
              >
                I agree to the terms and conditions
              </span>
            </label>
          );

        case 'radio':
          return (
            <div className={`space-y-${isMultiStage ? '4' : '3'}`}>
              {field.options?.map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={formValues[field.id] === option}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    required={field.required}
                    className={`${isMultiStage ? 'w-6 h-6' : 'w-4 h-4'} border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50`}
                    style={{ accentColor: form.theme.primaryColor }}
                    autoFocus={isMultiStage && index === 0}
                  />
                  <span 
                    className={isMultiStage ? 'text-lg' : 'text-base'}
                    style={{
                      fontSize: isMultiStage ? `${form.theme.fontSize + 2}px` : `${form.theme.fontSize}px`,
                      fontFamily: form.theme.fontFamily,
                      color: form.theme.textColor
                    }}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>
          );

        default:
          return (
            <div className="text-gray-500 italic">
              Unsupported field type: {field.type}
            </div>
          );
      }
    })();

    return (
      <div>
        {fieldContent}
        {errors[field.id] && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            {errors[field.id]}
          </p>
        )}
      </div>
    );
  };

  // Show success message
  if (submitResult?.success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          backgroundColor: form.theme.backgroundColor,
          fontFamily: form.theme.fontFamily 
        }}
      >
        <div className="max-w-md mx-auto text-center">
          <div 
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: form.theme.primaryColor }}
          >
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ 
              color: form.theme.textColor,
              fontFamily: form.theme.fontFamily 
            }}
          >
            Thank You!
          </h2>
          <p 
            className="text-lg"
            style={{ 
              color: form.theme.textColor,
              fontFamily: form.theme.fontFamily 
            }}
          >
            {submitResult.message || form.settings.successMessage}
          </p>
          
          {form.settings.redirectUrl && (
            <p 
              className="text-sm mt-4 opacity-75"
              style={{ 
                color: form.theme.textColor,
                fontFamily: form.theme.fontFamily 
              }}
            >
              Redirecting you shortly...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = isMultiStage 
    ? ((currentStep + 1) / totalSteps) * 100 
    : form.settings.showProgressBar 
      ? (Object.keys(formValues).filter(key => {
          const value = formValues[key];
          return value !== null && value !== undefined && value !== '';
        }).length / Math.max(form.fields.length, 1)) * 100
      : 0;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundColor: form.theme.backgroundColor,
        fontFamily: form.theme.fontFamily 
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Header Image */}
        {form.theme.headerImage && (
          <div 
            className="w-full bg-cover bg-center mb-8 rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url(${form.theme.headerImage})`,
              height: `${form.theme.headerImageHeight || 200}px`,
              backgroundSize: form.theme.headerImageFit || 'cover',
              backgroundPosition: 'center',
              opacity: form.theme.headerImageOpacity || 1,
            }}
          />
        )}
        {/* Progress Bar - Show for both single and multi-stage if enabled */}
        {form.settings.showProgressBar && (
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: form.theme.textColor }}>
                {isMultiStage ? `Step ${currentStep + 1} of ${totalSteps}` : 'Form Progress'}
              </span>
              <span style={{ color: form.theme.textColor }}>
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div 
              className="h-2 rounded-full"
              style={{ backgroundColor: form.theme.borderColor }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  backgroundColor: form.theme.primaryColor,
                  width: `${progressPercentage}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Multi-stage step indicator */}
        {isMultiStage && form.settings.showStepIndicator && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-3">
              {form.fields.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  disabled={!form.settings.allowStepNavigation}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    form.settings.allowStepNavigation 
                      ? 'cursor-pointer hover:scale-110' 
                      : 'cursor-default'
                  }`}
                  style={{
                    backgroundColor: index <= currentStep 
                      ? form.theme.primaryColor 
                      : form.theme.borderColor
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Auto-save indicator */}
        {form.settings.autoSaveDraft && autoSaveStatus !== 'idle' && (
          <div className="flex justify-end mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              {autoSaveStatus === 'saving' && (
                <>
                  <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full mr-1"></div>
                  Saving draft...
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <CheckIcon className="h-3 w-3 text-green-500 mr-1" />
                  Draft saved
                </>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Hidden submit button to prevent implicit form submission on non-final steps */}
          {isMultiStage && currentStep !== totalSteps - 1 && (
            <button type="submit" disabled style={{ display: 'none' }} aria-hidden="true">
              Hidden Submit
            </button>
          )}
          
          {/* Form Title */}
          {form.name && (
            <h1 
              className="font-bold text-center mb-8"
              style={{
                color: form.theme.textColor,
                fontSize: isMultiStage ? `${form.theme.fontSize + 12}px` : `${form.theme.fontSize + 8}px`,
                fontFamily: form.theme.fontFamily
              }}
            >
              {form.name}
            </h1>
          )}

          {/* Form Description */}
          {form.description && !isMultiStage && (
            <p 
              className="text-center mb-8 opacity-80"
              style={{
                color: form.theme.textColor,
                fontSize: `${form.theme.fontSize + 2}px`,
                fontFamily: form.theme.fontFamily
              }}
            >
              {form.description}
            </p>
          )}

          {/* Fields */}
          {isMultiStage ? (
            // Multi-stage: show current field only
            currentField && (
              <div 
                key={currentField.id}
                className={`transition-all duration-300 ease-in-out transform ${
                  direction === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                }`}
              >
                <div className="text-center mb-8">
                  {currentField.type !== 'checkbox' && (
                    <label 
                      className="block font-medium mb-6 text-center"
                      style={{
                        fontSize: `${form.theme.fontSize + 8}px`,
                        fontFamily: form.theme.fontFamily,
                        color: form.theme.textColor
                      }}
                    >
                      {currentField.label}
                      {currentField.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  
                  <div className="max-w-md mx-auto">
                    {renderField(currentField)}
                  </div>
                  
                  {currentField.description && (
                    <p 
                      className="mt-4 text-center opacity-75"
                      style={{ 
                        color: form.theme.textColor,
                        fontSize: `${form.theme.fontSize}px`,
                        fontFamily: form.theme.fontFamily 
                      }}
                    >
                      {currentField.description}
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            // Single page: show all fields
            <div className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id}>
                  {field.type !== 'checkbox' && (
                    <label 
                      className="block font-medium mb-2"
                      style={{
                        fontSize: `${form.theme.fontSize + 2}px`,
                        fontFamily: form.theme.fontFamily,
                        color: form.theme.textColor
                      }}
                    >
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  
                  {renderField(field)}
                  
                  {field.description && (
                    <p 
                      className="mt-1 text-sm opacity-75"
                      style={{ 
                        color: form.theme.textColor,
                        fontSize: `${form.theme.fontSize - 2}px`,
                        fontFamily: form.theme.fontFamily 
                      }}
                    >
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* reCAPTCHA */}
          {form.settings.enableCaptcha && (
            <div className="pt-6">
              <div className="flex justify-center">
                <MockRecaptcha
                  onVerify={handleRecaptchaVerify}
                  onExpire={handleRecaptchaExpire}
                  theme={form.theme.backgroundColor === '#1f2937' ? 'dark' : 'light'}
                  size="normal"
                />
              </div>
              {showRecaptchaError && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-red-600">
                    Please complete the reCAPTCHA verification before submitting.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation/Submit */}
          {isMultiStage ? (
            <div className="flex justify-between items-center pt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="inline-flex items-center px-6 py-3 font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'transparent',
                  color: form.theme.textColor,
                  borderColor: form.theme.borderColor,
                  border: '2px solid',
                  borderRadius: `${form.theme.borderRadius}px`,
                  fontSize: `${form.theme.fontSize}px`,
                  fontFamily: form.theme.fontFamily
                }}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                {form.settings.previousButtonText}
              </button>

              {(() => {
                const actualFinalStep = form.fields.length - 1;
                const isOnFinalStep = currentStep === actualFinalStep;
                console.log('Button render logic:', {
                  currentStep,
                  totalSteps,
                  actualFinalStep,
                  isOnFinalStep,
                  showSubmitButton: isOnFinalStep,
                  formFieldsLength: form.fields.length
                });
                return isOnFinalStep;
              })() ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-3 text-white font-medium rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: form.theme.primaryColor,
                    borderRadius: `${form.theme.borderRadius}px`,
                    fontSize: `${form.theme.fontSize}px`,
                    fontFamily: form.theme.fontFamily
                  }}
                >
                  {isSubmitting ? 'Submitting...' : form.settings.submitButtonText}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-3 text-white font-medium rounded-md transition-all hover:opacity-90"
                  style={{
                    backgroundColor: form.theme.primaryColor,
                    borderRadius: `${form.theme.borderRadius}px`,
                    fontSize: `${form.theme.fontSize}px`,
                    fontFamily: form.theme.fontFamily
                  }}
                >
                  {form.settings.nextButtonText}
                  <ChevronRightIcon className="h-5 w-5 ml-2" />
                </button>
              )}
            </div>
          ) : (
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 text-white font-medium rounded-md transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: form.theme.primaryColor,
                  borderRadius: `${form.theme.borderRadius}px`,
                  fontSize: `${form.theme.fontSize}px`,
                  fontFamily: form.theme.fontFamily
                }}
              >
                {isSubmitting ? 'Submitting...' : form.settings.submitButtonText}
              </button>
            </div>
          )}
        </form>

        {/* Error Message */}
        {submitResult && !submitResult.success && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              {submitResult.message}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PublicFormRenderer;
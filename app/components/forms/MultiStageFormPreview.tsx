import React, { useState } from 'react';
import { FormData } from '~/routes/organizations.$orgId.forms.new';
import { 
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import MockRecaptcha from './MockRecaptcha';
import { 
  evaluateConditionalLogic, 
  shouldEndForm, 
  getNextConditionalField, 
  getPreviousConditionalField 
} from '~/lib/conditionalLogic';

interface MultiStageFormPreviewProps {
  formData: FormData;
}

const MultiStageFormPreview: React.FC<MultiStageFormPreviewProps> = ({ formData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // Evaluate conditional logic
  const conditionalResult = evaluateConditionalLogic(formData.fields, formValues);
  const endCheck = shouldEndForm(formData.fields, formValues);
  const visibleFields = conditionalResult.visibleFields;
  
  const totalSteps = visibleFields.length;
  const currentField = visibleFields[currentStep];

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleNext = () => {
    if (currentField) {
      const nextField = getNextConditionalField(currentField.id, formData.fields, formValues);
      if (nextField) {
        const nextIndex = visibleFields.findIndex(f => f.id === nextField.id);
        if (nextIndex !== -1) {
          setDirection('next');
          setCurrentStep(nextIndex);
          return;
        }
      }
    }
    
    // Fallback to simple increment
    if (currentStep < totalSteps - 1) {
      setDirection('next');
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentField) {
      const prevField = getPreviousConditionalField(currentField.id, formData.fields, formValues);
      if (prevField) {
        const prevIndex = visibleFields.findIndex(f => f.id === prevField.id);
        if (prevIndex !== -1) {
          setDirection('prev');
          setCurrentStep(prevIndex);
          return;
        }
      }
    }
    
    // Fallback to simple decrement
    if (currentStep > 0) {
      setDirection('prev');
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (formData.settings.allowStepNavigation) {
      setDirection(stepIndex > currentStep ? 'next' : 'prev');
      setCurrentStep(stepIndex);
    }
  };

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.settings.enableCaptcha && !recaptchaToken) {
      alert('Please complete the reCAPTCHA verification before submitting.');
      return;
    }
    alert('Form submitted! (This is just a preview)');
    console.log('Form values:', formValues);
  };

  // Show end message if form should end
  if (endCheck.shouldEnd) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Multi-Stage Form Preview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Experience the step-by-step form flow
          </p>
        </div>

        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg max-w-2xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-xs text-gray-600 dark:text-gray-400">Form Ended</div>
            </div>
          </div>
          <div 
            className="min-h-96 flex items-center justify-center p-8"
            style={{
              backgroundColor: formData.theme.backgroundColor,
              fontFamily: formData.theme.fontFamily,
              padding: `${formData.theme.spacing * 2}px`
            }}
          >
            <div className="text-center">
              <h2 
                className="font-bold mb-6"
                style={{
                  color: formData.theme.textColor,
                  fontSize: `${formData.theme.fontSize + 12}px`,
                  fontFamily: formData.theme.fontFamily
                }}
              >
                {endCheck.endTitle || 'Form Complete'}
              </h2>
              <p 
                className="text-center"
                style={{ 
                  color: formData.theme.textColor,
                  fontSize: `${formData.theme.fontSize + 2}px`,
                  fontFamily: formData.theme.fontFamily 
                }}
              >
                {endCheck.endMessage || 'Thank you for your responses!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderField = (field: any) => {
    const commonClasses = `w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 text-lg`;
    const inputClasses = `${commonClasses} focus:ring-purple-500 focus:border-purple-500`;
    
    const fieldStyle = {
      borderColor: formData.theme.borderColor,
      borderRadius: `${formData.theme.borderRadius}px`,
      fontSize: `${formData.theme.fontSize + 4}px`,
      fontFamily: formData.theme.fontFamily,
      color: formData.theme.textColor,
      backgroundColor: formData.theme.backgroundColor,
      minHeight: '60px'
    };

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
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            className={inputClasses}
            style={fieldStyle}
            autoFocus
          />
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className={inputClasses}
            style={fieldStyle}
            autoFocus
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={inputClasses}
            style={fieldStyle}
            autoFocus
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            rows={4}
            className={inputClasses}
            style={fieldStyle}
            autoFocus
          />
        );

      case 'select':
        return (
          <select
            value={formValues[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={inputClasses}
            style={fieldStyle}
            autoFocus
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
              className="w-6 h-6 rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              style={{ accentColor: formData.theme.primaryColor }}
              autoFocus
            />
            <span 
              className="text-lg font-medium"
              style={{
                fontSize: `${formData.theme.fontSize + 2}px`,
                fontFamily: formData.theme.fontFamily,
                color: formData.theme.textColor
              }}
            >
              I agree to the terms and conditions
            </span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-4">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formValues[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-6 h-6 border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  style={{ accentColor: formData.theme.primaryColor }}
                  autoFocus={index === 0}
                />
                <span 
                  className="text-lg"
                  style={{
                    fontSize: `${formData.theme.fontSize + 2}px`,
                    fontFamily: formData.theme.fontFamily,
                    color: formData.theme.textColor
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
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Multi-Stage Form Preview
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Experience the step-by-step form flow
        </p>
      </div>

      {/* Form Container */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg max-w-2xl mx-auto">
        {/* Browser Header */}
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="ml-4 text-xs text-gray-600 dark:text-gray-400">
              Multi-Stage Form Preview
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div 
          className="min-h-96 relative overflow-hidden"
          style={{
            backgroundColor: formData.theme.backgroundColor,
            fontFamily: formData.theme.fontFamily,
            padding: `${formData.theme.spacing * 2}px`
          }}
        >
          {/* Header Image */}
          {formData.theme.headerImage && (
            <div 
              className="w-full bg-cover bg-center mb-8 rounded-lg overflow-hidden"
              style={{
                backgroundImage: `url(${formData.theme.headerImage})`,
                height: `${formData.theme.headerImageHeight || 200}px`,
                backgroundSize: formData.theme.headerImageFit || 'cover',
                backgroundPosition: 'center',
                opacity: formData.theme.headerImageOpacity || 1,
              }}
            />
          )}
          
          {/* Progress Bar */}
          {formData.settings.showProgressBar && (
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: formData.theme.textColor }}>
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span style={{ color: formData.theme.textColor }}>
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
              <div 
                className="h-2 rounded-full"
                style={{ backgroundColor: formData.theme.borderColor }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-300 ease-out"
                  style={{
                    backgroundColor: formData.theme.primaryColor,
                    width: `${progressPercentage}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Step Indicator */}
          {formData.settings.showStepIndicator && (
            <div className="flex justify-center mb-8">
              <div className="flex space-x-3">
                {visibleFields.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    disabled={!formData.settings.allowStepNavigation}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      formData.settings.allowStepNavigation 
                        ? 'cursor-pointer hover:scale-110' 
                        : 'cursor-default'
                    }`}
                    style={{
                      backgroundColor: index <= currentStep 
                        ? formData.theme.primaryColor 
                        : formData.theme.borderColor
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Form Title */}
            {formData.name && (
              <h1 
                className="font-bold mb-6 text-center"
                style={{
                  color: formData.theme.textColor,
                  fontSize: `${formData.theme.fontSize + 12}px`,
                  fontFamily: formData.theme.fontFamily
                }}
              >
                {formData.name}
              </h1>
            )}

            {/* Current Field */}
            {currentField && (() => {
              // Get the potentially modified field from conditional result
              const modifiedField = conditionalResult.modifiedFields.find(f => f.id === currentField.id) || currentField;
              
              return (
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
                          fontSize: `${formData.theme.fontSize + 8}px`,
                          fontFamily: formData.theme.fontFamily,
                          color: formData.theme.textColor
                        }}
                      >
                        {currentField.label}
                        {currentField.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    
                    <div className="max-w-md mx-auto">
                      {renderField(modifiedField)}
                    </div>
                  
                    {currentField.description && (
                      <p 
                        className="mt-4 text-center opacity-75"
                        style={{ 
                          color: formData.theme.textColor,
                          fontSize: `${formData.theme.fontSize}px`,
                          fontFamily: formData.theme.fontFamily 
                        }}
                      >
                        {currentField.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* reCAPTCHA - only show on final step */}
            {formData.settings.enableCaptcha && currentStep === totalSteps - 1 && (
              <div className="pt-6">
                <div className="flex justify-center">
                  <MockRecaptcha
                    onVerify={handleRecaptchaVerify}
                    onExpire={handleRecaptchaExpire}
                    theme={formData.theme.backgroundColor === '#1f2937' ? 'dark' : 'light'}
                    size="normal"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="inline-flex items-center px-6 py-3 font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'transparent',
                  color: formData.theme.textColor,
                  borderColor: formData.theme.borderColor,
                  border: '2px solid',
                  borderRadius: `${formData.theme.borderRadius}px`,
                  fontSize: `${formData.theme.fontSize}px`,
                  fontFamily: formData.theme.fontFamily
                }}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-2" />
                {formData.settings.previousButtonText}
              </button>

              {currentStep === totalSteps - 1 ? (
                <button
                  type="submit"
                  className="inline-flex items-center px-8 py-3 text-white font-medium rounded-md transition-all hover:opacity-90"
                  style={{
                    backgroundColor: formData.theme.primaryColor,
                    borderRadius: `${formData.theme.borderRadius}px`,
                    fontSize: `${formData.theme.fontSize}px`,
                    fontFamily: formData.theme.fontFamily
                  }}
                >
                  {formData.settings.submitButtonText}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-3 text-white font-medium rounded-md transition-all hover:opacity-90"
                  style={{
                    backgroundColor: formData.theme.primaryColor,
                    borderRadius: `${formData.theme.borderRadius}px`,
                    fontSize: `${formData.theme.fontSize}px`,
                    fontFamily: formData.theme.fontFamily
                  }}
                >
                  {formData.settings.nextButtonText}
                  <ChevronRightIcon className="h-5 w-5 ml-2" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Form Stats */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Multi-Stage Form Statistics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Total Steps:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
              {totalSteps}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Current Step:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
              {currentStep + 1}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Progress:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Est. Time:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
              {Math.max(1, Math.ceil(totalSteps * 0.5))} min
            </span>
          </div>
        </div>
      </div>

      <style>{`
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

export default MultiStageFormPreview;
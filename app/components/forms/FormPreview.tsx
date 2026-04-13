import React, { useState } from 'react';
import { FormData } from '~/routes/organizations.$orgId.forms.new';
import { EyeIcon, ComputerDesktopIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import MultiStageFormPreview from './MultiStageFormPreview';
import MockRecaptcha from './MockRecaptcha';
import { evaluateConditionalLogic, shouldEndForm } from '~/lib/conditionalLogic';

interface FormPreviewProps {
  formData: FormData;
}

type PreviewMode = 'desktop' | 'mobile';

const FormPreview: React.FC<FormPreviewProps> = ({ formData }) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Check if multi-stage is enabled
  const isMultiStage = formData.settings.enableMultiStage && formData.fields.length > 0;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    setValidationErrors(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
  };

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
  };

  // Evaluate conditional logic
  const conditionalResult = evaluateConditionalLogic(formData.fields, formValues);
  const endCheck = shouldEndForm(formData.fields, formValues);
  
  // Use visible fields from conditional logic
  const fieldsToRender = conditionalResult.visibleFields;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    for (const field of fieldsToRender) {
      if (field.required) {
        const value = formValues[field.id];
        if (value === undefined || value === null || value === '') {
          errors[field.id] = `"${field.label}" is required`;
        } else if (field.type === 'checkbox' && value === false) {
          errors[field.id] = `"${field.label}" is required`;
        }
      }
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
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
            Form Preview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            See how your form will look to users
          </p>
        </div>

        <div className="flex justify-center">
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg max-w-2xl w-full">
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
                fontFamily: formData.theme.fontFamily 
              }}
            >
              <div className="text-center">
                <h2 
                  className="text-2xl font-bold mb-4"
                  style={{ 
                    color: formData.theme.textColor,
                    fontFamily: formData.theme.fontFamily 
                  }}
                >
                  {endCheck.endTitle || 'Form Complete'}
                </h2>
                <p 
                  className="text-lg"
                  style={{ 
                    color: formData.theme.textColor,
                    fontFamily: formData.theme.fontFamily 
                  }}
                >
                  {endCheck.endMessage || 'Thank you for your responses!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If multi-stage is enabled, use the MultiStageFormPreview component
  if (isMultiStage) {
    return <MultiStageFormPreview formData={formData} />;
  }

  const renderField = (field: any) => {
    const commonClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50`;
    const inputClasses = `${commonClasses} focus:ring-purple-500 focus:border-purple-500`;
    
    const fieldStyle = {
      borderColor: formData.theme.borderColor,
      borderRadius: `${formData.theme.borderRadius}px`,
      fontSize: `${formData.theme.fontSize}px`,
      fontFamily: formData.theme.fontFamily,
      color: formData.theme.textColor,
      backgroundColor: formData.theme.backgroundColor,
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
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formValues[field.id] || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              required={field.required}
              className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              style={{ accentColor: formData.theme.primaryColor }}
            />
            <span style={labelStyle}>I agree to the terms and conditions</span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formValues[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className="border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  style={{ accentColor: formData.theme.primaryColor }}
                />
                <span style={{ ...labelStyle, fontSize: `${formData.theme.fontSize}px` }}>
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

  const containerStyle = {
    backgroundColor: formData.theme.backgroundColor,
    fontFamily: formData.theme.fontFamily,
    padding: `${formData.theme.spacing * 2}px`,
  };

  const headingStyle = {
    color: formData.theme.textColor,
    fontSize: `${formData.theme.fontSize + 8}px`,
    fontFamily: formData.theme.fontFamily,
    marginBottom: `${formData.theme.spacing}px`,
  };

  const descriptionStyle = {
    color: formData.theme.textColor,
    fontSize: `${formData.theme.fontSize}px`,
    fontFamily: formData.theme.fontFamily,
    marginBottom: `${formData.theme.spacing * 2}px`,
    opacity: 0.8,
  };

  const buttonStyle = {
    backgroundColor: formData.theme.primaryColor,
    borderRadius: `${formData.theme.borderRadius}px`,
    fontSize: `${formData.theme.fontSize}px`,
    fontFamily: formData.theme.fontFamily,
    padding: `${formData.theme.spacing}px ${formData.theme.spacing * 2}px`,
  };

  const labelStyle = {
    fontSize: `${formData.theme.fontSize + 2}px`,
    fontFamily: formData.theme.fontFamily,
    color: formData.theme.textColor,
    marginBottom: `${formData.theme.spacing / 2}px`,
  };

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Form Preview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            See how your form will look to users
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-2 rounded-md ${
              previewMode === 'desktop'
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <ComputerDesktopIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-2 rounded-md ${
              previewMode === 'mobile'
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <DevicePhoneMobileIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex justify-center">
        <div
          className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg ${
            previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl w-full'
          }`}
        >
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b border-gray-300 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-xs text-gray-600 dark:text-gray-400">
                {previewMode === 'mobile' ? 'Mobile Preview' : 'Desktop Preview'}
              </div>
            </div>
          </div>

          <div 
            className="min-h-96 overflow-y-auto"
            style={containerStyle}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header Image */}
              {formData.theme.headerImage && (
                <div 
                  className="w-full bg-cover bg-center rounded-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${formData.theme.headerImage})`,
                    height: `${formData.theme.headerImageHeight || 200}px`,
                    backgroundSize: formData.theme.headerImageFit || 'cover',
                    backgroundPosition: 'center',
                    opacity: formData.theme.headerImageOpacity || 1,
                    marginBottom: `${formData.theme.spacing}px`,
                  }}
                />
              )}
              
              {/* Form Header */}
              {formData.name && (
                <h1 style={headingStyle} className="font-bold">
                  {formData.name}
                </h1>
              )}
              
              {formData.description && (
                <p style={descriptionStyle}>
                  {formData.description}
                </p>
              )}

              {/* Form Fields */}
              {formData.fields.length === 0 ? (
                <div className="text-center py-12">
                  <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No fields to preview</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add some fields to see the form preview
                  </p>
                </div>
              ) : fieldsToRender.length === 0 ? (
                <div className="text-center py-12">
                  <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No visible fields</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All fields are currently hidden by conditional logic
                  </p>
                </div>
              ) : (
                <div style={{ gap: `${formData.theme.spacing * 1.5}px` }} className="flex flex-col">
                  {fieldsToRender.map((field) => {
                    // Get the potentially modified field from conditional result
                    const modifiedField = conditionalResult.modifiedFields.find(f => f.id === field.id) || field;
                    
                    return (
                      <div key={field.id}>
                        {field.type !== 'checkbox' && (
                          <label 
                            className="block font-medium mb-1"
                            style={labelStyle}
                          >
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                        )}
                        
                        {renderField(modifiedField)}
                        
                        {field.description && (
                          <p
                            className="mt-1 text-xs opacity-75"
                            style={{
                              color: formData.theme.textColor,
                              fontSize: `${formData.theme.fontSize - 2}px`,
                              fontFamily: formData.theme.fontFamily
                            }}
                          >
                            {field.description}
                          </p>
                        )}

                        {validationErrors[field.id] && (
                          <p className="mt-1 text-sm text-red-500 font-medium">
                            {validationErrors[field.id]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* reCAPTCHA */}
              {formData.settings.enableCaptcha && (
                <div className="pt-4 flex justify-center">
                  <MockRecaptcha
                    onVerify={handleRecaptchaVerify}
                    onExpire={handleRecaptchaExpire}
                    theme={formData.theme.backgroundColor === '#1f2937' ? 'dark' : 'light'}
                    size="normal"
                  />
                </div>
              )}

              {/* Submit Button */}
              {formData.fields.length > 0 && (
                <div className="pt-4">
                  <button
                    type="submit"
                    className="text-white font-medium hover:opacity-90 transition-opacity"
                    style={buttonStyle}
                  >
                    {formData.settings.submitButtonText}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Form Stats */}
      {formData.fields.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Form Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Fields:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                {formData.fields.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Visible:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                {fieldsToRender.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Required:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                {fieldsToRender.filter(f => f.required).length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Est. Time:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                {Math.max(1, Math.ceil(fieldsToRender.length / 3))} min
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormPreview;
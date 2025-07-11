import React from 'react';
import { type FormSettings } from '~/lib/api/forms';
import {
  Cog6ToothIcon,
  EnvelopeIcon,
  LinkIcon,
  ClockIcon,
  EyeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface FormSettingsEditorProps {
  settings: FormSettings;
  onSettingsChange: (settings: FormSettings) => void;
}

const FormSettingsEditor: React.FC<FormSettingsEditorProps> = ({ settings, onSettingsChange }) => {
  const updateSettings = (updates: Partial<FormSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Form Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure how your form behaves and where submissions are handled
        </p>
      </div>

      {/* Basic Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Cog6ToothIcon className="h-4 w-4 mr-2" />
          Basic Settings
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Submit Button Text
            </label>
            <input
              type="text"
              value={settings.submitButtonText}
              onChange={(e) => updateSettings({ submitButtonText: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Submit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Success Message
            </label>
            <textarea
              value={settings.successMessage}
              onChange={(e) => updateSettings({ successMessage: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Thank you for your submission!"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Message shown to users after successful form submission
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Message
            </label>
            <textarea
              value={settings.errorMessage}
              onChange={(e) => updateSettings({ errorMessage: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Sorry, there was an error submitting your form. Please try again."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Message shown when form submission fails
            </p>
          </div>
        </div>
      </div>

      {/* Submission Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <EnvelopeIcon className="h-4 w-4 mr-2" />
          Submission Settings
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Email
            </label>
            <input
              type="email"
              value={settings.notificationEmail}
              onChange={(e) => updateSettings({ notificationEmail: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="admin@company.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email address to receive form submissions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Redirect URL (Optional)
            </label>
            <input
              type="url"
              value={settings.redirectUrl || ''}
              onChange={(e) => updateSettings({ redirectUrl: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="https://example.com/thank-you"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL to redirect users after successful submission
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Store Submissions
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Save submissions to your CRM database
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.storeSubmissions}
                onChange={(e) => updateSettings({ storeSubmissions: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Access & Security */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <LockClosedIcon className="h-4 w-4 mr-2" />
          Access & Security
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Require Authentication
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Only logged-in users can submit this form
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireAuth}
                onChange={(e) => updateSettings({ requireAuth: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable CAPTCHA
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add CAPTCHA verification to prevent spam
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableCaptcha}
                onChange={(e) => updateSettings({ enableCaptcha: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Obfuscate Form ID
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use encrypted tokens instead of direct form IDs in sharing URLs for enhanced privacy
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.obfuscateFormId}
                onChange={(e) => updateSettings({ obfuscateFormId: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Submission Limit (per user)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                value={settings.submissionLimit || ''}
                onChange={(e) => updateSettings({ submissionLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Unlimited"
              />
              <select
                value={settings.submissionLimitPeriod}
                onChange={(e) => updateSettings({ submissionLimitPeriod: e.target.value as 'hour' | 'day' | 'week' | 'month' })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="hour">per Hour</option>
                <option value="day">per Day</option>
                <option value="week">per Week</option>
                <option value="month">per Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ClockIcon className="h-4 w-4 mr-2" />
          Availability
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={settings.startDate || ''}
                onChange={(e) => updateSettings({ startDate: e.target.value || undefined })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={settings.endDate || ''}
                onChange={(e) => updateSettings({ endDate: e.target.value || undefined })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Closed Message
            </label>
            <textarea
              value={settings.closedMessage}
              onChange={(e) => updateSettings({ closedMessage: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="This form is currently closed for submissions."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Message shown when form is outside availability window
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Stage Form Settings */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ArrowRightIcon className="h-4 w-4 mr-2" />
          Multi-Stage Form
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Multi-Stage Form
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Split form into multiple screens with one field per screen
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableMultiStage}
                onChange={(e) => updateSettings({ enableMultiStage: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {settings.enableMultiStage && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Next Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.nextButtonText}
                    onChange={(e) => updateSettings({ nextButtonText: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Next"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Previous Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.previousButtonText}
                    onChange={(e) => updateSettings({ previousButtonText: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Previous"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Step Indicator
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display progress dots showing current step
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showStepIndicator}
                    onChange={(e) => updateSettings({ showStepIndicator: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow Step Navigation
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow users to click on step indicators to navigate
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowStepNavigation}
                    onChange={(e) => updateSettings({ allowStepNavigation: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <EyeIcon className="h-4 w-4 mr-2" />
          Advanced Options
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow Multiple Submissions
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow users to submit this form multiple times
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowMultipleSubmissions}
                onChange={(e) => updateSettings({ allowMultipleSubmissions: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Progress Bar
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Display completion progress for multi-step forms
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showProgressBar}
                onChange={(e) => updateSettings({ showProgressBar: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-save Draft
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically save user progress as they fill the form
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSaveDraft}
                onChange={(e) => updateSettings({ autoSaveDraft: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Settings Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-blue-700 dark:text-blue-300">
              • Submit button: "{settings.submitButtonText}"
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              • Notifications: {settings.notificationEmail || 'None configured'}
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              • Authentication: {settings.requireAuth ? 'Required' : 'Not required'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-blue-700 dark:text-blue-300">
              • CAPTCHA: {settings.enableCaptcha ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              • Form ID obfuscation: {settings.obfuscateFormId ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              • Multiple submissions: {settings.allowMultipleSubmissions ? 'Allowed' : 'Not allowed'}
            </div>
            <div className="text-blue-700 dark:text-blue-300">
              • Data storage: {settings.storeSubmissions ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSettingsEditor;
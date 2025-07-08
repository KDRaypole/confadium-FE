import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import PublicFormRenderer from "~/components/forms/PublicFormRenderer";
import { formsApi, type Form } from "~/lib/api/forms";
import { 
  ExclamationTriangleIcon, 
  DocumentTextIcon,
  LinkIcon,
  ClockIcon 
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Form" },
    { name: "description", content: "Public form" },
    { name: "robots", content: "noindex, nofollow" }
  ];
};

export default function PublicForm() {
  const { formId } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load form data on component mount and when formId changes
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) {
        setError("Form ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Force sync data between storage mechanisms
        formsApi.syncData();
        
        // Debug: log current store state
        console.log('Public form - store state:', formsApi.getStoreState());
        
        const formData = await formsApi.getPublicForm(formId);
        console.log('Public form - retrieved form:', formData);
        setForm(formData);
      } catch (err) {
        console.error("Error loading public form:", err);
        setError("Failed to load form");
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const handleSubmit = async (data: Record<string, any>) => {
    if (!formId) {
      return { success: false, message: "Form ID is missing" };
    }

    try {
      const result = await formsApi.submitForm(formId, data);
      setSubmitResult(result);
      return result;
    } catch (error) {
      const result = { 
        success: false, 
        message: "An unexpected error occurred. Please try again." 
      };
      setSubmitResult(result);
      return result;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading form...</p>
        </div>
      </div>
    );
  }

  // Form not found or error loading
  if (!form || error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            {error ? (
              <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
            ) : (
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {error ? "Error Loading Form" : "Form Not Available"}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || 
             "The form you're looking for is either not available, has been disabled, or doesn't exist."
            }
          </p>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Possible reasons:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
              <li className="flex items-start">
                <LinkIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                The form URL may be incorrect or outdated
              </li>
              <li className="flex items-start">
                <ClockIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                The form may have been disabled or archived
              </li>
              <li className="flex items-start">
                <DocumentTextIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                The form may have reached its submission limit
              </li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            If you believe this is an error, please contact the form owner.
          </p>
        </div>
      </div>
    );
  }

  // Check if form requires authentication
  if (form.settings.requireAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Authentication Required
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            This form requires you to be logged in to submit a response. Please contact the form owner for access.
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            If you believe this is an error, please contact the form owner.
          </p>
        </div>
      </div>
    );
  }

  // Check submission limits
  if (form.settings.submissionLimit && form.submissions >= form.settings.submissionLimit) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          backgroundColor: form.theme.backgroundColor,
          fontFamily: form.theme.fontFamily 
        }}
      >
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <ExclamationTriangleIcon 
              className="mx-auto h-16 w-16"
              style={{ color: form.theme.primaryColor }}
            />
          </div>
          
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ 
              color: form.theme.textColor,
              fontFamily: form.theme.fontFamily 
            }}
          >
            Form No Longer Available
          </h1>
          
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: form.theme.backgroundColor,
              borderColor: form.theme.borderColor,
              borderRadius: `${form.theme.borderRadius}px`
            }}
          >
            <p 
              className="text-lg"
              style={{ 
                color: form.theme.textColor,
                fontFamily: form.theme.fontFamily 
              }}
            >
              This form has reached its submission limit and is no longer accepting responses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if form is within availability window
  const now = new Date();
  const startDate = form.settings.startDate ? new Date(form.settings.startDate) : null;
  const endDate = form.settings.endDate ? new Date(form.settings.endDate) : null;

  const isOutsideAvailabilityWindow = 
    (startDate && now < startDate) || 
    (endDate && now > endDate);

  if (isOutsideAvailabilityWindow) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          backgroundColor: form.theme.backgroundColor,
          fontFamily: form.theme.fontFamily 
        }}
      >
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <ClockIcon 
              className="mx-auto h-16 w-16"
              style={{ color: form.theme.primaryColor }}
            />
          </div>
          
          <h1 
            className="text-2xl font-bold mb-4"
            style={{ 
              color: form.theme.textColor,
              fontFamily: form.theme.fontFamily 
            }}
          >
            Form Currently Unavailable
          </h1>
          
          <div 
            className="p-6 rounded-lg border"
            style={{ 
              backgroundColor: form.theme.backgroundColor,
              borderColor: form.theme.borderColor,
              borderRadius: `${form.theme.borderRadius}px`
            }}
          >
            <p 
              className="text-lg"
              style={{ 
                color: form.theme.textColor,
                fontFamily: form.theme.fontFamily 
              }}
            >
              {form.settings.closedMessage}
            </p>
            
            {(startDate || endDate) && (
              <div className="mt-4 text-sm opacity-75">
                {startDate && now < startDate && (
                  <p style={{ color: form.theme.textColor }}>
                    Available from: {startDate.toLocaleDateString()}
                  </p>
                )}
                {endDate && now > endDate && (
                  <p style={{ color: form.theme.textColor }}>
                    Was available until: {endDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <PublicFormRenderer form={form} onSubmit={handleSubmit} />;
}
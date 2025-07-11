import React, { useState, useEffect } from 'react';
import { CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface MockRecaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

const MockRecaptcha: React.FC<MockRecaptchaProps> = ({
  onVerify,
  onExpire,
  theme = 'light',
  size = 'normal'
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    
    // Simulate reCAPTCHA verification delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Simulate success (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      setIsVerified(true);
      setIsVerifying(false);
      // Generate a mock token
      const mockToken = `mock_recaptcha_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      onVerify(mockToken);
      
      // Simulate token expiration after 2 minutes
      setTimeout(() => {
        setHasExpired(true);
        setIsVerified(false);
        onExpire?.();
      }, 120000);
    } else {
      // Simulate failure
      setIsVerifying(false);
      setTimeout(() => {
        setHasExpired(true);
      }, 500);
    }
  };

  const handleReset = () => {
    setIsVerified(false);
    setHasExpired(false);
  };

  const containerClasses = `
    ${size === 'compact' ? 'w-64 h-16' : 'w-80 h-20'}
    border-2 rounded-md flex items-center justify-between px-4 py-2
    ${theme === 'dark' 
      ? 'bg-gray-800 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
    }
    ${hasExpired ? 'border-red-400' : 'border-gray-300'}
  `;

  const buttonClasses = `
    ${size === 'compact' ? 'w-8 h-8' : 'w-10 h-10'}
    border-2 rounded flex items-center justify-center cursor-pointer transition-all
    ${theme === 'dark' 
      ? 'border-gray-500 hover:border-gray-400' 
      : 'border-gray-400 hover:border-gray-500'
    }
    ${isVerified ? 'bg-green-500 border-green-500' : ''}
    ${hasExpired ? 'bg-red-500 border-red-500' : ''}
  `;

  return (
    <div className={containerClasses}>
      <div className="flex items-center space-x-3">
        <div
          className={buttonClasses}
          onClick={isVerified || isVerifying ? undefined : (hasExpired ? handleReset : handleVerify)}
        >
          {isVerifying ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
          ) : isVerified ? (
            <CheckIcon className="h-5 w-5 text-white" />
          ) : hasExpired ? (
            <ArrowPathIcon className="h-5 w-5 text-white" />
          ) : (
            <div className="w-4 h-4 border-2 border-gray-400 rounded-sm" />
          )}
        </div>
        
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {isVerifying ? 'Verifying...' : 
             isVerified ? 'Verified' : 
             hasExpired ? 'Verification expired' : 
             "I'm not a robot"}
          </span>
          {hasExpired && (
            <span className="text-xs text-red-500">
              Click to retry
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="text-xs text-gray-500 mb-1">reCAPTCHA</div>
        <div className="flex text-xs text-gray-400 space-x-2">
          <span>Privacy</span>
          <span>•</span>
          <span>Terms</span>
        </div>
      </div>
    </div>
  );
};

export default MockRecaptcha;
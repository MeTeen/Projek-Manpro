import React from 'react';

type ErrorStateVariant = 'error' | 'warning' | 'info' | 'success';

interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  message: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  variant = 'error',
  title,
  message,
  actions,
  icon,
  onRetry
}) => {
  const getVariantClasses = (variant: ErrorStateVariant) => {
    switch (variant) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-500'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500'
        };
    }
  };

  const variantClasses = getVariantClasses(variant);

  const getButtonColor = (variant: ErrorStateVariant) => {
    switch (variant) {
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-red-500 hover:bg-red-600';
    }
  };

  const defaultIcon = (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className={variantClasses.icon}
    >
      {variant === 'error' && (
        <>
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </>
      )}
      {variant === 'warning' && (
        <>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </>
      )}
      {variant === 'info' && (
        <>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </>
      )}
      {variant === 'success' && (
        <>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </>
      )}
    </svg>
  );  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 my-4 ${variantClasses.container}`}>
      <div className="flex-shrink-0">
        {icon || defaultIcon}
      </div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="m-0 mb-1 text-sm font-semibold">
            {title}
          </h4>
        )}
        
        <p className="m-0 text-sm leading-relaxed">
          {message}
        </p>
        
        {(actions || onRetry) && (
          <div className="mt-3 flex gap-2 items-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`px-3 py-1 text-white border-none rounded text-xs font-medium cursor-pointer transition-all duration-200 ${getButtonColor(variant)}`}
              >
                Try Again
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

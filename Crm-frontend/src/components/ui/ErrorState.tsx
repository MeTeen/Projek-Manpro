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
  const getIconColor = (variant: ErrorStateVariant) => {
    switch (variant) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      case 'success':
        return '#10b981';
      default:
        return '#ef4444';
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
      style={{ color: getIconColor(variant) }}
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
    <div style={{ 
      border: `1px solid ${variant === 'error' ? '#fecaca' : variant === 'warning' ? '#fde68a' : variant === 'info' ? '#bfdbfe' : '#bbf7d0'}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      margin: '16px 0',
      backgroundColor: variant === 'error' ? '#fef2f2' : variant === 'warning' ? '#fffbeb' : variant === 'info' ? '#eff6ff' : '#f0fdf4'
    }}>
      <div style={{ flexShrink: 0 }}>
        {icon || defaultIcon}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <h4 style={{ margin: 0, marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>
            {title}
          </h4>
        )}
        
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          {message}
        </p>
        
        {(actions || onRetry) && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onRetry && (
              <button
                onClick={onRetry}
                style={{
                  padding: '4px 12px',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: variant === 'error' ? '#dc2626' : variant === 'warning' ? '#d97706' : variant === 'info' ? '#2563eb' : '#16a34a'
                }}
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

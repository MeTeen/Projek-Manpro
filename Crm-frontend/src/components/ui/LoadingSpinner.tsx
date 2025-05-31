import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  centered?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = '#5E5CEB', 
  text,
  centered = false 
}) => {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 border-2';
      case 'md':
        return 'w-6 h-6 border-[3px]';
      case 'lg':
        return 'w-8 h-8 border-[3px]';
      default:
        return 'w-6 h-6 border-[3px]';
    }
  };

  const containerClasses = [
    'flex items-center',
    centered ? 'justify-center min-h-[200px] flex-col gap-3' : 'justify-start',
    text && !centered ? 'gap-2.5' : ''
  ].filter(Boolean).join(' ');

  const spinnerClasses = [
    getSizeClasses(size),
    'border-gray-200 rounded-full animate-spin inline-block'
  ].join(' ');

  return (
    <div className={containerClasses}>
      <div 
        className={spinnerClasses}
        style={{ borderTopColor: color }}
      />
      {text && (
        <span className="text-gray-500 text-sm font-medium">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;

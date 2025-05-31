import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props 
}) => {
  const getVariantClasses = (variant: ButtonVariant) => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-600 text-white border-none hover:bg-indigo-700';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 border-none hover:bg-gray-200';
      case 'danger':
        return 'bg-red-500 text-white border-none hover:bg-red-600';
      case 'success':
        return 'bg-emerald-500 text-white border-none hover:bg-emerald-600';
      case 'outline':
        return 'bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white';
      default:
        return 'bg-indigo-600 text-white border-none hover:bg-indigo-700';
    }
  };

  const getSizeClasses = (size: ButtonSize) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs font-medium';
      case 'md':
        return 'px-4 py-2.5 text-sm font-medium';
      case 'lg':
        return 'px-5 py-3 text-base font-medium';
      default:
        return 'px-4 py-2.5 text-sm font-medium';
    }
  };

  const baseClasses = [
    'flex items-center justify-center',
    icon ? 'gap-2' : '',
    'rounded transition-all duration-200 ease-in-out',
    'font-inherit outline-none',
    fullWidth ? 'w-full' : '',
    (disabled || loading) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
    getVariantClasses(variant),
    getSizeClasses(size),
    className
  ].filter(Boolean).join(' ');
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={baseClasses}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;

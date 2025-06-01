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
  style,
  ...props 
}) => {
  const getVariantStyles = (variant: ButtonVariant) => {
    const baseStyle = {
      border: 'none',
      borderRadius: '4px',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      fontSize: '14px',
      fontWeight: 500,
      outline: 'none',
      transition: 'all 0.2s ease',
      opacity: disabled || loading ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#4F46E5',
          color: 'white',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#F3F4F6',
          color: '#374151',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#EF4444',
          color: 'white',
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: '#10B981',
          color: 'white',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: '#4F46E5',
          border: '1px solid #4F46E5',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#4F46E5',
          color: 'white',
        };
    }
  };

  const getSizeStyles = (size: ButtonSize) => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px' };
      case 'md':
        return { padding: '8px 16px' };
      case 'lg':
        return { padding: '12px 24px' };
      default:
        return { padding: '8px 16px' };
    }
  };

  const buttonStyle = {
    ...getVariantStyles(variant),
    ...getSizeStyles(size),
    width: fullWidth ? '100%' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: icon ? '8px' : '0',
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={buttonStyle}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = '#3730A3';
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = '#E5E7EB';
          } else if (variant === 'danger') {
            e.currentTarget.style.backgroundColor = '#DC2626';
          } else if (variant === 'success') {
            e.currentTarget.style.backgroundColor = '#047857';
          } else if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = '#4F46E5';
            e.currentTarget.style.color = 'white';
          }
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          const originalStyle = getVariantStyles(variant);
          e.currentTarget.style.backgroundColor = originalStyle.backgroundColor || 'transparent';
          e.currentTarget.style.color = originalStyle.color || 'inherit';
        }
        props.onMouseLeave?.(e);
      }}
    >
      {loading ? (
        <>
          <div 
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
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

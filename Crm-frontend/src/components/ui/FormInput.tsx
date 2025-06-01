import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  error, 
  required = false, 
  fullWidth = true,
  className = '',
  ...props 
}) => {
  const baseInputStyles = {
    width: fullWidth ? '100%' : 'auto',
    padding: '10px',
    border: error ? '1px solid #EF4444' : '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  };

  const focusStyles = {
    borderColor: '#5E5CEB',
    boxShadow: '0 0 0 1px #5E5CEB',
  };

  return (
    <div style={{ marginBottom: '8px' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontWeight: 500,
          fontSize: '14px',
          color: '#374151'
        }}>
          {label}{required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        {...props}
        required={required}
        style={{
          ...baseInputStyles,
          ...props.style
        }}
        className={className}
        onFocus={(e) => {
          Object.assign(e.target.style, focusStyles);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#EF4444' : '#ddd';
          e.target.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
      />
      {error && (
        <p style={{ 
          color: '#EF4444', 
          fontSize: '12px', 
          marginTop: '4px', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;

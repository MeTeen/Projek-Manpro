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
  };

  const focusStyles = {
    borderColor: '#5E5CEB',
    boxShadow: '0 0 0 1px #5E5CEB',
  };
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-1.5 font-medium text-sm text-gray-700">
          {label}{required && <span className="text-red-500"> *</span>}
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
        <p className="text-red-500 text-xs mt-1 m-0">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;

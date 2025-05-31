import React from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  options: { value: string | number; label: string }[];
}

const FormSelect: React.FC<FormSelectProps> = ({ 
  label, 
  error, 
  required = false, 
  fullWidth = true,
  options,
  className = '',
  ...props 
}) => {
  const baseSelectStyles = {
    width: fullWidth ? '100%' : 'auto',
    padding: '10px',
    border: error ? '1px solid #EF4444' : '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#fff',
    cursor: 'pointer',
    height: '44px',
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
      <select
        {...props}
        required={required}
        style={{
          ...baseSelectStyles,
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
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1 m-0">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;

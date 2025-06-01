import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const FormTextarea: React.FC<FormTextareaProps> = ({ 
  label, 
  error, 
  required = false, 
  fullWidth = true,
  className = '',
  ...props 
}) => {
  const baseTextareaStyles = {
    width: fullWidth ? '100%' : 'auto',
    padding: '10px',
    border: error ? '1px solid #EF4444' : '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  };

  const focusStyles = {
    borderColor: '#5E5CEB',
    boxShadow: '0 0 0 1px #5E5CEB',
  };
  return (
    <div style={{ marginBottom: '16px' }}>
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
      <textarea
        {...props}
        required={required}
        style={{
          ...baseTextareaStyles,
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
          margin: 0 
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormTextarea;

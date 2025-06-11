import React from 'react';

export interface ContactInfo {
  label: string;
  value: string;
  icon: string;
}

export interface NeedHelpProps {
  /** Title of the help section */
  title?: string;
  /** Description text */
  description?: string;
  /** Contact information to display */
  contacts?: ContactInfo[];
  /** Action buttons (for more complex use cases) */
  buttons?: React.ReactNode;
  /** Variant style - affects colors and layout */
  variant?: 'customer' | 'admin' | 'default';
  /** Custom styling */
  style?: React.CSSProperties;
  /** Custom container styling */
  containerStyle?: React.CSSProperties;
}

/**
 * NeedHelp Component - A reusable help section with contact information
 * 
 * @example
 * // Customer portal usage
 * <NeedHelp 
 *   variant="customer"
 *   title="Need Help?"
 *   description="Contact our customer support team for assistance with your account or products."
 *   contacts={[
 *     { icon: "📱", label: "Phone", value: "+62 812-3456-7890" },
 *     { icon: "✉️", label: "Email", value: "support@mebelpremium.com" }
 *   ]}
 * />
 * 
 * @example
 * // Admin panel usage with buttons
 * <NeedHelp 
 *   variant="admin"
 *   title="Need Help?"
 *   description="If you have any questions or suggestions about this application, feel free to contact the development team."
 *   buttons={
 *     <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
 *       <button>📧 Contact Team</button>
 *       <button>📚 Documentation</button>
 *     </div>
 *   }
 * />
 */
const NeedHelp: React.FC<NeedHelpProps> = ({ 
  title = "Need Help?",
  description,
  contacts = [],
  buttons,
  variant = 'default',
  style = {},
  containerStyle = {}
}) => {
  // Define variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'customer':
        return {
          backgroundColor: '#FFF8DC',
          borderColor: '#D2691E',
          titleColor: '#8B4513',
          textColor: '#6b5b47',
          contactColor: '#8B4513'
        };
      case 'admin':
        return {
          backgroundColor: '#f3f4f6',
          borderColor: '#e5e7eb',
          titleColor: '#111827',
          textColor: '#4b5563',
          contactColor: '#374151'
        };
      default:
        return {
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb',
          titleColor: '#374151',
          textColor: '#6b7280',
          contactColor: '#374151'
        };
    }
  };

  const variantStyles = getVariantStyles();

  const defaultContainerStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: variantStyles.backgroundColor,
    borderRadius: '12px',
    border: `1px solid ${variantStyles.borderColor}`,
    textAlign: 'center',
    ...containerStyle
  };

  const titleStyle: React.CSSProperties = {
    color: variantStyles.titleColor,
    fontWeight: '600',
    marginBottom: '8px',
    fontSize: '16px',
    margin: '0 0 8px 0'
  };

  const descriptionStyle: React.CSSProperties = {
    color: variantStyles.textColor,
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: contacts.length > 0 || buttons ? '16px' : '0',
    margin: '0'
  };

  const contactsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    fontSize: '14px',
    flexWrap: 'wrap'
  };

  const contactStyle: React.CSSProperties = {
    color: variantStyles.contactColor,
    fontWeight: '600'
  };

  return (
    <div style={{ ...defaultContainerStyle, ...style }}>
      <h4 style={titleStyle}>
        {title}
      </h4>
      
      {description && (
        <p style={descriptionStyle}>
          {description}
        </p>
      )}
      
      {contacts.length > 0 && (
        <div style={contactsContainerStyle}>
          {contacts.map((contact, index) => (
            <span key={index} style={contactStyle}>
              {contact.icon} {contact.value}
            </span>
          ))}
        </div>
      )}
      
      {buttons && (
        <div style={{ marginTop: contacts.length > 0 ? '12px' : '0' }}>
          {buttons}
        </div>
      )}
    </div>
  );
};

export default NeedHelp;

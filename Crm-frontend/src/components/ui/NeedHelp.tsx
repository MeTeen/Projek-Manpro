import React from 'react';

export interface ContactInfo {
  label: string;
  value: string;
  icon: string;
  type?: 'phone' | 'email' | 'whatsapp' | 'default';
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
  /** Callback when a contact is clicked */
  onContactClick?: (contact: ContactInfo) => void;
}

/**
 * NeedHelp Component - A reusable help section with contact information
 *  * @example
 * // Customer portal usage
 * <NeedHelp 
 *   variant="customer"
 *   title="Need Help?"
 *   description="Contact our customer support team for assistance with your account or products."
 *   contacts={[
 *     { icon: "📱", label: "Phone", value: "+62 812-3456-7890", type: "phone" },
 *     { icon: "✉️", label: "Email", value: "help@beefurniture.com", type: "email" },
 *     { icon: "💬", label: "WhatsApp", value: "+62 812-3456-7890", type: "whatsapp" }
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
  style = {},  containerStyle = {},
  onContactClick
}) => {

  // Handle contact click with default behavior if no custom handler provided
  const handleContactClick = (contact: ContactInfo) => {
    if (onContactClick) {
      onContactClick(contact);
    } else {
      // Default behavior based on contact type
      if (contact.type === 'email' || contact.label.toLowerCase().includes('email')) {
        window.open(`mailto:${contact.value}`, '_blank');
      } else if (contact.type === 'whatsapp' || contact.label.toLowerCase().includes('whatsapp')) {
        // Extract phone number and format for WhatsApp
        const phoneNumber = contact.value.replace(/[^\d]/g, ''); // Remove all non-digits (spaces, dashes, etc.)
        const formattedPhone = phoneNumber.startsWith('62') ? phoneNumber : `62${phoneNumber.replace(/^0/, '')}`;
        window.open(`https://wa.me/${formattedPhone}`, '_blank');
      } else if (contact.type === 'phone' || contact.label.toLowerCase().includes('phone')) {
        window.open(`tel:${contact.value}`, '_blank');
      }
    }
  };
  const defaultContainerStyle: React.CSSProperties = {
    textAlign: 'center', 
    backgroundColor: '#FFF8DC', 
    padding: '40px', 
    borderRadius: '16px',
    border: '2px solid #D2691E',
    ...containerStyle
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px', 
    fontWeight: 'bold', 
    color: '#8B4513', 
    marginBottom: '16px',
    margin: '0 0 16px 0'
  };

  const descriptionStyle: React.CSSProperties = {
    color: '#654321', 
    fontSize: '16px', 
    marginBottom: contacts.length > 0 || buttons ? '20px' : '0',
    margin: '0 0 20px 0'
  };
  const contactsContainerStyle: React.CSSProperties = {
    display: 'flex', 
    justifyContent: 'center', 
    gap: '40px', 
    flexWrap: 'wrap'
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
      )}      {contacts.length > 0 && (
        <div style={contactsContainerStyle}>
          {contacts.map((contact, index) => (
            <div key={index}>
              <strong 
                style={{ color: '#8B4513', cursor: 'pointer' }}
                onClick={() => handleContactClick(contact)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5DEB3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={`Click to ${contact.type === 'email' || contact.label.toLowerCase().includes('email') ? 'send email' : 
                       contact.type === 'whatsapp' || contact.label.toLowerCase().includes('whatsapp') ? 'open WhatsApp' : 
                       'contact'} ${contact.value}`}
              >
                {contact.icon} {contact.label}:
              </strong><br />
              <span 
                style={{ color: '#654321', cursor: 'pointer' }}
                onClick={() => handleContactClick(contact)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5DEB3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={`Click to ${contact.type === 'email' || contact.label.toLowerCase().includes('email') ? 'send email' : 
                       contact.type === 'whatsapp' || contact.label.toLowerCase().includes('whatsapp') ? 'open WhatsApp' : 
                       'contact'} ${contact.value}`}
              >
                {contact.value}
              </span>
            </div>
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

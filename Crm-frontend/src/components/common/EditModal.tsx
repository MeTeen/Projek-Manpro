/* src/components/common/EditModal.tsx */
import React, { ReactNode, FormEvent } from 'react';

export interface EditModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  width?: string;
  minHeight?: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,  width = '500px',
}) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          width
        }}
      >
        <h2 style={{
          marginTop: '0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
        }}>{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '10px',
                paddingBottom: '10px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: '0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
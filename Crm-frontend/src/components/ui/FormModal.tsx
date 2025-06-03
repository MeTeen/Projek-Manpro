import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: React.ReactNode;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  size = 'md',
  loading = false,
  disabled = false,
  icon
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const titleWithIcon = icon ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon}
      <span>{title}</span>
    </div>
  ) : title;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleWithIcon}
      size={size}
    >      <form id="modal-form" onSubmit={handleSubmit} style={{ 
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '16px'
        }}>
          {children}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px', 
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
          flexShrink: 0,
          backgroundColor: 'white'
        }}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={disabled || loading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FormModal;

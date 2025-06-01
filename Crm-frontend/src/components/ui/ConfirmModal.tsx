import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { MdWarning, MdDelete, MdInfo, MdCheckCircle } from 'react-icons/md';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  icon
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'danger':
        return <MdDelete size={22} style={{ color: '#dc2626' }} />;
      case 'warning':
        return <MdWarning size={22} style={{ color: '#d97706' }} />;
      case 'info':
        return <MdInfo size={22} style={{ color: '#2563eb' }} />;
      case 'success':
        return <MdCheckCircle size={22} style={{ color: '#16a34a' }} />;
      default:
        return <MdWarning size={22} style={{ color: '#6b7280' }} />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const titleWithIcon = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {icon || getDefaultIcon()}
      <span>{title}</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleWithIcon}
      size="sm"
    >
      <div style={{ padding: '8px 0' }}>
        <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', margin: 0, marginBottom: '24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant() as any}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

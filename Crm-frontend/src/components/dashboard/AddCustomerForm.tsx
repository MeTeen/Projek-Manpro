import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

interface AddCustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated?: () => void;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ isOpen, onClose, onCustomerCreated }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '', lastName: '', email: '', phone: '',
    streetAddress: '', city: '', state: '', zipCode: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { authService.initializeAuth(); }, []);
  useEffect(() => { if (isOpen) checkAuthentication(); }, [isOpen]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isOpen, onClose]);

  const checkAuthentication = () => {
    authService.initializeAuth();
    setIsAuthenticated(authService.isAuthenticated());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setError('Please select an image file');
    }
  };

  const redirectToLogin = () => window.location.href = '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    authService.initializeAuth();

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (avatar) formDataToSend.append('avatar', avatar);

      toast.success('Customer created successfully!');
      if (onCustomerCreated) onCustomerCreated();
      onClose();

      setFormData({ firstName: '', lastName: '', email: '', phone: '', streetAddress: '', city: '', state: '', zipCode: '' });
      setAvatar(null);
      setAvatarPreview(null);
    } catch (err: any) {
      if (err.message?.includes('Authentication') || err.message?.includes('401')) {
        setError('Session expired. Please login again.');
        setIsAuthenticated(false);
      } else {
        setError('Failed to create customer. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      zIndex: 50
    }}>
      <div ref={formRef} style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '512px',
        overflow: 'auto',
        maxHeight: '90vh'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '8px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Add New Customer</h2>
          <button 
            onClick={onClose} 
            style={{
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {error}
            {!isAuthenticated && (
              <button 
                onClick={redirectToLogin} 
                style={{
                  marginLeft: '8px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Log In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500' }}>Avatar</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
            />
            <div 
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                cursor: 'pointer',
                marginTop: '8px',
                overflow: 'hidden',
                backgroundImage: avatarPreview ? `url(${avatarPreview})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={handleAvatarClick}
            >
              {!avatarPreview && (
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
          </div>          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Street Address</label>
            <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input type="text" name="city" value={formData.city} onChange={handleChange} style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} placeholder="City" />
            <input type="text" name="state" value={formData.state} onChange={handleChange} style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} placeholder="State" />
            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding: '8px 12px' }} placeholder="Zip Code" />
          </div>          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
            <button 
              type="button" 
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer'
              }}
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                backgroundColor: '#4f46e5',
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                opacity: isSubmitting ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#4338ca';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#4f46e5';
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;

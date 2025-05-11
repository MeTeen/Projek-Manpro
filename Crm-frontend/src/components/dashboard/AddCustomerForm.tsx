import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import customerService from '../../services/customerService';
import authService from '../../services/authService';

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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Initialize auth on mount
  useEffect(() => {
    authService.initializeAuth();
  }, []);

  // Check authentication on mount and on every open
  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen]);

  const checkAuthentication = () => {
    // Trigger auth initialization and update state
    authService.initializeAuth();
    const isLoggedIn = authService.isAuthenticated();
    setIsAuthenticated(isLoggedIn);
  };

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setAvatar(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select an image file');
      }
    }
  };

  const redirectToLogin = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Ensure auth is initialized before checking
    authService.initializeAuth();
    
   
    try {
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.streetAddress);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('zipCode', formData.zipCode);
      
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }

      try {
        // Attempt to create customer with JWT auth
        console.log('Creating customer...');
        const newCustomer = await customerService.createCustomerWithAxios(formDataToSend);
        console.log('Created customer:', newCustomer);
        
        // Panggil callback onCustomerCreated jika tersedia
        if (onCustomerCreated) {
          onCustomerCreated();
        }
        
        onClose();
      } catch (primaryError: unknown) {
        console.error('API error:', primaryError);
        
        // Check for authentication errors
        if (primaryError instanceof Error && 
            (primaryError.message.includes('Authentication failed') || 
             primaryError.message.includes('401'))) {
          setError('Your session has expired. Please log in again.');
          setIsAuthenticated(false);
          setIsSubmitting(false);
          return;
        }
        
        setError('Failed to create customer. Please try again later.');
        setIsSubmitting(false);
        return;
      }
      
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: ''
      });
      setAvatar(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error('Overall error creating customer:', err);
      setError('Failed to create customer. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="form-overlay">
      <div className="customer-form" ref={formRef}>
        <div className="form-header">
          <h2>Add New Customer</h2>
          <button className="close-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {error && (
          <div style={{ padding: '8px 16px', backgroundColor: 'var(--red-50)', color: 'var(--red-500)', marginBottom: '16px', borderRadius: '4px' }}>
            {error}
            {!isAuthenticated && (
              <button 
                onClick={redirectToLogin}
                style={{ 
                  marginLeft: '8px', 
                  padding: '4px 8px', 
                  backgroundColor: 'var(--red-500)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer' 
                }}
              >
                Log In
              </button>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label>Avatar</label>
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <div onClick={handleAvatarClick} className="avatar-add-btn" style={{
              backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {!avatarPreview && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input 
                type="tel" 
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>
          </div>
          
          <div className="form-section">
            <label>Address</label>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                id="streetAddress"
                name="streetAddress"
                className="form-input"
                value={formData.streetAddress}
                onChange={handleChange}
                placeholder="Street Address"
              />
            </div>
            
            <div className="address-row">
              <div className="form-group">
                <input 
                  type="text" 
                  id="city"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="text" 
                  id="state"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State/Province"
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="text" 
                  id="zipCode"
                  name="zipCode"
                  className="form-input"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Zip Code"
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn" 
        
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
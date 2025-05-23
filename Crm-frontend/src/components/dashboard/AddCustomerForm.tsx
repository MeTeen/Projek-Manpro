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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div ref={formRef} className="bg-white p-6 rounded-lg w-full max-w-lg overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-semibold">Add New Customer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
            {!isAuthenticated && (
              <button onClick={redirectToLogin} className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded">Log In</button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Avatar</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} ref={fileInputRef} className="hidden" />
            <div 
              className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-full cursor-pointer mt-2 overflow-hidden"
              onClick={handleAvatarClick}
              style={{ backgroundImage: avatarPreview ? `url(${avatarPreview})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {!avatarPreview && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Street Address</label>
            <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="City" />
            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="State" />
            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Zip Code" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 border rounded text-sm" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerForm;

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { toast } from 'react-toastify';

import Header from '../dashboard/Header';
import Sidebar from '../dashboard/Sidebar';
import { ConfirmModal, FormModal } from '../ui';
import FormInput from '../ui/FormInput';
import customerService, { Customer } from '../../services/customerService';
import { MdEdit, MdDelete, MdPersonAdd, MdPhotoCamera } from 'react-icons/md';
import { BACKEND_URL } from '../../utils/formatters';

const CustomersPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });  const [newCustomerData, setNewCustomerData] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      
      // Fix avatar URLs jika perlu
      const customersWithFixedAvatars = data.map(customer => {
        let avatarUrl = customer.avatarUrl;
        
        // Jika avatarUrl ada dan tidak dimulai dengan http/https, tambahkan BACKEND_URL
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          // Pastikan path dimulai dengan slash
          if (!avatarUrl.startsWith('/')) {
            avatarUrl = `/${avatarUrl}`;
          }
          avatarUrl = `${BACKEND_URL}${avatarUrl}`;
          console.log(`Fixed avatar URL for ${customer.firstName}: ${avatarUrl}`);
        }
        
        return {
          ...customer,
          avatarUrl
        };
      });
      
      console.log('Customers dengan avatar terkoreksi:', customersWithFixedAvatars);
      setCustomers(customersWithFixedAvatars);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle edit customer
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || ''
    });
    
    // Set avatar preview (use the fixed avatar URL)
    setAvatarPreview(customer.avatarUrl || null);
    setIsEditModalOpen(true);
    
    console.log('Editing customer with avatar:', customer.avatarUrl);
  };

  // Handle delete customer
  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };
  // Open add customer modal
  const handleAddCustomerClick = () => {
    // Reset form fields
    setNewCustomerData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setNewAvatar(null);
    setNewAvatarPreview(null);
    setValidationErrors({});
    setIsFormValid(false);
    setError(null);
    setIsAddModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar click to open file dialog
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle avatar file selection
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
  };  // Validation function
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        if (value.length < 2) return `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters, spaces, hyphens, and apostrophes`;
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) return 'Please enter a valid phone number';
        return '';
      case 'zipCode':
        if (value && !/^\d{5}(-\d{4})?$/.test(value)) return 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
        return '';
      default:
        return '';
    }
  };  // Calculate form completion progress
  const calculateFormProgress = (): number => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const filledFields = fields.filter(field => 
      newCustomerData[field as keyof Customer] && 
      (newCustomerData[field as keyof Customer] as string).trim() !== ''
    );
    const avatarBonus = newAvatar ? 1 : 0;
    return Math.round(((filledFields.length + avatarBonus) / (fields.length + 1)) * 100);
  };

  const formProgress = calculateFormProgress();

  // Validate all required fields
  const validateForm = (data: Partial<Customer>): boolean => {
    const errors: {[key: string]: string} = {};
    const requiredFields = ['firstName', 'lastName', 'email'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, data[field as keyof Customer] as string || '');
      if (error) errors[field] = error;
    });

    // Validate optional fields if they have values
    const optionalFields = ['phone', 'zipCode'];
    optionalFields.forEach(field => {
      const value = data[field as keyof Customer] as string || '';
      if (value) {
        const error = validateField(field, value);
        if (error) errors[field] = error;
      }
    });

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  // Handle new customer form input changes with validation
  const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number as user types
    let formattedValue = value;
    if (name === 'phone') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      // Format as (XXX) XXX-XXXX
      if (digits.length >= 6) {
        formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      } else if (digits.length >= 3) {
        formattedValue = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formattedValue = digits;
      }
    }

    // Format ZIP code
    if (name === 'zipCode') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 5) {
        formattedValue = `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
      } else {
        formattedValue = digits;
      }
    }

    // Capitalize names
    if (name === 'firstName' || name === 'lastName') {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    // Update state
    const updatedData = {
      ...newCustomerData,
      [name]: formattedValue
    };
    
    setNewCustomerData(updatedData);

    // Clear validation error for this field if it was previously invalid
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }

    // Validate the field in real-time
    const fieldError = validateField(name, formattedValue);
    if (fieldError) {
      setValidationErrors(prev => ({ ...prev, [name]: fieldError }));
    }

    // Update form validity
    validateForm(updatedData);
  };

  // Handle new avatar click to open file dialog
  const handleNewAvatarClick = () => {
    newFileInputRef.current?.click();
  };
  // Handle new avatar file selection with enhanced validation
  const handleNewAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarPreview(reader.result as string);
      };
      reader.onerror = () => {
        setError('Failed to read the image file');
      };
      reader.readAsDataURL(file);
      
      // Clear any existing errors
      setError(null);
    }
  };
  // Submit edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer?.id) return;
    
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Updating customer ID:', selectedCustomer.id);
      console.log('📝 Form data to update:', formData);

      // Always use FormData to ensure all fields are sent properly
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData, ensuring address fields are included
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const stringValue = value.toString().trim();
          formDataToSend.append(key, stringValue);
          console.log(`📎 Adding field ${key}: "${stringValue}"`);
        }
      });
      
      // Add avatar file if there's one
      if (avatar) {
        formDataToSend.append('avatar', avatar);
        console.log('📸 Adding avatar file');
      }

      console.log('🚀 Sending update request...');
      
      // Always use FormData method for consistency
      await customerService.updateCustomerWithFormData(String(selectedCustomer.id), formDataToSend);
      
      console.log('✅ Customer updated successfully');
      
      setIsEditModalOpen(false);
      
      // Reset form states
      setAvatar(null);
      setAvatarPreview(null);
      
      // Refresh data
      await fetchCustomers();
      
      toast.success('Customer updated successfully');
    } catch (err) {
      console.error('❌ Error updating customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      toast.error('Failed to update customer');
    } finally {
      setLoading(false);
    }
  };
  // Submit new customer form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm(newCustomerData)) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Create FormData for the new customer
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(newCustomerData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString().trim());
        }
      });
      
      // Add avatar file if exists
      if (newAvatar) {
        formData.append('avatar', newAvatar);
      }
      
      // Create new customer with FormData
      await customerService.createCustomerWithAxios(formData);
        setIsAddModalOpen(false);
      fetchCustomers(); // Refresh data
      
      // Show success message
      const customerName = `${newCustomerData.firstName} ${newCustomerData.lastName}`;
      toast.success(`Customer "${customerName}" created successfully!`);
      
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedCustomer?.id) return;
    
    try {
      setLoading(true);      await customerService.deleteCustomer(String(selectedCustomer.id));
      setIsDeleteModalOpen(false);
      fetchCustomers(); // Refresh data
      toast.success('Customer deleted successfully');
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        transition: 'margin-left 0.3s ease',
      }}>
        <div style={{ padding: '20px 30px' }}>
          <Header />
          
          {/* Page Title and Add Button */}
          <div style={{ 
            marginBottom: '24px', 
            marginTop: '24px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'}}>
            <div style={{ padding: '0 0px 0 5px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Customers</h1>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>Manage your customer data and interactions</p>
            </div>
            <button 
              style={{
                backgroundColor: '#5E5CEB',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onClick={handleAddCustomerClick}
            >
              <MdPersonAdd size={18} />
              Add Customer
            </button>
          </div>
          
          {error && (
            <div style={{ 
              backgroundColor: '#FEE2E2', 
              color: '#B91C1C', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}
          
          {/* Customers Table */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Avatar</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Phone</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Location</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading customers...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>No customers found</td>
                  </tr>
                ) : (
                  customers.map(customer => (
                    <tr key={customer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        {customer.avatarUrl ? (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden'
                          }}>
                            <img 
                              src={customer.avatarUrl} 
                              alt={`${customer.firstName}'s avatar`} 
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                console.error(`Failed to load avatar for ${customer.firstName}:`, customer.avatarUrl);
                                // Fallback to initials on error
                                e.currentTarget.style.display = 'none';
                                const parentDiv = e.currentTarget.parentElement;
                                if (parentDiv) {
                                  parentDiv.style.backgroundColor = '#e0e7ff';
                                  parentDiv.style.color = '#4f46e5';
                                  parentDiv.style.display = 'flex';
                                  parentDiv.style.alignItems = 'center';
                                  parentDiv.style.justifyContent = 'center';
                                  parentDiv.style.fontWeight = 'bold';
                                  parentDiv.textContent = customer.firstName.charAt(0) + customer.lastName.charAt(0);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#e0e7ff',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{customer.email}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{customer.phone || 'N/A'}</td>                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        {customer.address || customer.city ? 
                          [
                            customer.address,
                            customer.city && customer.state ? `${customer.city}, ${customer.state}` : customer.city || customer.state,
                            customer.zipCode
                          ].filter(Boolean).join(', ') 
                          : 'N/A'
                        }
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(customer)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#5E5CEB',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>          </div>
          
         
        </div>
      </div>

      {/* Edit Customer Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit Customer"
        loading={loading}
        submitText="Update Customer"
        cancelText="Cancel"
        size="lg"
      >      {/* Avatar Section */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        {/* hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleAvatarChange}
        />

        {/* avatar preview / placeholder */}
        <div
          onClick={handleAvatarClick}
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px dashed #d1d5db',
            marginBottom: '12px',
            position: 'relative',
            backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
          }}
        >
          {!avatarPreview && <MdPhotoCamera size={32} style={{ color: '#6b7280' }} />}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: '#4f46e5',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <MdPhotoCamera size={16} style={{ color: 'white' }} />
          </div>
        </div>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          margin: 0 
        }}>
          Click to upload profile picture
        </p>
      </div>      {/* First Name and Last Name */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FormInput
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            required
            label="First Name"
            fullWidth={true}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FormInput
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            required
            label="Last Name"
            fullWidth={true}
          />
        </div>
      </div>{/* Email */}
      <FormInput
        type="email"
        name="email"
        value={formData.email || ''}
        onChange={handleInputChange}
        required
        label="Email"
      />

      {/* Phone */}
      <FormInput
        type="text"
        name="phone"
        value={formData.phone || ''}
        onChange={handleInputChange}
        label="Phone"
      />      {/* Address */}
      <FormInput
        type="text"
        name="address"
        value={formData.address || ''}
        onChange={handleInputChange}
        label="Address"
      />      {/* City, State, Zip */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FormInput
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleInputChange}
            label="City"
            fullWidth={true}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FormInput
            type="text"
            name="state"
            value={formData.state || ''}
            onChange={handleInputChange}
            label="State"
            fullWidth={true}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FormInput
            type="text"
            name="zipCode"
            value={formData.zipCode || ''}
            onChange={handleInputChange}
            label="Zip Code"
            fullWidth={true}
          />
        </div>
      </div>
      </FormModal>        {/* Add Customer Modal */}      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Add New Customer"
        loading={loading}
        disabled={!isFormValid}
        submitText="Create Customer"
        cancelText="Cancel"
        size="lg"
        icon={<MdPersonAdd size={20} style={{ color: '#4f46e5' }} />}
      >
        {/* Form Progress Indicator */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              Form Completion
            </span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: formProgress === 100 ? '#059669' : '#4f46e5' 
            }}>
              {formProgress}%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${formProgress}%`, 
              height: '100%', 
              backgroundColor: formProgress === 100 ? '#059669' : '#4f46e5',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          {formProgress === 100 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              marginTop: '8px',
              color: '#059669',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Ready to submit!
            </div>
          )}
        </div>{/* Avatar Section - Enhanced */}
        <div style={{ 
          marginBottom: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #e2e8f0'
        }}>
          <input 
            type="file" 
            ref={newFileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleNewAvatarChange}
          />
          <div 
            onClick={handleNewAvatarClick}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: newAvatarPreview ? 'transparent' : '#f3f4f6',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: newAvatarPreview ? '4px solid #4f46e5' : '3px dashed #d1d5db',
              marginBottom: '16px',
              position: 'relative',
              backgroundImage: newAvatarPreview ? `url(${newAvatarPreview})` : 'none',
              transition: 'all 0.3s ease',
              boxShadow: newAvatarPreview ? '0 8px 25px rgba(79, 70, 229, 0.15)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!newAvatarPreview) {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (!newAvatarPreview) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
          >
            {!newAvatarPreview && (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>
                <MdPhotoCamera size={40} style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', fontWeight: '500' }}>Add Photo</div>
              </div>
            )}
            
            {/* Enhanced camera icon overlay */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: '#4f46e5',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '3px solid white',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              <MdPhotoCamera size={18} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#4b5563', 
              margin: '0 0 4px 0',
              fontWeight: '500'
            }}>
              {newAvatarPreview ? 'Click to change profile picture' : 'Click to upload profile picture'}
            </p>
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              margin: 0 
            }}>
              Supports JPG, PNG, GIF up to 5MB
            </p>
          </div>
        </div><div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormInput
              label="First Name"
              type="text"
              name="firstName"
              value={newCustomerData.firstName || ''}
              onChange={handleNewInputChange}
              required
              fullWidth={true}
              placeholder="Enter first name"
              error={validationErrors.firstName}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormInput
              label="Last Name"
              type="text"
              name="lastName"
              value={newCustomerData.lastName || ''}
              onChange={handleNewInputChange}
              required
              fullWidth={true}
              placeholder="Enter last name"
              error={validationErrors.lastName}
            />
          </div>
        </div>
        
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          value={newCustomerData.email || ''}
          onChange={handleNewInputChange}
          required
          placeholder="Enter email address"
          error={validationErrors.email}
        />
        
        <FormInput
          label="Phone Number"
          type="tel"
          name="phone"
          value={newCustomerData.phone || ''}
          onChange={handleNewInputChange}
          placeholder="(123) 456-7890"
          error={validationErrors.phone}
        />
        
        <FormInput
          label="Street Address"
          type="text"
          name="address"
          value={newCustomerData.address || ''}
          onChange={handleNewInputChange}
          placeholder="Enter street address"
        />          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormInput
              label="City"
              type="text"
              name="city"
              value={newCustomerData.city || ''}
              onChange={handleNewInputChange}
              fullWidth={true}
              placeholder="Enter city"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormInput
              label="State"
              type="text"
              name="state"
              value={newCustomerData.state || ''}
              onChange={handleNewInputChange}
              fullWidth={true}
              placeholder="Enter state"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FormInput
              label="ZIP Code"
              type="text"
              name="zipCode"
              value={newCustomerData.zipCode || ''}
              onChange={handleNewInputChange}
              fullWidth={true}
              placeholder="12345 or 12345-6789"
              error={validationErrors.zipCode}
            />
          </div>
        </div>
      </FormModal>
        {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedCustomer?.firstName} ${selectedCustomer?.lastName}? This action cannot be undone.`}
        confirmText="Delete Customer"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </div>
  );
};

export default CustomersPage; 
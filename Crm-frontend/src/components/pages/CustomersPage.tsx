import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

import Header from '../dashboard/Header';
import Sidebar from '../dashboard/Sidebar';
import customerService, { Customer } from '../../services/customerService';
import { MdEdit, MdDelete, MdPersonAdd, MdPhotoCamera } from 'react-icons/md';

// Definisi konstanta BACKEND_URL
const BACKEND_URL = 'http://localhost:3000';

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
  });
  const [newCustomerData, setNewCustomerData] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
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
  };

  // Handle new customer form input changes
  const handleNewCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new avatar click to open file dialog
  const handleNewAvatarClick = () => {
    newFileInputRef.current?.click();
  };

  // Handle new avatar file selection
  const handleNewAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setNewAvatar(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select an image file');
      }
    }
  };

  // Submit edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer?.id) return;
    
    try {
      setLoading(true);

      // Create FormData if there's an avatar to upload
      if (avatar) {
        const formDataWithAvatar = new FormData();
        
        // Add all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataWithAvatar.append(key, value.toString());
          }
        });
        
        // Add avatar file
        formDataWithAvatar.append('avatar', avatar);
        console.log('Updating customer with avatar, ID:', selectedCustomer.id);
        
        // Use updateCustomerWithFormData method for updating with avatar
        await customerService.updateCustomerWithFormData(String(selectedCustomer.id), formDataWithAvatar);
      } else {
        // Use regular update method if no avatar
        await customerService.updateCustomer(String(selectedCustomer.id), formData);
      }
      
      setIsEditModalOpen(false);
      fetchCustomers(); // Refresh data
      alert('Customer updated successfully');
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  // Submit new customer form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Create FormData for the new customer
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(newCustomerData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
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
      alert('Customer created successfully');
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
      setLoading(true);
      await customerService.deleteCustomer(String(selectedCustomer.id));
      setIsDeleteModalOpen(false);
      fetchCustomers(); // Refresh data
      alert('Customer deleted successfully');
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
          {/* Header */}
          <Header />
          
          {/* Page Title and Add Button */}
          <div style={{ 
            marginBottom: '24px', 
            marginTop: '24px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
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
                      <td style={{ padding: '16px', fontSize: '14px' }}>{customer.phone || 'N/A'}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        {customer.city ? `${customer.city}, ${customer.state}` : 'N/A'}
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
            </table>
          </div>
          
         
        </div>
      </div>
      
      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600' }}>Edit Customer</h2>
            <form onSubmit={handleEditSubmit}>
              {/* Avatar Section */}
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <div 
                  onClick={handleAvatarClick}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
                    border: '2px dashed #d1d5db',
                    marginBottom: '12px',
                    position: 'relative'
                  }}
                >
                  {!avatarPreview && (
                    <MdPhotoCamera size={32} color="#6b7280" />
                  )}
                  
                  {/* Camera icon overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: '#5E5CEB',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <MdPhotoCamera size={16} color="white" />
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                  Click to upload profile picture
                </p>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#5E5CEB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600' }}>Add New Customer</h2>
            <form onSubmit={handleAddSubmit}>
              {/* Avatar Section */}
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: newAvatarPreview ? `url(${newAvatarPreview})` : 'none',
                    border: '2px dashed #d1d5db',
                    marginBottom: '12px',
                    position: 'relative'
                  }}
                >
                  {!newAvatarPreview && (
                    <MdPhotoCamera size={32} color="#6b7280" />
                  )}
                  
                  {/* Camera icon overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: '#5E5CEB',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <MdPhotoCamera size={16} color="white" />
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                  Click to upload profile picture
                </p>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newCustomerData.firstName || ''}
                  onChange={handleNewCustomerInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newCustomerData.lastName || ''}
                  onChange={handleNewCustomerInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newCustomerData.email || ''}
                  onChange={handleNewCustomerInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newCustomerData.phone || ''}
                  onChange={handleNewCustomerInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={newCustomerData.address || ''}
                  onChange={handleNewCustomerInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={newCustomerData.city || ''}
                    onChange={handleNewCustomerInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={newCustomerData.state || ''}
                    onChange={handleNewCustomerInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={newCustomerData.zipCode || ''}
                    onChange={handleNewCustomerInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#5E5CEB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600' }}>Delete Customer</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px' }}>
              Are you sure you want to delete {selectedCustomer?.firstName} {selectedCustomer?.lastName}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage; 
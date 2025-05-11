import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Define the backend base URL for assets
const BACKEND_URL = 'http://localhost:3000';

interface Customer {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Raw customer data interface for API response
interface ApiCustomer {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  first_name?: string; // Alternative field name
  last_name?: string; // Alternative field name
  name?: string; // In case it's a single name field
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  zip_code?: string; // Alternative field name
  avatarUrl?: string;
  avatar_url?: string; // Alternative field name
  avatar?: string; // Alternative field name
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // Alternative field name
  updated_at?: string; // Alternative field name
  [key: string]: string | number | boolean | undefined | null; // For any additional properties
}

interface CustomerSectionProps {
  title?: string;
  onCustomerCountChange?: (count: number) => void;
  refreshTrigger?: number; // Add this prop to trigger refreshes
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ 
  title = "",
  onCustomerCountChange,
  refreshTrigger = 0 // Default to 0
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();
  // Track images that failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Handle image loading error
  const handleImageError = (customerId: string | number) => {
    setFailedImages(prev => ({ ...prev, [String(customerId)]: true }));
  };

  // Fetch customers - now in a named function we can call to refresh
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        
        if (!token || !isAuthenticated) {
          throw new Error('Authentication required');
        }
        
        // Make authenticated request with token from context
        const response = await axios.get('http://localhost:3000/api/customers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Debug: Log the response structure to see what we're actually getting
        console.log('API Response:', response.data);
        
        // Handle nested data structure
        const customersData = Array.isArray(response.data.data) 
          ? response.data.data 
          : Array.isArray(response.data) 
            ? response.data 
            : [];
            
        // Debug: Log a sample customer to see its structure
        if (customersData.length > 0) {
          console.log('Sample customer data:', customersData[0]);
        }
        
        // Validate and map the data to ensure it matches our Customer interface
        const validCustomers = customersData.map((customer: ApiCustomer) => {
          // Debug individual customer before mapping
          console.log('Mapping customer:', customer);
          
          // Handle different possible field names for firstName
          const firstName = 
            customer.firstName || 
            customer.first_name || 
            (customer.name ? customer.name.split(' ')[0] : null) || 
            'Unknown';
            
          // Handle different possible field names for lastName
          const lastName = 
            customer.lastName || 
            customer.last_name || 
            (customer.name && customer.name.split(' ').length > 1 
              ? customer.name.split(' ').slice(1).join(' ') 
              : null) || 
            'Customer';
            
          // Handle different possible field names for avatar
          let avatarUrl = 
            customer.avatarUrl || 
            customer.avatar_url || 
            customer.avatar || 
            undefined;
            
          // Fix avatar URL by prepending the backend base URL if it's a relative path
          if (avatarUrl && avatarUrl.startsWith('/')) {
            avatarUrl = `${BACKEND_URL}${avatarUrl}`;
            console.log('Fixed avatar URL:', avatarUrl);
          }
          
          // Generate UI Avatar URL if no avatar is provided
          if (!avatarUrl) {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + '+' + lastName)}&background=random`;
          }
            
          return {
            id: customer.id || `customer-${1}`,
            firstName,
            lastName,
            email: customer.email || 'No email provided',
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode || customer.zip_code,
            avatarUrl,
            createdAt: customer.createdAt || customer.created_at,
            updatedAt: customer.updatedAt || customer.updated_at
          };
        });
        
        setCustomers(validCustomers);
        setIsLoading(false);
        
        // Notify parent component about the customer count
        if (onCustomerCountChange) {
          onCustomerCountChange(validCustomers.length);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
        
        // Even on error, update the customer count to 0
        if (onCustomerCountChange) {
          onCustomerCountChange(0);
        }
      }
    };

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, [token, isAuthenticated]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) { // Only refresh if trigger is greater than initial value
      fetchCustomers();
    }
  }, [refreshTrigger]);

  const getInitials = (firstName: string, lastName: string): string => {
    if (!firstName && !lastName) return '??';
    
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    
    return (firstInitial + lastInitial).toUpperCase() || '?';
  };

  const getFullName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim() || 'Unknown Customer';
  };

  return (
    <div style={{ marginBottom: '4px' }}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
       
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '1px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        {isLoading ? (
          <div className="loading-indicator">Loading customers...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {customers.length === 0 ? (
              <div className="no-customers">No customers found</div>
            ) : (
              customers.map(customer => (
                <div key={customer.id} className="customer-list-item" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 8px',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div className="user-avatar" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginRight: '12px',
                    flexShrink: 0,
                    backgroundColor: '#e0e0e0',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {customer.avatarUrl && !failedImages[String(customer.id)] ? (
                      <img 
                        src={customer.avatarUrl} 
                        alt={`${customer.firstName}'s avatar`} 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={() => handleImageError(customer.id)}
                      />
                    ) : (
                      getInitials(customer.firstName, customer.lastName)
                    )}
                  </div>
                  <div className="user-details" style={{ flex: 1 }}>
                    <h3 className="user-name" style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {getFullName(customer.firstName, customer.lastName)}
                    </h3>
                    <p className="user-email" style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      {customer.email}
                    </p>
                  </div>
                  <button className="chevron-button" style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSection; 
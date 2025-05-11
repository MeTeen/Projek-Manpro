import React, { useState, useEffect } from 'react';
import { MdChevronRight } from 'react-icons/md';
import { Customer } from '../../services/customerService';
import customerService from '../../services/customerService';

// Define the backend base URL for assets
const BACKEND_URL = 'http://localhost:3000';

interface CustomersListProps {
  limit?: number;
  refreshTrigger?: number;
}

const CustomersList: React.FC<CustomersListProps> = ({ limit = 5, refreshTrigger = 0 }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track images that failed to load
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  // Format currency
  const formatCurrency = (amount: number = 0): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch customers function to match naming in CustomerSection
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const topCustomers = await customerService.getTopSpendingCustomers(limit);
      
      // Process customer avatars
      const customersWithAvatars = topCustomers.map(customer => {
        let avatarUrl = customer.avatarUrl;
        
        // Fix avatar URL by prepending the backend base URL if it's a relative path
        if (avatarUrl && avatarUrl.startsWith('/')) {
          avatarUrl = `${BACKEND_URL}${avatarUrl}`;
          console.log('Fixed avatar URL:', avatarUrl);
        }
        
        // Generate UI Avatar URL if no avatar is provided
        if (!avatarUrl) {
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.firstName + '+' + customer.lastName)}&background=random`;
        }
        
        return {
          ...customer,
          avatarUrl
        };
      });
      
      setCustomers(customersWithAvatars);
    } catch (err) {
      console.error('Error fetching top customers:', err);
      setError('Could not load top customers');
      // Create sample customers for static display if API fails
      setCustomers([
        {
          id: 1,
          firstName: 'Customer',
          lastName: 'A',
          email: 'customera@example.com',
          phone: '123456789',
          address: '123 Main St',
          city: 'Jakarta',
          state: 'JKT',
          zipCode: '12345',
          totalSpent: 339,
          purchaseCount: 8,
          avatarUrl: 'https://ui-avatars.com/api/?name=Customer+A&background=random'
        },
        {
          id: 2,
          firstName: 'Customer',
          lastName: 'B',
          email: 'customerb@example.com',
          phone: '987654321',
          address: '456 Oak St',
          city: 'Surabaya',
          state: 'SBY',
          zipCode: '54321',
          totalSpent: 429,
          purchaseCount: 3,
          avatarUrl: 'https://ui-avatars.com/api/?name=Customer+B&background=random'
        },
        {
          id: 3,
          firstName: 'Customer',
          lastName: 'C',
          email: 'customerc@example.com',
          phone: '555555555',
          address: '789 Pine St',
          city: 'Bandung',
          state: 'BDG',
          zipCode: '67890',
          totalSpent: 339,
          purchaseCount: 8,
          avatarUrl: 'https://ui-avatars.com/api/?name=Customer+C&background=random'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [limit, refreshTrigger]);

  // Handle image loading error
  const handleImageError = (customerId: number) => {
    if (customerId !== undefined) {
      setFailedImages(prev => ({ ...prev, [customerId]: true }));
    }
  };

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        Loading top customers...
      </div>
    );
  }

  if (error && customers.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#FEF2F2',
        color: '#B91C1C',
        borderRadius: '8px'
      }}>
        {error}
      </div>
    );
  }

  // If no customers yet, show empty state
  if (customers.length === 0) {
    return (
      <div style={{ 
        padding: '30px 20px', 
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        color: '#6B7280'
      }}>
        <p>No customer data available yet</p>
        <p style={{ fontSize: '14px' }}>Start adding customers and transactions to see top spenders</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center cards horizontally
      gap: '12px'
    }}>
      {customers.map((customer) => (
        <div 
          key={customer.id || `customer-${Math.random()}`} 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '16px 20px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            width: '100%', // Use full width of container
            maxWidth: '100%' // Maximum width to fill container
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Avatar/Initials */}
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4B5563',
              fontSize: '14px',
              fontWeight: '600',
              overflow: 'hidden'
            }}>
              {customer.avatarUrl && !failedImages[customer.id as number] ? (
                <img 
                  src={customer.avatarUrl} 
                  alt={`${customer.firstName} ${customer.lastName}`} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} 
                  onError={() => handleImageError(customer.id as number)}
                />
              ) : (
                getInitials(customer.firstName, customer.lastName)
              )}
            </div>
            
            {/* Customer Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500' }}>
                {customer.firstName} {customer.lastName}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                Total Spend: {formatCurrency(customer.totalSpent)} | Total Purchase: {customer.purchaseCount || 0}x
              </div>
            </div>
            
            {/* Status or Action */}
            <div style={{ 
              fontSize: '12px', 
              backgroundColor: '#EEF2FF', 
              color: '#5E5CEB',
              padding: '4px 8px',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              TOP SPENDER
            </div>
            
            {/* Arrow indicator */}
            <MdChevronRight color="#9CA3AF" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomersList; 
import React from 'react';
import { Customer } from '../../services/customerService';

interface CustomerCardProps {
  customer: Customer;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  // Format currency
  const formatCurrency = (amount: number = 0): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get initials for avatar fallback
  const getInitials = (): string => {
    return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`;
  };

  return (
    <div 
      style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '16px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '12px'
      }}
    >
      {/* Avatar */}
      {customer.avatarUrl ? (
        <img 
          src={customer.avatarUrl}
          alt={`${customer.firstName} ${customer.lastName}`}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#EEF2FF',
          color: '#5E5CEB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {getInitials()}
        </div>
      )}
      
      {/* Customer Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {customer.firstName} {customer.lastName}
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>
          {customer.email}
        </div>
      </div>
      
      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-end',
        minWidth: '120px'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: '#16A34A',
          marginBottom: '4px' 
        }}>
          {formatCurrency(customer.totalSpent)}
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>
          {customer.purchaseCount || 0} purchases
        </div>
      </div>
    </div>
  );
};

export default CustomerCard; 
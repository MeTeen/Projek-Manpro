import React, { useState, useEffect } from 'react';
import customerService, { Customer } from '../../services/customerService';

interface CustomerItemProps {
  customer: Customer;
  isPurchased?: boolean;
  date?: string;
  time?: string;
  discount?: string;
}

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`;
};

// Function to generate a consistent color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-100 text-red-600',
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-yellow-100 text-yellow-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600'
  ];
  
  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const CustomerItem: React.FC<CustomerItemProps> = ({
  customer,
  date,
  time,
  discount,
  isPurchased
}) => {
  const initials = getInitials(customer.firstName, customer.lastName);
  const avatarColor = getAvatarColor(customer.firstName + customer.lastName);
  const fullName = `${customer.firstName} ${customer.lastName}`;
  
  // For demo purposes, use some placeholder values if not provided
  const totalSpend = '$' ;
  const totalPurchase =  'x';

  return (
    <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex items-center mb-2">
        <div className={`h-8 w-8 rounded-md ${avatarColor} flex items-center justify-center mr-3`}>
          {initials}
        </div>
        <div>
          <h3 className="font-medium">{fullName}</h3>
          <div className="text-sm text-gray-500">
            Total Spend: {totalSpend} | Total Purchase: {totalPurchase}
          </div>
        </div>
        {date && time && (
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-500">{date}</div>
            <div className="text-xs">{time}</div>
          </div>
        )}
      </div>
      
      {discount && (
        <div className="flex justify-between items-center">
          <div className="ml-11">
            <span className="bg-blue-100 text-blue-600 rounded px-2 py-1 text-xs font-medium">
              Discount {discount}
            </span>
          </div>
          {isPurchased && (
            <div className="bg-indigo-100 text-indigo-600 rounded px-2 py-1 text-xs font-medium">
              PURCHASED
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await customerService.getAllCustomers();
        
        console.log('Fetched customers:', data);
        setCustomers(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers. Please try again.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading customers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative" role="alert">
        <p>No customers found. Add your first customer to get started.</p>
      </div>
    );
  }



  return (
    <div className="space-y-4">
      {customers.map((customer, index) => (
        <CustomerItem
          key={customer.id}
          customer={customer}
    
          isPurchased={index % 4 === 0}
        />
      ))}
    </div>
  );
};

export default CustomerList;

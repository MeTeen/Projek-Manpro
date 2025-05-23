import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BACKEND_URL = 'http://localhost:3000';

interface Customer {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface CustomerSectionProps {
  title?: string;
  onCustomerCountChange?: (count: number) => void;
  refreshTrigger?: number;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  title = 'Customers',
  onCustomerCountChange,
  refreshTrigger = 0
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);

      if (!token || !isAuthenticated) throw new Error('Authentication required');

      const response = await axios.get(`${BACKEND_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = Array.isArray(response.data.data)
        ? response.data.data
        : response.data;

      const mapped = data.map((c: any) => {
        const firstName = c.firstName || c.first_name || 'Unknown';
        const lastName = c.lastName || c.last_name || '';
        let avatarUrl = c.avatarUrl || c.avatar_url || c.avatar;

        if (avatarUrl && avatarUrl.startsWith('/')) {
          avatarUrl = `${BACKEND_URL}${avatarUrl}`;
        }

        if (!avatarUrl) {
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            firstName + ' ' + lastName
          )}&background=random`;
        }

        return {
          id: c.id || `${firstName}-id`,
          firstName,
          lastName,
          email: c.email || 'No email',
          avatarUrl
        };
      });

      setCustomers(mapped);
      onCustomerCountChange?.(mapped.length);
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error('Failed to load customer data');
      onCustomerCountChange?.(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (refreshTrigger > 0) fetchCustomers();
  }, [refreshTrigger]);

  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <div className="bg-white rounded-lg shadow p-2">
        {isLoading ? (
          <p className="text-gray-500">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-400 text-sm">No customers found</p>
        ) : (
          <div className="flex flex-col divide-y">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                  <img
                    src={customer.avatarUrl}
                    alt={customer.firstName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSection;
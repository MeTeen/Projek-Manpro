import axios from 'axios';
import { API_CONFIG } from '../../config/api';

const BASE_URL = API_CONFIG.ROOT_URL;

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  totalSpent: number;
  purchaseCount: number;
  avatarUrl?: string;
}

const getTopSpendingCustomers = async (limit: number = 5): Promise<Customer[]> => {
  const res = await axios.get(`${BASE_URL}/api/customers/top-spending?limit=${limit}`);
  const rawData = Array.isArray(res.data.data) ? res.data.data : res.data;

  const customers: Customer[] = rawData.map((item: any) => {
    const firstName = item.firstName || item.first_name || 'Customer';
    const lastName = item.lastName || item.last_name || '';
    let avatarUrl = item.avatarUrl || item.avatar_url || item.avatar || '';

    if (avatarUrl.startsWith('/')) {
      avatarUrl = `${BASE_URL}${avatarUrl}`;
    }

    if (!avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random`;
    }

    return {
      id: item.id ?? Date.now(),
      firstName,
      lastName,
      email: item.email || '',
      totalSpent: item.totalSpent || 0,
      purchaseCount: item.purchaseCount || 0,
      avatarUrl
    };
  });

  return customers;
};

const customerService = {
  getTopSpendingCustomers,
  // tambahkan service lainnya di sini
};

export default customerService;


import axios from 'axios';
import authService from './authService';
import { API_CONFIG } from '../config/api';
import type { Promo } from './promoService';

// Use centralized API configuration
const API_URL = API_CONFIG.BASE_URL;

export interface Purchase {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  unitPrice: number; // << UNIT PRICE FROM NEW PURCHASE MODEL
  totalAmount: number; // << TOTAL AMOUNT BEFORE DISCOUNT
  discountAmount?: number | null; // << DISCOUNT AMOUNT
  finalAmount: number; // << FINAL AMOUNT AFTER DISCOUNT
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
  promoId?: number | null;       // << ID PROMO YANG DIGUNAKAN
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  product?: { // Ini adalah data dari tabel Product (master)
    id: number;
    name: string;
    price: number; // Harga master produk
    stock: number;
  };
  promo?: Promo | null; // Detail promo jika di-include oleh backend
}

export interface PurchaseInput {
  customerId: number;
  productId: number;
  quantity: number;
  promoId?: number | null;
}

// Helper function to get token
const getAuthToken = (): string | null => {
  // First check authService which is the source of truth
  const token = authService.getToken();
  
  if (!token) {
    console.warn('No authentication token found in authService');
    // As a fallback, check localStorage directly
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.log('Found token in localStorage directly');
      return localToken;
    }
    console.error('No authentication token available');
    return null;
  }
  
  return token;
};

class PurchaseService {
  private readonly baseUrl = '/purchases';

  /**
   * Create a new purchase (add a product to a customer's purchases)
   * @param purchaseData Purchase data containing customerId, productId, and quantity
   */
  async createPurchase(purchaseData: PurchaseInput): Promise<Purchase> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }      // Validate and ensure the data is correctly formatted
      const validatedData = {
        customerId: Number(purchaseData.customerId),
        productId: Number(purchaseData.productId),
        quantity: Number(purchaseData.quantity) || 1,
        promoId: purchaseData.promoId || null
      };
      
      // Check values
      if (!validatedData.customerId || validatedData.customerId <= 0) {
        throw new Error('Invalid customer ID. Please select a valid customer.');
      }
      
      if (!validatedData.productId || validatedData.productId <= 0) {
        throw new Error('Invalid product ID. Please select a valid product.');
      }
      
      if (validatedData.quantity <= 0) {
        throw new Error('Quantity must be at least 1.');
      }

      console.log('Creating purchase with validated data:', validatedData);
      
      const response = await axios.post(`${API_URL}${this.baseUrl}`, validatedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Purchase created successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Add a product to a customer from dropdown
   * @param customerId Customer ID
   * @param productId Product ID
   * @param quantity Quantity to purchase (default: 1)
   */
  async addProductToCustomer(customerId: number, productId: number, quantity: number = 1): Promise<Purchase> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('Adding product to customer:', { customerId, productId, quantity });
      
      const response = await axios.post(`${API_URL}${this.baseUrl}/add-to-customer`, {
        customerId,
        productId,
        quantity
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Product added to customer successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error adding product to customer:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Get all purchases
   */
  async getAllPurchases(): Promise<Purchase[]> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}${this.baseUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Get purchases for a specific customer
   * @param customerId Customer ID
   */
  async getCustomerPurchases(customerId: number): Promise<{
    customer: {
      id: number;
      firstName: string;
      lastName: string;
      totalSpent: number;
      purchaseCount: number;
    },
    purchases: Purchase[]
  }> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}${this.baseUrl}/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching purchases for customer ${customerId}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Get purchase history for a specific product
   * @param productId Product ID
   */
  async getProductPurchaseHistory(productId: number): Promise<{
    product: {
      id: number;
      name: string;
      price: number;
      stock: number;
    },
    purchases: Purchase[]
  }> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}${this.baseUrl}/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching purchase history for product ${productId}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

}

const purchaseService = new PurchaseService();
export default purchaseService; 
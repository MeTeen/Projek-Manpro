import axios from 'axios';
import authService from './authService';

// API URL
const API_URL = 'http://localhost:3000/api';

export interface Purchase {
  id: number;
  customerId: number;
  productId: number;
  quantity: number;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  product?: {
    id: number;
    name: string;
    price: number;
    stock: number;
  };
}

export interface PurchaseInput {
  customerId: number;
  productId: number;
  quantity: number;
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
      }

      // Validate and ensure the data is correctly formatted
      const validatedData = {
        customerId: Number(purchaseData.customerId),
        productId: Number(purchaseData.productId),
        quantity: Number(purchaseData.quantity) || 1
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

  /**
   * Create a purchase directly without relying on associations
   * This is a fallback method that can be used when there are issues with the main API endpoints
   */
  async createPurchaseWithoutValidation(purchaseData: PurchaseInput): Promise<Purchase> {
    try {
      // Ensure auth is initialized before each API call
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Convert camelCase to snake_case for database compatibility
      const validatedData = {
        customer_id: Number(purchaseData.customerId),
        product_id: Number(purchaseData.productId),
        quantity: Number(purchaseData.quantity) || 1,
        purchase_date: new Date().toISOString() // Add current date
      };
      
      console.log('Creating purchase with snake_case data:', validatedData);
      
      // Use a direct POST request to the API
      const response = await axios.post(`${API_URL}${this.baseUrl}`, validatedData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Purchase created successfully (direct):', response.data);
      return response.data.data;
    } catch (error) {
      // If direct method fails, try the regular endpoint as fallback with camelCase
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 500)) {
        console.log('Direct purchase with snake_case failed, trying camelCase...');
        try {
          // Get token again to ensure it's in scope
          const tokenForRetry = getAuthToken();
          
          if (!tokenForRetry) {
            throw new Error('Authentication required. Please log in again.');
          }
          
          // Try with camelCase properties
          const camelCaseData = {
            customerId: Number(purchaseData.customerId), 
            productId: Number(purchaseData.productId),
            quantity: Number(purchaseData.quantity) || 1
          };
          
          console.log('Trying with camelCase data:', camelCaseData);
          
          const response = await axios.post(`${API_URL}${this.baseUrl}`, camelCaseData, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenForRetry}`
            }
          });
          
          console.log('Purchase created successfully with camelCase:', response.data);
          return response.data.data;
        } catch (secondError) {
          console.error('Both snake_case and camelCase attempts failed:', secondError);
          throw secondError;
        }
      }
      
      console.error('Error creating purchase with direct method:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Create a purchase with direct mapping to database fields
   * This special method formats the data to match the exact database column names
   */
  async createPurchaseDirectSql(purchaseData: PurchaseInput): Promise<Purchase> {
    try {
      console.log('Starting direct SQL purchase creation with data:', purchaseData);
      
      // Ensure auth is initialized
      authService.initializeAuth();
      
      // Get authentication token
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Create data with correct field names for database compatibility
      const dbFormat = {
        // Use snake_case for database column names
        customer_id: Number(purchaseData.customerId),
        product_id: Number(purchaseData.productId),
        quantity: Number(purchaseData.quantity) || 1,
        purchase_date: new Date().toISOString(),
        // Add timestamps as expected by the database
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Formatted data for direct database insert:', dbFormat);
      
      // Make a raw API request to the custom purchases endpoint
      const response = await axios.post(`${API_URL}/purchases/direct-sql`, dbFormat, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Purchase created with direct SQL:', response.data);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.error('Direct SQL endpoint not found, attempting fallback...');
        try {
          // Fallback: Try using raw axios call with snake_case
          const rawDbFormat = {
            customer_id: Number(purchaseData.customerId),
            product_id: Number(purchaseData.productId),
            quantity: Number(purchaseData.quantity) || 1
          };
          
          const token = getAuthToken();
          
          if (!token) {
            throw new Error('Authentication token required');
          }
          
          const url = `${API_URL}/purchases`;
          console.log(`Attempting fallback direct post to ${url} with:`, rawDbFormat);
          
          const response = await axios.post(url, rawDbFormat, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Fallback purchase creation successful:', response.data);
          return response.data.data;
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      console.error('Error creating purchase with direct SQL:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

const purchaseService = new PurchaseService();
export default purchaseService; 
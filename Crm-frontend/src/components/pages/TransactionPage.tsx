import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import AddNewDropdown from '../dashboard/AddNewDropdown';
import customerService, { Customer } from '../../services/customerService';
import productService, { Product } from '../../services/productService';
import purchaseService, { PurchaseInput, Purchase } from '../../services/purchaseService';
import { MdAdd, MdShoppingCart } from 'react-icons/md';

const TransactionPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Form data for new transaction
  const [transactionData, setTransactionData] = useState<PurchaseInput>({
    customerId: 0,
    productId: 0,
    quantity: 1
  });
  
  // Selected product for price calculation
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle dropdown toggle
  const handleAddNewClick = () => {
    setIsDropdownOpen(true);
  };

  // Handle customer creation
  const handleCustomerCreated = useCallback(() => {
    // Refresh customers data after a new customer is created
    fetchData();
  }, []);

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Split the data fetching to handle errors individually
      try {
        // Fetch all purchases
        const purchasesData = await purchaseService.getAllPurchases();
        setPurchases(purchasesData);
      } catch (purchaseError) {
        console.error('Error fetching purchases:', purchaseError);
        setPurchases([]);
        // Show a specific error for purchases, but continue with other data
        setError('Could not load existing transactions. You can still create new ones.');
      }
      
      // Always try to fetch customers and products even if purchases fail
      try {
        // Fetch customers for dropdown
        const customersData = await customerService.getAllCustomers();
        setCustomers(customersData);
      } catch (customerError) {
        console.error('Error fetching customers:', customerError);
        setError(prev => prev ? `${prev} Failed to load customers.` : 'Failed to load customers.');
        setCustomers([]);
      }
      
      try {
        // Fetch products for dropdown
        const productsData = await productService.getAllProducts();
        setProducts(productsData);
      } catch (productError) {
        console.error('Error fetching products:', productError);
        setError(prev => prev ? `${prev} Failed to load products.` : 'Failed to load products.');
        setProducts([]);
      }
      
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle add transaction modal
  const handleAddTransactionClick = () => {
    setTransactionData({
      customerId: 0,
      productId: 0,
      quantity: 1
    });
    setSelectedProduct(null);
    setIsAddModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric fields
    if (name === 'customerId' || name === 'productId' || name === 'quantity') {
      processedValue = Number(value) || 0;
      console.log(`Converting ${name} from ${value} (${typeof value}) to ${processedValue} (${typeof processedValue})`);
    }

    // Update form data
    setTransactionData(prev => {
      const updated = {
        ...prev,
        [name]: processedValue
      };
      console.log(`Updated transaction data:`, updated);
      return updated;
    });

    // If product was selected, find the product info for price calculation
    if (name === 'productId' && Number(value) > 0) {
      const productId = Number(value);
      const product = products.find(p => p.id === productId) || null;
      console.log(`Selected product ID: ${productId}, Found product:`, product);
      setSelectedProduct(product);
    }

    // If customer was selected, log for debugging
    if (name === 'customerId' && Number(value) > 0) {
      const customerId = Number(value);
      const customer = customers.find(c => c.id === customerId);
      console.log(`Selected customer ID: ${customerId}, Found customer:`, customer);
    }
  };

  // Submit new transaction
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!transactionData.customerId) {
      setError('Please select a customer');
      return;
    }
    
    if (!transactionData.productId) {
      setError('Please select a product');
      return;
    }
    
    if (transactionData.quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    
    try {
      setLoading(true);
      
      // Log exact data being sent for debugging
      console.log('Submitting transaction with data:', {
        customerId: transactionData.customerId,
        productId: transactionData.productId,
        quantity: transactionData.quantity,
        customerId_type: typeof transactionData.customerId,
        productId_type: typeof transactionData.productId,
        selected_customer: customers.find(c => c.id === transactionData.customerId),
        selected_product: products.find(p => p.id === transactionData.productId)
      });
      
      // Try all available methods in sequence until one succeeds
      let succeeded = false;
      
      // 1. Try the direct SQL method first (most likely to work)
      if (!succeeded) {
        try {
          await purchaseService.createPurchaseDirectSql(transactionData);
          console.log('Transaction created successfully using direct SQL method');
          succeeded = true;
        } catch (sqlError) {
          console.error('Direct SQL purchase creation failed:', sqlError);
        }
      }
      
      // 2. If that fails, try the enhanced method
      if (!succeeded) {
        try {
          await purchaseService.createPurchaseWithoutValidation(transactionData);
          console.log('Transaction created successfully using enhanced method');
          succeeded = true;
        } catch (enhancedError) {
          console.error('Enhanced purchase creation failed:', enhancedError);
        }
      }
      
      // 3. If that still fails, try direct axios with snake_case
      if (!succeeded) {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token found');
          
          // Create data with snake_case field names for database compatibility
          const snakeCaseData = {
            customer_id: Number(transactionData.customerId),
            product_id: Number(transactionData.productId),
            quantity: Number(transactionData.quantity)
          };
          
          console.log('Trying direct API call with snake_case data:', snakeCaseData);
          
          const response = await axios.post(
            'http://localhost:3000/api/purchases', 
            snakeCaseData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          console.log('Transaction created successfully with snake_case fields:', response.data);
          succeeded = true;
        } catch (axiosError) {
          console.error('Direct axios snake_case attempt failed:', axiosError);
        }
      }
      
      // 4. Last resort - try the standard method
      if (!succeeded) {
        try {
          await purchaseService.createPurchase(transactionData);
          console.log('Transaction created successfully using standard method');
          succeeded = true;
        } catch (standardError) {
          console.error('Standard purchase creation failed - all methods exhausted:', standardError);
          throw standardError; // Re-throw to handle in the main catch block
        }
      }
      
      // If we got here, one of the methods succeeded
      setIsAddModalOpen(false);
      
      // After successful creation, try to reload data, but don't worry if it fails
      try {
        await fetchData();
      } catch (fetchError) {
        console.warn('Error refreshing data after purchase:', fetchError);
        // Just show success message without reloading data
      }
      
      alert('Transaction created successfully');
      setError(null);
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = (): number => {
    if (!selectedProduct) return 0;
    return selectedProduct.price * transactionData.quantity;
  };

  // Format price to currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get customer full name
  const getCustomerName = (customerId: number): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  // Get product name
  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
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
          <Header 
            onCustomerCreated={handleCustomerCreated}
            onAddNewClick={handleAddNewClick}
          />
          
          {/* Add Transaction Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            margin: '20px 0' 
          }}>
            <button
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onClick={handleAddTransactionClick}
            >
              <MdAdd size={20} />
              <span style={{ marginLeft: '5px' }}>Add New Transaction</span>
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#b91c1c', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}
          
          {/* Transactions Table */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}>
                      ID
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}>
                      Customer
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}>
                      Product
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}>
                      Quantity
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}>
                      Price
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'right', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}>
                      Total
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600
                    }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        Loading transactions...
                      </td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        color: '#6b7280'
                      }}>
                        {error && error.includes('transaction') 
                          ? 'Could not load existing transactions. You can still create new ones by clicking "Add New Transaction".' 
                          : 'No transactions found'}
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px' }}>
                          {purchase.id}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {purchase.customer 
                            ? `${purchase.customer.firstName} ${purchase.customer.lastName}` 
                            : getCustomerName(purchase.customerId)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {purchase.product ? purchase.product.name : getProductName(purchase.productId)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {purchase.quantity}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {purchase.product 
                            ? formatPrice(purchase.product.price)
                            : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {purchase.product 
                            ? formatPrice(purchase.product.price * purchase.quantity)
                            : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Transaction Modal */}
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
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '18px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <MdShoppingCart />
              <span style={{ marginLeft: '8px' }}>Add New Transaction</span>
            </h2>
            
            <form onSubmit={handleAddSubmit}>
              {/* Customer Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  Customer:
                </label>
                <select 
                  name="customerId"
                  value={transactionData.customerId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="0">-- Select Customer --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id?.toString()}>
                      {customer.firstName} {customer.lastName} (ID: {customer.id})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Product Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  Product:
                </label>
                <select 
                  name="productId"
                  value={transactionData.productId}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="0">-- Select Product --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id?.toString()}>
                      {product.name} - {formatPrice(product.price)} (ID: {product.id}, Stock: {product.stock})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Quantity Input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 500,
                  fontSize: '14px'
                }}>
                  Quantity:
                </label>
                <input 
                  type="number" 
                  name="quantity"
                  value={transactionData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              
              {/* Price Information */}
              {selectedProduct && (
                <div style={{ 
                  marginBottom: '20px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    <span>Unit Price:</span>
                    <span>{formatPrice(selectedProduct.price)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    <span>Quantity:</span>
                    <span>{transactionData.quantity}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '8px',
                    marginTop: '8px'
                  }}>
                    <span>Total:</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div style={{ 
                  backgroundColor: '#fee2e2', 
                  color: '#b91c1c', 
                  padding: '12px', 
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Dropdown menu for adding new items */}
      <AddNewDropdown 
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onAddCustomer={handleCustomerCreated}
        onAddProduct={() => fetchData()}
      />
    </div>
  );
};

export default TransactionPage; 
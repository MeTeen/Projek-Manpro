import React, { useState, useEffect, useRef } from 'react';
import productService, { ProductInput } from '../../services/productService';
import authService from '../../services/authService';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    stock: 0,
    price: 0,
    dimensions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const formRef = useRef<HTMLDivElement>(null);

  // Initialize auth on mount
  useEffect(() => {
    authService.initializeAuth();
  }, []);

  // Check authentication on mount and on every open
  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen]);

  const checkAuthentication = () => {
    // Trigger auth initialization and update state
    authService.initializeAuth();
    const isLoggedIn = authService.isAuthenticated();
    setIsAuthenticated(isLoggedIn);
  };

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;

    // Convert string values to numbers for number inputs
    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData({ ...formData, [name]: processedValue });
  };

  const redirectToLogin = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Ensure auth is initialized before checking
    authService.initializeAuth();
    
    try {
      // Validate input
      if (!formData.name) {
        setError('Product name is required');
        setIsSubmitting(false);
        return;
      }

      try {
        // Create product using the service
        console.log('Creating product...');
        console.log('Form data being sent:', JSON.stringify(formData));
        const newProduct = await productService.createProduct(formData);
        console.log('Created product:', newProduct);
        
        // Call callback if available
        if (onProductCreated) {
          onProductCreated();
        }
        
        onClose();
      } catch (primaryError: unknown) {
        console.error('API error:', primaryError);
        
        // Check for authentication errors
        if (primaryError instanceof Error) {
          if (primaryError.message.includes('Authentication required') || 
             primaryError.message.includes('401')) {
            setError('Your session has expired. Please log in again.');
            setIsAuthenticated(false);
            setIsSubmitting(false);
            return;
          }
          
          // Display the specific error message from the server if available
          if (primaryError.message.includes('Server error:')) {
            setError(primaryError.message);
            setIsSubmitting(false);
            return;
          }
        }
        
        setError('Failed to create product. Please try again later.');
        setIsSubmitting(false);
        return;
      }
      
      // Reset form after successful submission
      setFormData({
        name: '',
        stock: 0,
        price: 0,
        dimensions: ''
      });
    } catch (err) {
      console.error('Overall error creating product:', err);
      setError('Failed to create product. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="form-overlay">
      <div className="product-form" ref={formRef} style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '500px',
        maxWidth: '95%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div className="form-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid #eee',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Add New Product</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              color: '#666'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#FEE2E2', 
            color: '#B91C1C', 
            marginBottom: '16px', 
            borderRadius: '4px',
            fontSize: '14px' 
          }}>
            {error}
            {!isAuthenticated && (
              <button 
                onClick={redirectToLogin}
                style={{ 
                  marginLeft: '8px', 
                  padding: '4px 8px', 
                  backgroundColor: '#B91C1C', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Log In
              </button>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section" style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Product Name *
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
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
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Stock
              </label>
              <input 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleChange}
                min="0"
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
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Price
              </label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange}
                min="0"
                step="0.01"
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
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Dimensions
              </label>
              <input 
                type="text" 
                name="dimensions" 
                value={formData.dimensions} 
                onChange={handleChange}
                placeholder="e.g. 10cm x 20cm x 5cm"
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

          <div className="form-actions" style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginTop: '24px',
            gap: '12px'
          }}>
            <button 
              type="button" 
              onClick={onClose}
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
              disabled={isSubmitting}
              style={{
                padding: '10px 16px',
                backgroundColor: '#5E5CEB',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm; 
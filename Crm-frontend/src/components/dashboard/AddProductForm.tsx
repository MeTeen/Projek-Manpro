import React, { useState, useEffect } from 'react';
import productService, { ProductInput } from '../../services/productService';
import authService from '../../services/authService';
import { FormInput, Button, ErrorState, Modal } from '../ui';

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

  useEffect(() => {
    authService.initializeAuth();
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkAuthentication();
    }
  }, [isOpen]);

  const checkAuthentication = () => {
    authService.initializeAuth();
    const isLoggedIn = authService.isAuthenticated();
    setIsAuthenticated(isLoggedIn);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;

    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData({ ...formData, [name]: processedValue });
  };

  const redirectToLogin = () => {
    window.location.href = '/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    authService.initializeAuth();
    
    try {
      if (!formData.name) {
        setError('Product name is required');
        setIsSubmitting(false);
        return;
      }

      try {
        console.log('Creating product...');
        console.log('Form data being sent:', JSON.stringify(formData));
        const newProduct = await productService.createProduct(formData);
        console.log('Created product:', newProduct);
        
        if (onProductCreated) {
          onProductCreated();
        }
        
        onClose();
      } catch (primaryError: unknown) {
        console.error('API error:', primaryError);
        
        if (primaryError instanceof Error) {
          if (primaryError.message.includes('Authentication required') || 
             primaryError.message.includes('401')) {
            setError('Your session has expired. Please log in again.');
            setIsAuthenticated(false);
            setIsSubmitting(false);
            return;
          }
          
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Add New Product">
      {error && (
        <ErrorState
          variant="error"
          message={error}
          actions={!isAuthenticated ? (
            <Button variant="danger" size="sm" onClick={redirectToLogin}>
              Log In
            </Button>
          ) : undefined}
        />
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <FormInput
          label="Product Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter product name"        />
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <FormInput
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock.toString()}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <FormInput
              label="Price"
              name="price"
              type="number"
              value={formData.price.toString()}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <FormInput
          label="Dimensions"
          name="dimensions"
          value={formData.dimensions}
          onChange={handleChange}
          placeholder="e.g. 10cm x 20cm x 5cm"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Product
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductForm;
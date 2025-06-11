import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import Header from '../../components/dashboard/Header';
import Sidebar from '../../components/dashboard/Sidebar';
import { ConfirmModal, FormModal } from '../../components/ui';
import FormInput from '../../components/ui/FormInput';
import productService, { Product, ProductInput } from '../../services/productService';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { formatPrice } from '../../utils/formatters';

const ProductPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductInput>>({
    name: '',
    stock: 0,
    price: 0,
    dimensions: ''
  });
  const [newProductData, setNewProductData] = useState<ProductInput>({
    name: '',
    stock: 0,
    price: 0,
    dimensions: ''
  });
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setError(null);
      console.log('Products loaded:', data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle data ui edit product
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      stock: product.stock,
      price: product.price,
      dimensions: product.dimensions
    });
    setIsEditModalOpen(true);
    
    console.log('Editing product:', product);
  };

  // Handle delete product
  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Open add product modal
  const handleAddProductClick = () => {
    // Reset form fields
    setNewProductData({
      name: '',
      stock: 0,
      price: 0,
      dimensions: ''
    });
    setIsAddModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric fields
    if (name === 'stock' || name === 'price') {
      processedValue = Number(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Handle new product form input changes
  const handleNewProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    // Convert numeric fields
    if (name === 'stock' || name === 'price') {
      processedValue = Number(value) || 0;
    }

    setNewProductData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Submit edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct?.id) return;
    
    try {
      setLoading(true);
      console.log('Updating product with ID:', selectedProduct.id, formData);
      
      await productService.updateProduct(selectedProduct.id, formData);
        setIsEditModalOpen(false);
      fetchProducts(); // Refresh data
      toast.success('Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Submit new product form
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      console.log('Creating new product:', newProductData);
      
      await productService.createProduct(newProductData);
        setIsAddModalOpen(false);
      fetchProducts(); // Refresh data
      toast.success('Product created successfully');
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedProduct?.id) return;
    
    try {
      setLoading(true);
      await productService.deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);      fetchProducts(); // Refresh data
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setLoading(false);
    }
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
          <Header />
          
          {/* Page Title and Add Button */}
          <div style={{ 
            marginBottom: '24px', 
            marginTop: '24px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ padding: '0 0px 0 5px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Products</h1>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>Manage your product inventory</p>
            </div>
            <button 
              style={{
                backgroundColor: '#5E5CEB',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onClick={handleAddProductClick}
            >
              <MdAdd size={18} />
              Add Product
            </button>
          </div>
          
          {error && (
            <div style={{ 
              backgroundColor: '#FEE2E2', 
              color: '#B91C1C', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '20px' 
            }}>
              {error}
            </div>
          )}
          
          {/* Products Table */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Product Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Stock</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Dimensions</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading products...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>No products found</td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{product.stock}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{formatPrice(product.price)}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{product.dimensions || 'N/A'}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#5E5CEB',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit Product"
        loading={loading}
        submitText="Save Changes"
        cancelText="Cancel"
        size="md"      >
        <FormInput
          label="Product Name"
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleInputChange}
          required
        />

        <FormInput
          label="Stock"
          type="number"
          name="stock"
          value={formData.stock ?? 0}
          onChange={handleInputChange}
          required
          min={0}
        />

        <FormInput
          label="Price (IDR)"
          type="number"
          name="price"
          value={formData.price ?? 0}
          onChange={handleInputChange}
          required
          min={0}
        />

        <FormInput
          label="Dimensions"
          type="text"
          name="dimensions"
          value={formData.dimensions || ''}
          onChange={handleInputChange}
          placeholder="e.g. 10x20x30 cm"
        />
      </FormModal>

      {/* Add Product Modal */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Add New Product"
        loading={loading}
        submitText="Create Product"
        cancelText="Cancel"
        size="md"      >
        <FormInput
          label="Product Name"
          type="text"
          name="name"
          value={newProductData.name}
          onChange={handleNewProductInputChange}
          required
        />

        <FormInput
          label="Stock"
          type="number"
          name="stock"
          value={newProductData.stock}
          onChange={handleNewProductInputChange}
          required
          min="0"
        />

        <FormInput
          label="Price (IDR)"
          type="number"
          name="price"
          value={newProductData.price}
          onChange={handleNewProductInputChange}
          required
          min="0"
        />

        <FormInput
          label="Dimensions"
          type="text"
          name="dimensions"
          value={newProductData.dimensions}
          onChange={handleNewProductInputChange}
          placeholder="e.g. 10x20x30 cm"
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </div>
  );
};

export default ProductPage;
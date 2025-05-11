import React, { useEffect, useRef, useState } from 'react';
import { MdLocalOffer } from 'react-icons/md';
import AddCustomerForm from './AddCustomerForm';
import AddProductForm from './AddProductForm';

interface AddNewDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: () => void;
  onAddProduct: () => void;
}

const AddNewDropdown: React.FC<AddNewDropdownProps> = ({ isOpen, onClose, onAddCustomer, onAddProduct }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleAddCustomer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCustomerFormOpen(true);
    onClose();
  };

  const handleCustomerCreated = () => {
    setIsCustomerFormOpen(false);
    onAddCustomer();
  };

  const handleAddProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProductFormOpen(true);
    onClose();
  };

  const handleProductCreated = () => {
    setIsProductFormOpen(false);
    onAddProduct();
  };

  const handleAddPromo = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    // TODO: Implement promo form opening logic
    console.log('Add promo clicked');
  };

  if (!isOpen && !isCustomerFormOpen && !isProductFormOpen) return null;
  
  return (
    <>
      {isOpen && (
        <div className="dropdown-overlay" onClick={onClose}>
          <div className="add-new-dropdown" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
            <div className="add-new-dropdown-header">
              <span>Add New</span>
              <button onClick={onClose} className="add-new-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="add-new-dropdown-content">
              <a href="#" className="add-new-option" onClick={handleAddProduct}>
                <div className="add-new-option-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                </div>
                <span>Produk</span>
                <div className="add-new-option-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </a>
              <a href="#" className="add-new-option" onClick={handleAddCustomer}>
                <div className="add-new-option-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span>Customer</span>
                <div className="add-new-option-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </a>
              <a href="#" className="add-new-option" onClick={handleAddPromo}>
                <div className="add-new-option-icon">
                  <MdLocalOffer size={20} />
                </div>
                <span>Promo</span>
                <div className="add-new-option-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Customer Form */}
      <AddCustomerForm 
        isOpen={isCustomerFormOpen} 
        onClose={() => setIsCustomerFormOpen(false)} 
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Product Form */}
      <AddProductForm 
        isOpen={isProductFormOpen} 
        onClose={() => setIsProductFormOpen(false)} 
        onProductCreated={handleProductCreated}
      />
    </>
  );
};

export default AddNewDropdown; 
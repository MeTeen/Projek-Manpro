import React, { useState } from 'react';
import AddNewDropdown from './AddNewDropdown';
import AddCustomerForm from './AddCustomerForm';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onCustomerCreated?: () => void;
  onAddNewClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCustomerCreated, onAddNewClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const { logout } = useAuth();

  const toggleDropdown = () => {
    if (onAddNewClick) {
      onAddNewClick();
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const openCustomerForm = () => {
    setCustomerFormOpen(true);
  };

  const closeCustomerForm = () => {
    setCustomerFormOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="dashboard-header">
      <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Dashboard</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
        <button className="add-new-button" onClick={toggleDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New
        </button>
        <button className="logout-button" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
        <div>
          <button style={{ padding: '8px', color: 'var(--gray-500)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--blue-900)', 
          color: 'var(--white)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '12px'
        }}>
          JD
        </div>
        {!onAddNewClick && (
          <AddNewDropdown 
            isOpen={dropdownOpen} 
            onClose={closeDropdown} 
            onAddCustomer={openCustomerForm}
            onAddProduct={() => console.log('Add product clicked')}
          />
        )}
        <AddCustomerForm 
          isOpen={customerFormOpen} 
          onClose={closeCustomerForm} 
          onCustomerCreated={onCustomerCreated} 
        />
      </div>
    </header>
  );
};

export default Header;

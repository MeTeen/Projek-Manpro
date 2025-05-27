import React, { useState, useEffect, useCallback } from "react";
import { MdPerson, MdShoppingCart } from "react-icons/md";
import AddNewDropdown from "./AddNewDropdown";
import customerService from '../../services/customerService';
import taskService from '../../services/taskService';
import purchaseService from '../../services/purchaseService';
import authService from '../../services/authService';
import CustomerSection from "./CustomerSection";
import TaskSection from "./TaskSection";
import Header from "./Header";
import Sidebar from "./Sidebar";
// import CustomersList from "./CustomerTopSpending";

const DashboardHome: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCustomer, setRefreshCustomer] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Data for UI
  const [customerCount, setCustomerCount] = useState(0);
  const [promoCount, setPromoCount] = useState(0);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get authentication token
        const token = authService.getToken();
        
        if (!token) {
          throw new Error('Authentication required. Please log in again.');
        }
        
        // Fetch customers count using customerService
        try {
          const customers = await customerService.getAllCustomers();
          console.log('Customers loaded:', customers);
          if (customers && customers.length > 0) {
            setCustomerCount(customers.length);
          }
        } catch (customerError) {
          console.error('Error fetching customers:', customerError);
          // Keep default count on error
        }
        
        // Fetch purchases count using purchaseService
        try {
          const purchases = await purchaseService.getAllPurchases();
          console.log('Purchases loaded:', purchases);
          if (purchases && purchases.length > 0) {
            setPromoCount(purchases.length);
          }
        } catch (purchaseError) {
          console.error('Error fetching purchases:', purchaseError);
          // Keep default count on error
        }
        
        // Fetch tasks using taskService
        try {
          await taskService.getTasks();
        } catch (taskError) {
          console.error('Error fetching tasks:', taskError);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load dashboard data');
        }
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler for when a new customer is created
  const handleCustomerCreated = useCallback(() => {
    // Increment counter to trigger a refresh of CustomerSection
    setRefreshCustomer(prev => prev + 1);
    // Also update customer count
    setCustomerCount(prev => prev + 1);
  }, []);

  const handleAddNewClick = () => {
    setIsDropdownOpen(true);
  };
  
  const handleAddProduct = useCallback(() => {
    console.log('Product created, refreshing data...');
    // You could add product-specific state refresh logic here if needed
    // Similar to handleCustomerCreated function
  }, []);

  // Show loading state
  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  // Show error state
  if (error) {
    return <div>Error: {error}</div>;
  }

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
          {/* Add Header component */}
          <Header 
            onCustomerCreated={handleCustomerCreated}
            onAddNewClick={handleAddNewClick}
          />

          {/* Three-Column Layout (33% each) */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginTop: '30px',
            marginBottom: '30px'
          }}>
            {/* First Column (33%) - Empty for now */}
            <div style={{ 
              flex: '1 1 33%',
              minHeight: '300px'
            }}>
              {/* Intentionally left empty as requested */}
            </div>
            
            {/* Second Column (33%) - Total Spending Customers */}
            <div style={{ 
              flex: '1 1 33%',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              padding: '20px',
              overflow: 'hidden'
            }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginTop: 0,
                marginBottom: '16px',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px'
              }}>
                Top Spending Customers
              </h2>
              {/* <CustomersList limit={5} refreshTrigger={refreshCustomer} /> */}
            </div>
            
            {/* Third Column (33%) - Customers Section */}
            <div style={{ 
              flex: '1 1 33%',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              padding: '20px',
              overflow: 'hidden'
            }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginTop: 0,
                marginBottom: '16px',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px'
              }}>
                Customers
              </h2>
              <div style={{ height: '300px', overflowY: 'auto' }}>
                <CustomerSection refreshTrigger={refreshCustomer} />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginTop: '24px',
            marginBottom: '40px'
          }}>
            <div style={{ 
              flex: 1, 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', marginTop: 0 }}>Customers</h3>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{customerCount}</div>
              <div style={{ 
                position: 'absolute', 
                bottom: '20px', 
                right: '20px', 
                backgroundColor: '#EEF2FF', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5E5CEB'
              }}>
                <MdPerson size={20} />
              </div>
            </div>
            
            <div style={{ 
              flex: 1, 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', marginTop: 0 }}>Purchases</h3>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{promoCount}</div>
              <div style={{ 
                position: 'absolute', 
                bottom: '20px', 
                right: '20px', 
                backgroundColor: '#FEF3C7', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706'
              }}>
                <MdShoppingCart size={20} />
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Tasks To Do</h2>
              <a href="#" style={{ color: '#5E5CEB', textDecoration: 'none', fontSize: '14px' }}>View All</a>
            </div>
            <TaskSection />
          </div>
        </div>
      </div>
      
      {/* Dropdown menu for adding new items */}
      <AddNewDropdown 
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onAddCustomer={handleCustomerCreated}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default DashboardHome;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdPerson, 
  MdShoppingBag, 
  MdBarChart, 
  MdChecklist, 
  MdChevronLeft,
  MdChevronRight,
  MdPointOfSale,
  MdLocalOffer,
  MdInfo,
  MdConfirmationNumber
} from 'react-icons/md';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navItems = [
    { path: '/admin/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/customers', icon: <MdPerson size={20} />, label: 'Customers' },
    { path: '/admin/products', icon: <MdShoppingBag size={20} />, label: 'Products' },
    { path: '/admin/transactions', icon: <MdPointOfSale size={20} />, label: 'Transactions' },    { path: '/admin/promo', icon: <MdLocalOffer size={20} />, label: 'Promo' },
    { path: '/admin/analytics', icon: <MdBarChart size={20} />, label: 'Analytics' },
    { path: '/admin/tasksection', icon: <MdChecklist size={20} />, label: 'Task To Do' },
    { path: '/admin/tickets', icon: <MdConfirmationNumber size={20} />, label: 'Tickets' },
    { path: '/admin/about', icon: <MdInfo size={20} />, label: 'About' },
    { path: '/companyprofile', icon: <MdPerson size={20} />, label: 'Our Company' }  // Keep public
  ];
  const isActiveRoute = (path: string) => {
    if (path === '/admin/dashboard') {
      return currentPath === path || currentPath === '/admin' || currentPath === '/admin/';
    }
    return currentPath.startsWith(path);
  };

  return (    <div 
      style={{
        width: collapsed ? '60px' : '240px',
        minHeight: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #f0f0f0',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {onToggle && (
        <button
          onClick={onToggle}
          style={{
            position: 'absolute',
            top: '20px',
            right: collapsed ? '10px' : '20px',
            background: 'white',
            border: '1px solid #f0f0f0',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 5,
            padding: 0
          }}
        >
          {collapsed ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />}
        </button>
      )}
        <div style={{ 
        padding: collapsed ? '20px 14px' : '20px', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        marginBottom: '24px'
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          minWidth: '32px', 
          minHeight: '32px',
          borderRadius: '50%', 
          backgroundColor: '#3E37F7', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>🐝</span>
        </div>
        {!collapsed && (
          <span style={{ 
            marginLeft: '12px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            opacity: collapsed ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            Bee Furniture Admin
          </span>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '4px' }}>
              <Link
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  color: isActiveRoute(item.path) ? '#3E37F7' : '#64748b',
                  backgroundColor: isActiveRoute(item.path) ? '#f5f5ff' : 'transparent',
                  borderLeft: isActiveRoute(item.path) ? '3px solid #3E37F7' : '3px solid transparent',
                  fontWeight: isActiveRoute(item.path) ? '600' : 'normal',
                  transition: 'background-color 0.2s ease',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  width: collapsed ? '100%' : '24px'
                }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span style={{ 
                    marginLeft: '12px',
                    opacity: collapsed ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                  }}>
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

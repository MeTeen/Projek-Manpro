import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { logApiConfig } from './config/api';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignUp from './pages/admin/AdminSignUp';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import CustomersPage from './pages/admin/CustomersPage';
import TransactionPage from './pages/admin/TransactionPage';
import ProductPage from './pages/admin/ProductPage';
import TaskSectionPage from './pages/admin/TaskSectionPage';
import PromoPage from './pages/admin/PromoPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AboutPage from './pages/AboutPage';
import ApiDebugger from './components/ApiDebugger';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import CompanyProfile from './pages/CompanyProfile';
import AdminTicketPage from './pages/admin/AdminTicketPage';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerTickets from './pages/customer/CustomerTickets';



// Set to true to show the API debugger
const SHOW_API_DEBUGGER = true;

// Initialize API configuration logging
logApiConfig();

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<CompanyProfile/>} />
          <Route path="/companyprofile" element={<CompanyProfile />} />
            {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />
            {/* Customer Routes */}
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/tickets" element={<CustomerTickets />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute>
                <TransactionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasksection"
            element={
              <ProtectedRoute>
                <TaskSectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promo"
            element={
              <ProtectedRoute>
                <PromoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/about"
            element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute>
                <AdminTicketPage />
              </ProtectedRoute>
            }
          />
          
          {/* Legacy redirects for old admin routes */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/signup" element={<Navigate to="/admin/signup" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
          <Route path="/transactions" element={<Navigate to="/admin/transactions" replace />} />
          <Route path="/tasksection" element={<Navigate to="/admin/tasksection" replace />} />
          <Route path="/products" element={<Navigate to="/admin/products" replace />} />
          <Route path="/promo" element={<Navigate to="/admin/promo" replace />} />
          <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
          <Route path="/about" element={<Navigate to="/admin/about" replace />} />
        </Routes>

        {/* API Debugger for development */}
        <ApiDebugger isVisible={SHOW_API_DEBUGGER} />
      </Router>
    </AuthProvider>
  );
}

export default App;

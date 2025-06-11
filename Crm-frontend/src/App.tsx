import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { logApiConfig } from './config/api';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import CustomersPage from './components/pages/CustomersPage';
import TransactionPage from './components/pages/TransactionPage';
import ProductPage from './components/pages/ProductPage';
import TaskSectionPage from './components/pages/TaskSectionPage';
import PromoPage from './components/pages/PromoPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import AboutPage from './components/pages/AboutPage';
import ApiDebugger from './components/ApiDebugger';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import CompanyProfile from './components/pages/CompanyProfile';
import AdminTicketPage from './components/pages/AdminTicketPage';



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
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/signup" element={<SignUp />} />
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

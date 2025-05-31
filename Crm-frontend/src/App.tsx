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
import ApiDebugger from './components/ApiDebugger';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Set to true to show the API debugger
const SHOW_API_DEBUGGER = true;

// Initialize API configuration logging
logApiConfig();

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaksi"
            element={
              <ProtectedRoute>
                <TransactionPage />
              </ProtectedRoute>
            }
          /> 
          <Route
            path="/tasksection"
            element={
              <ProtectedRoute>
                <TaskSectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>}></Route>
          <Route
            path="/promo"
            element={
              <ProtectedRoute>
                <PromoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        
        {/* API Debugger for development */}
        <ApiDebugger isVisible={SHOW_API_DEBUGGER} />
      </Router>
    </AuthProvider>
  );
}

export default App;

import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import taskRoutes from './taskRoutes';
import productRoutes from './product.routes';
import purchaseRoutes from './purchase.routes';
import promoRoutes from './promo.routes';
import analyticsRoutes from './analytics.routes';
import dashboardRoutes from './dashboard.routes';
import activityRoutes from './activity.routes';
import { createBrowserRouter } from 'react-router-dom';
import ticketRoutes from './tickets';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);

// Health check endpoints
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// Basic status endpoint
router.get('/status', (req, res) => {
  res.status(200).json({ 
    message: 'CRM Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Customer routes
router.use('/customers', customerRoutes);

// Task routes
router.use('/tasks', taskRoutes);

// Product routes
router.use('/products', productRoutes);

// Purchase routes
router.use('/purchases', purchaseRoutes);

// Promo routes
router.use('/promos', promoRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Activity routes
router.use('/activities', activityRoutes);

export default router; 
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

const router = Router();

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
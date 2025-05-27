import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import taskRoutes from './taskRoutes';
import productRoutes from './product.routes';
import purchaseRoutes from './purchase.routes';
import promoRoutes from './promo.routes';

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

export default router; 
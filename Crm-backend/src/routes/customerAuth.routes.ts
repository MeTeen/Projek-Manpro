import { Router } from 'express';
import { customerLogin, changePassword, getCustomerProfile } from '../controllers/customerAuth.controller';
import { authenticateCustomer } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/login', customerLogin as any);
router.post('/change-password', changePassword as any);

// Protected routes
router.get('/profile', authenticateCustomer as any, getCustomerProfile as any);

export default router;

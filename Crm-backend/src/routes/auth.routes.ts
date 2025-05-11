import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateJWT, isSuperAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', authController.signup as any);
router.post('/login', authController.login as any);

// Protected routes
router.get('/profile', authenticateJWT as any, authController.getProfile as any);

export default router; 
import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticateJWT, isAdmin } from '../middlewares/auth.middleware';
import { uploadAvatar } from '../middlewares/upload.middleware';

const router = Router();

// All customer routes are protected by JWT authentication
router.use(authenticateJWT as any);

// Get all customers
router.get('/', customerController.getAllCustomers as any);

// Get a single customer
router.get('/:id', customerController.getCustomerById as any);

// Get customer with purchase history
router.get('/:id/purchases', customerController.getCustomerWithPurchases as any);

// Create a new customer
router.post('/', uploadAvatar, customerController.createCustomer as any);

// Update a customer
router.put('/:id', uploadAvatar, customerController.updateCustomer as any);

// Delete a customer
router.delete('/:id', customerController.deleteCustomer as any);

export default router; 
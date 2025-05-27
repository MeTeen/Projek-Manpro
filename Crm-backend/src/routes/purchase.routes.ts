import { Router } from 'express';
import { 
  createPurchase,
  getAllPurchases,
  getCustomerPurchases,
  getProductPurchaseHistory,
  addProductToCustomer
} from '../controllers/purchase.controller';
import { authenticateJWT, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Apply JWT authentication to all purchase routes
router.use(authenticateJWT as any);
router.use(isAdmin as any);

// POST /api/purchases - Create a new purchase
router.post('/', createPurchase as any);

// POST /api/purchases/add-to-customer - Add product to customer (from dropdown)
router.post('/add-to-customer', addProductToCustomer as any);

// GET /api/purchases - Get all purchases
router.get('/', getAllPurchases as any);

// GET /api/purchases/customer/:customerId - Get purchases for a specific customer
router.get('/customer/:customerId', getCustomerPurchases as any);

// GET /api/purchases/product/:productId - Get purchase history for a specific product
router.get('/product/:productId', getProductPurchaseHistory as any);

export default router; 
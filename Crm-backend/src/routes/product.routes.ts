import { Router } from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  getProductsForDropdown
} from '../controllers/product.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Apply JWT authentication to all product routes
router.use(authenticateJWT as any);

// GET /api/products - Get all products
router.get('/', getAllProducts as any);

// GET /api/products/dropdown - Get products for dropdown
router.get('/dropdown', getProductsForDropdown as any);

// POST /api/products - Create a new product
router.post('/', createProduct as any);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById as any);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct as any);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct as any);

export default router; 
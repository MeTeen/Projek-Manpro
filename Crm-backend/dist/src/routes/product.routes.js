"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply JWT authentication to all product routes
router.use(auth_middleware_1.authenticateJWT);
// GET /api/products - Get all products
router.get('/', product_controller_1.getAllProducts);
// GET /api/products/dropdown - Get products for dropdown
router.get('/dropdown', product_controller_1.getProductsForDropdown);
// POST /api/products - Create a new product
router.post('/', product_controller_1.createProduct);
// GET /api/products/:id - Get product by ID
router.get('/:id', product_controller_1.getProductById);
// PUT /api/products/:id - Update product
router.put('/:id', product_controller_1.updateProduct);
// DELETE /api/products/:id - Delete product
router.delete('/:id', product_controller_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map
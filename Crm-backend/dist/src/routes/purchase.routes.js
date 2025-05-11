"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchase_controller_1 = require("../controllers/purchase.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply JWT authentication to all purchase routes
router.use(auth_middleware_1.authenticateJWT);
// POST /api/purchases - Create a new purchase
router.post('/', purchase_controller_1.createPurchase);
// POST /api/purchases/add-to-customer - Add product to customer (from dropdown)
router.post('/add-to-customer', purchase_controller_1.addProductToCustomer);
// GET /api/purchases - Get all purchases
router.get('/', purchase_controller_1.getAllPurchases);
// GET /api/purchases/customer/:customerId - Get purchases for a specific customer
router.get('/customer/:customerId', purchase_controller_1.getCustomerPurchases);
// GET /api/purchases/product/:productId - Get purchase history for a specific product
router.get('/product/:productId', purchase_controller_1.getProductPurchaseHistory);
exports.default = router;
//# sourceMappingURL=purchase.routes.js.map
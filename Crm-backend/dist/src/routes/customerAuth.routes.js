"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerAuth_controller_1 = require("../controllers/customerAuth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', customerAuth_controller_1.customerLogin);
router.post('/change-password', customerAuth_controller_1.changePassword);
// Protected routes
router.get('/profile', auth_middleware_1.authenticateCustomer, customerAuth_controller_1.getCustomerProfile);
exports.default = router;
//# sourceMappingURL=customerAuth.routes.js.map
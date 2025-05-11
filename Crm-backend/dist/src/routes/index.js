"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const customer_routes_1 = __importDefault(require("./customer.routes"));
const taskRoutes_1 = __importDefault(require("./taskRoutes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const purchase_routes_1 = __importDefault(require("./purchase.routes"));
const router = (0, express_1.Router)();
// Auth routes
router.use('/auth', auth_routes_1.default);
// Customer routes
router.use('/customers', customer_routes_1.default);
// Task routes
router.use('/tasks', taskRoutes_1.default);
// Product routes
router.use('/products', product_routes_1.default);
// Purchase routes
router.use('/purchases', purchase_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
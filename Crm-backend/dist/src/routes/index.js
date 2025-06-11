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
const promo_routes_1 = __importDefault(require("./promo.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const activity_routes_1 = __importDefault(require("./activity.routes"));
const ticket_routes_1 = __importDefault(require("./ticket.routes"));
const customerAuth_routes_1 = __importDefault(require("./customerAuth.routes"));
const customerTicket_routes_1 = __importDefault(require("./customerTicket.routes"));
const ticketMessages_routes_1 = __importDefault(require("./ticketMessages.routes"));
const router = (0, express_1.Router)();
// Health check endpoints
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development',
        database: 'connected'
    });
});
// Basic status endpoint
router.get('/status', (req, res) => {
    res.status(200).json({
        message: 'CRM Backend API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
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
// Promo routes
router.use('/promos', promo_routes_1.default);
// Analytics routes
router.use('/analytics', analytics_routes_1.default);
// Dashboard routes
router.use('/dashboard', dashboard_routes_1.default);
// Activity routes
router.use('/activities', activity_routes_1.default);
// Ticket routes (admin)
router.use('/admin/tickets', ticket_routes_1.default);
// Customer authentication routes
router.use('/customer/auth', customerAuth_routes_1.default);
// Customer ticket routes
router.use('/customer', customerTicket_routes_1.default);
// Ticket message routes (for both admin and customer)
router.use('/', ticketMessages_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
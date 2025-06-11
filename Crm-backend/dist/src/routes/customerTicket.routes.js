"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerTicket_controller_1 = require("../controllers/customerTicket.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All customer ticket routes require customer authentication
router.use(auth_middleware_1.authenticateCustomer);
// Customer ticket routes
router.get('/stats', customerTicket_controller_1.getCustomerTicketStats);
router.get('/purchases', customerTicket_controller_1.getCustomerPurchases);
router.get('/', customerTicket_controller_1.getCustomerTickets);
router.get('/:id', customerTicket_controller_1.getCustomerTicketById);
router.post('/', customerTicket_controller_1.createCustomerTicket);
exports.default = router;
//# sourceMappingURL=customerTicket.routes.js.map
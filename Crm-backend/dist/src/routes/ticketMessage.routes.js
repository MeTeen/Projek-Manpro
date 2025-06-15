"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const ticketMessage_controller_1 = require("../controllers/ticketMessage.controller");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticateJWT);
// Get all messages for a ticket
router.get('/tickets/:ticketId/messages', ticketMessage_controller_1.getTicketMessages);
// Create a new message in a ticket
router.post('/tickets/:ticketId/messages', ticketMessage_controller_1.createTicketMessage);
// Update a message
router.put('/tickets/:ticketId/messages/:messageId', ticketMessage_controller_1.updateTicketMessage);
// Delete a message
router.delete('/tickets/:ticketId/messages/:messageId', ticketMessage_controller_1.deleteTicketMessage);
exports.default = router;
//# sourceMappingURL=ticketMessage.routes.js.map
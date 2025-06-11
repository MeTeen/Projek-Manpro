"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// All ticket routes require authentication
router.use(auth_middleware_1.authenticateJWT);
// Admin ticket routes
router.get('/stats', ticket_controller_1.getTicketStats);
router.get('/admins', ticket_controller_1.getAdminsForAssignment);
router.get('/', ticket_controller_1.getAllTickets);
router.get('/:id', ticket_controller_1.getTicketById);
router.patch('/:id', ticket_controller_1.updateTicket);
router.post('/', ticket_controller_1.createTicket);
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map
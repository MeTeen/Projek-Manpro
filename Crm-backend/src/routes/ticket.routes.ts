import express from 'express';
import {
  getAllTickets,
  getTicketById,
  updateTicket,
  getTicketStats,
  getAdminsForAssignment,
  createTicket
} from '../controllers/ticket.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();

// All ticket routes require authentication
router.use(authenticateJWT as any);

// Admin ticket routes
router.get('/stats', getTicketStats as any);
router.get('/admins', getAdminsForAssignment as any);
router.get('/', getAllTickets as any);
router.get('/:id', getTicketById as any);
router.patch('/:id', updateTicket as any);
router.post('/', createTicket as any);

export default router;

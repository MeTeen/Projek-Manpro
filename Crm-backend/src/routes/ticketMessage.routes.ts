import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import {
  getTicketMessages,
  createTicketMessage,
  updateTicketMessage,
  deleteTicketMessage
} from '../controllers/ticketMessage.controller';

const router = Router();

// All routes require authentication
router.use(authenticateJWT as any);

// Get all messages for a ticket
router.get('/tickets/:ticketId/messages', getTicketMessages as any);

// Create a new message in a ticket
router.post('/tickets/:ticketId/messages', createTicketMessage as any);

// Update a message
router.put('/tickets/:ticketId/messages/:messageId', updateTicketMessage as any);

// Delete a message
router.delete('/tickets/:ticketId/messages/:messageId', deleteTicketMessage as any);

export default router;

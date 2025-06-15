import { Router } from 'express';
import { authenticateAnyUser } from '../middlewares/auth.middleware';
import {
  getTicketMessages,
  createTicketMessage,
  updateTicketMessage,
  deleteTicketMessage
} from '../controllers/ticketMessage.controller';

const router = Router();

// Get all messages for a ticket (require authentication)
router.get('/tickets/:ticketId/messages', authenticateAnyUser as any, getTicketMessages as any);

// Create a new message in a ticket (require authentication)
router.post('/tickets/:ticketId/messages', authenticateAnyUser as any, createTicketMessage as any);

// Update a message (require authentication)
router.put('/tickets/:ticketId/messages/:messageId', authenticateAnyUser as any, updateTicketMessage as any);

// Delete a message (require authentication)
router.delete('/tickets/:ticketId/messages/:messageId', authenticateAnyUser as any, deleteTicketMessage as any);

export default router;

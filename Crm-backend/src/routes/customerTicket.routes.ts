import { Router } from 'express';
import {
  getCustomerTickets,
  getCustomerTicketById,
  createCustomerTicket,
  getCustomerPurchases,
  getCustomerTicketStats
} from '../controllers/customerTicket.controller';
import { authenticateCustomer } from '../middlewares/auth.middleware';

const router = Router();

// All customer ticket routes require customer authentication
router.use(authenticateCustomer as any);

// Customer ticket routes
router.get('/tickets/stats', getCustomerTicketStats as any);
router.get('/purchases', getCustomerPurchases as any);
router.get('/tickets', getCustomerTickets as any);
router.get('/tickets/:id', getCustomerTicketById as any);
router.post('/tickets', createCustomerTicket as any);

export default router;

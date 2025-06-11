import { Request, Response } from 'express';
import { Ticket, Customer, CustomerProduct, Product } from '../models';
import { TicketInput } from '../models/ticket.model';
import { Op } from 'sequelize';

/**
 * Get all tickets for a customer
 * @route GET /api/customer/tickets
 */
export const getCustomerTickets = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Build where clause
    const whereClause: any = { customerId };
    if (status) whereClause.status = status;

    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CustomerProduct,
          as: 'purchase',
          attributes: ['id', 'quantity', 'price', 'purchaseDate'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'category']
            }
          ],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: (error as Error).message,
    });
  }
};

/**
 * Get ticket details for customer
 * @route GET /api/customer/tickets/:id
 */
export const getCustomerTicketById = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const ticketId = parseInt(req.params.id);

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const ticket = await Ticket.findOne({
      where: { 
        id: ticketId,
        customerId: customerId  // Ensure customer can only see their own tickets
      },
      include: [
        {
          model: CustomerProduct,
          as: 'purchase',
          attributes: ['id', 'quantity', 'price', 'purchaseDate'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'category', 'description']
            }
          ],
          required: false
        }
      ],
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: (error as Error).message,
    });
  }
};

/**
 * Create a new ticket
 * @route POST /api/customer/tickets
 */
export const createCustomerTicket = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { purchaseId, subject, message, category, priority, attachmentUrls } = req.body;

    // Validate required fields
    if (!subject || !message || !category) {
      return res.status(400).json({
        success: false,
        message: 'Subject, message, and category are required',
      });
    }

    // If purchaseId is provided, verify it belongs to the customer
    if (purchaseId) {
      const purchase = await CustomerProduct.findOne({
        where: { 
          id: purchaseId,
          customerId: customerId
        }
      });
      
      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found or does not belong to you',
        });
      }
    }

    const ticketData: TicketInput = {
      customerId,
      purchaseId: purchaseId || null,
      subject,
      message,
      category,
      priority: priority || 'Medium',
      attachmentUrls: attachmentUrls || null,
    };

    const ticket = await Ticket.create(ticketData as any);

    // Fetch created ticket with includes
    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: CustomerProduct,
          as: 'purchase',
          attributes: ['id', 'quantity', 'price', 'purchaseDate'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'category']
            }
          ],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: createdTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: (error as Error).message,
    });
  }
};

/**
 * Get customer's purchase history for ticket creation
 * @route GET /api/customer/purchases
 */
export const getCustomerPurchases = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const purchases = await CustomerProduct.findAll({
      where: { customerId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'category', 'description']
        }
      ],
      order: [['purchaseDate', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: (error as Error).message,
    });
  }
};

/**
 * Get ticket statistics for customer dashboard
 * @route GET /api/customer/tickets/stats
 */
export const getCustomerTicketStats = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const [totalTickets, openTickets, resolvedTickets, inProgressTickets] = await Promise.all([
      Ticket.count({ where: { customerId } }),
      Ticket.count({ where: { customerId, status: 'Open' } }),
      Ticket.count({ where: { customerId, status: 'Resolved' } }),
      Ticket.count({ where: { customerId, status: 'In Progress' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: totalTickets - openTickets - inProgressTickets - resolvedTickets,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket statistics',
      error: (error as Error).message,
    });
  }
};

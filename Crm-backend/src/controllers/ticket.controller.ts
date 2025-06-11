import { Request, Response } from 'express';
import { Ticket, Customer, CustomerProduct, Admin, Product } from '../models';
import { TicketInput } from '../models/ticket.model';
import { Op } from 'sequelize';

/**
 * Get all tickets for admin with filtering and pagination
 * @route GET /api/admin/tickets
 */
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    console.log('🎫 getAllTickets called with query:', req.query);
    console.log('🎫 User from token:', req.user);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const category = req.query.category as string;
    const assignedTo = req.query.assignedTo as string;
    const search = req.query.search as string;

    // Build where clause for filtering
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (category) whereClause.category = category;
    if (assignedTo) whereClause.assignedTo = parseInt(assignedTo);
    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: CustomerProduct,
          as: 'purchase',
          attributes: ['id', 'quantity', 'price', 'purchaseDate'],          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name']
            }
          ],
          required: false
        },
        {
          model: Admin,
          as: 'assignedAdmin',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [
        ['priority', 'DESC'], // Urgent first
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
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
 * Get ticket by ID with full details
 * @route GET /api/admin/tickets/:id
 */
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address', 'city']
        },
        {
          model: CustomerProduct,
          as: 'purchase',
          attributes: ['id', 'quantity', 'price', 'purchaseDate'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'imageUrl', 'description']
            }
          ],
          required: false
        },
        {
          model: Admin,
          as: 'assignedAdmin',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${id} not found`,
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
 * Update ticket status, priority, or assign to admin
 * @route PATCH /api/admin/tickets/:id
 */
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, resolution } = req.body;
    const currentUser = (req as any).user; // From auth middleware

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket with ID ${id} not found`,
      });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (resolution) updateData.resolution = resolution;

    // If status is being changed to Resolved or Closed, set resolvedAt
    if (status && (status === 'Resolved' || status === 'Closed')) {
      updateData.resolvedAt = new Date();
    }

    await ticket.update(updateData);

    // Fetch updated ticket with includes
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Admin,
          as: 'assignedAdmin',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: (error as Error).message,
    });
  }
};

/**
 * Get ticket statistics for dashboard
 * @route GET /api/admin/tickets/stats
 */
export const getTicketStats = async (req: Request, res: Response) => {
  try {
    const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets] = await Promise.all([
      Ticket.count(),
      Ticket.count({ where: { status: 'Open' } }),
      Ticket.count({ where: { status: 'In Progress' } }),
      Ticket.count({ where: { status: 'Resolved' } }),
      Ticket.count({ where: { status: 'Closed' } })
    ]);

    const [urgentTickets, highPriorityTickets] = await Promise.all([
      Ticket.count({ where: { priority: 'Urgent', status: { [Op.not]: 'Closed' } } }),
      Ticket.count({ where: { priority: 'High', status: { [Op.not]: 'Closed' } } })
    ]);

    // Category breakdown
    const categoryStats = await Ticket.findAll({
      attributes: [
        'category',
        [Ticket.sequelize!.fn('COUNT', Ticket.sequelize!.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Recent tickets (last 7 days)
    const recentTickets = await Ticket.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets
        },
        priority: {
          urgent: urgentTickets,
          high: highPriorityTickets
        },
        categories: categoryStats,
        recent: recentTickets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket statistics',
      error: (error as Error).message,
    });
  }
};

/**
 * Get all admins for assignment dropdown
 * @route GET /api/admin/tickets/admins
 */
export const getAdminsForAssignment = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'username', 'email'],
      order: [['username', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: (error as Error).message,
    });
  }
};

/**
 * Create a ticket (usually used by customer, but admin can also create)
 * @route POST /api/admin/tickets
 */
export const createTicket = async (req: Request, res: Response) => {
  try {
    const ticketData: TicketInput = req.body;

    // Validate customer exists
    const customer = await Customer.findByPk(ticketData.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${ticketData.customerId} not found`,
      });
    }

    // Validate purchase exists if provided
    if (ticketData.purchaseId) {
      const purchase = await CustomerProduct.findOne({
        where: {
          id: ticketData.purchaseId,
          customerId: ticketData.customerId
        }
      });
      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: `Purchase with ID ${ticketData.purchaseId} not found for this customer`,
        });
      }
    }

    const ticket = await Ticket.create(ticketData as any);

    // Fetch created ticket with includes
    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: CustomerProduct,
          as: 'purchase',
          attributes: ['id', 'quantity', 'price', 'purchaseDate'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name']
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

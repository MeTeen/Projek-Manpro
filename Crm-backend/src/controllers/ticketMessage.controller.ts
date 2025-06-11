import { Request, Response } from 'express';
import { TicketMessage, Ticket, Customer, Admin } from '../models';
import { TicketMessageInput } from '../models/ticketMessage.model';

/**
 * Get all messages for a ticket
 * @route GET /api/tickets/:ticketId/messages
 */
export const getTicketMessages = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify ticket exists and user has access
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check access permissions
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Customer can only access their own tickets, admin can access all
    if (user.role === 'customer' && ticket.customerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { count, rows: messages } = await TicketMessage.findAndCountAll({
      where: { ticketId },
      include: [
        {
          model: Customer,
          as: 'customerSender',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: Admin,
          as: 'adminSender',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'ASC']], // Oldest messages first for chat-like experience
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket messages',
      error: (error as Error).message,
    });
  }
};

/**
 * Create a new message in a ticket
 * @route POST /api/tickets/:ticketId/messages
 */
export const createTicketMessage = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const { message, attachmentUrls } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Verify ticket exists
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check access permissions
    if (user.role === 'customer' && ticket.customerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Determine sender type and ID
    const senderType = user.role === 'admin' ? 'admin' : 'customer';
    const senderId = user.id;

    const messageData: TicketMessageInput = {
      ticketId,
      senderId,
      senderType,
      message: message.trim(),
      attachmentUrls: attachmentUrls || null,
    };

    const newMessage = await TicketMessage.create(messageData);

    // Update ticket's updatedAt timestamp and potentially status
    if (user.role === 'customer' && ticket.status === 'Resolved') {
      // If customer replies to a resolved ticket, reopen it
      await ticket.update({ status: 'Open' });
    } else if (user.role === 'admin' && ticket.status === 'Open') {
      // If admin replies to an open ticket, mark as in progress
      await ticket.update({ status: 'In Progress' });
    }

    // Fetch the created message with sender details
    const messageWithSender = await TicketMessage.findByPk(newMessage.id, {
      include: [
        {
          model: Customer,
          as: 'customerSender',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: Admin,
          as: 'adminSender',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: messageWithSender,
    });
  } catch (error) {
    console.error('Error creating ticket message:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket message',
      error: (error as Error).message,
    });
  }
};

/**
 * Update a message (only by the sender)
 * @route PUT /api/tickets/:ticketId/messages/:messageId
 */
export const updateTicketMessage = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const messageId = parseInt(req.params.messageId);
    const { message } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const ticketMessage = await TicketMessage.findOne({
      where: { id: messageId, ticketId }
    });

    if (!ticketMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender
    const senderType = user.role === 'admin' ? 'admin' : 'customer';
    if (ticketMessage.senderId !== user.id || ticketMessage.senderType !== senderType) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    // Prevent editing messages older than 24 hours
    const messageAge = Date.now() - new Date(ticketMessage.createdAt).getTime();
    const maxEditTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (messageAge > maxEditTime) {
      return res.status(403).json({
        success: false,
        message: 'Messages can only be edited within 24 hours',
      });
    }

    await ticketMessage.update({ message: message.trim() });

    const updatedMessage = await TicketMessage.findByPk(messageId, {
      include: [
        {
          model: Customer,
          as: 'customerSender',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: Admin,
          as: 'adminSender',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error updating ticket message:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket message',
      error: (error as Error).message,
    });
  }
};

/**
 * Delete a message (only by the sender or admin)
 * @route DELETE /api/tickets/:ticketId/messages/:messageId
 */
export const deleteTicketMessage = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const messageId = parseInt(req.params.messageId);
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const ticketMessage = await TicketMessage.findOne({
      where: { id: messageId, ticketId }
    });

    if (!ticketMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user can delete (sender or admin)
    const senderType = user.role === 'admin' ? 'admin' : 'customer';
    const canDelete = user.role === 'admin' || 
                     (ticketMessage.senderId === user.id && ticketMessage.senderType === senderType);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await ticketMessage.destroy();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting ticket message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting ticket message',
      error: (error as Error).message,
    });
  }
};

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = exports.getAdminsForAssignment = exports.getTicketStats = exports.updateTicket = exports.getTicketById = exports.getAllTickets = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
/**
 * Get all tickets for admin with filtering and pagination
 * @route GET /api/admin/tickets
 */
const getAllTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🎫 getAllTickets called with query:', req.query);
        console.log('🎫 User from token:', req.user);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        const priority = req.query.priority;
        const category = req.query.category;
        const assignedTo = req.query.assignedTo;
        const search = req.query.search;
        // Build where clause for filtering
        const whereClause = {};
        if (status)
            whereClause.status = status;
        if (priority)
            whereClause.priority = priority;
        if (category)
            whereClause.category = category;
        if (assignedTo)
            whereClause.assignedTo = parseInt(assignedTo);
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { subject: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { message: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ];
        }
        const { count, rows: tickets } = yield models_1.Ticket.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: models_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
                },
                {
                    model: models_1.CustomerProduct,
                    as: 'purchase',
                    attributes: ['id', 'quantity', 'price', 'purchaseDate'], include: [
                        {
                            model: models_1.Product,
                            as: 'product',
                            attributes: ['id', 'name']
                        }
                    ],
                    required: false
                },
                {
                    model: models_1.Admin,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message,
        });
    }
});
exports.getAllTickets = getAllTickets;
/**
 * Get ticket by ID with full details
 * @route GET /api/admin/tickets/:id
 */
const getTicketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ticket = yield models_1.Ticket.findByPk(id, {
            include: [
                {
                    model: models_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address', 'city']
                },
                {
                    model: models_1.CustomerProduct,
                    as: 'purchase',
                    attributes: ['id', 'quantity', 'price', 'purchaseDate'],
                    include: [
                        {
                            model: models_1.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'imageUrl', 'description']
                        }
                    ],
                    required: false
                },
                {
                    model: models_1.Admin,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket',
            error: error.message,
        });
    }
});
exports.getTicketById = getTicketById;
/**
 * Update ticket status, priority, or assign to admin
 * @route PATCH /api/admin/tickets/:id
 */
const updateTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo, resolution } = req.body;
        const currentUser = req.user; // From auth middleware
        const ticket = yield models_1.Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: `Ticket with ID ${id} not found`,
            });
        }
        const updateData = {};
        if (status)
            updateData.status = status;
        if (priority)
            updateData.priority = priority;
        if (assignedTo !== undefined)
            updateData.assignedTo = assignedTo;
        if (resolution)
            updateData.resolution = resolution;
        // If status is being changed to Resolved or Closed, set resolvedAt
        if (status && (status === 'Resolved' || status === 'Closed')) {
            updateData.resolvedAt = new Date();
        }
        yield ticket.update(updateData);
        // Fetch updated ticket with includes
        const updatedTicket = yield models_1.Ticket.findByPk(id, {
            include: [
                {
                    model: models_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: models_1.Admin,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating ticket',
            error: error.message,
        });
    }
});
exports.updateTicket = updateTicket;
/**
 * Get ticket statistics for dashboard
 * @route GET /api/admin/tickets/stats
 */
const getTicketStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets] = yield Promise.all([
            models_1.Ticket.count(),
            models_1.Ticket.count({ where: { status: 'Open' } }),
            models_1.Ticket.count({ where: { status: 'In Progress' } }),
            models_1.Ticket.count({ where: { status: 'Resolved' } }),
            models_1.Ticket.count({ where: { status: 'Closed' } })
        ]);
        const [urgentTickets, highPriorityTickets] = yield Promise.all([
            models_1.Ticket.count({ where: { priority: 'Urgent', status: { [sequelize_1.Op.not]: 'Closed' } } }),
            models_1.Ticket.count({ where: { priority: 'High', status: { [sequelize_1.Op.not]: 'Closed' } } })
        ]);
        // Category breakdown
        const categoryStats = yield models_1.Ticket.findAll({
            attributes: [
                'category',
                [models_1.Ticket.sequelize.fn('COUNT', models_1.Ticket.sequelize.col('id')), 'count']
            ],
            group: ['category'],
            raw: true
        });
        // Recent tickets (last 7 days)
        const recentTickets = yield models_1.Ticket.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket statistics',
            error: error.message,
        });
    }
});
exports.getTicketStats = getTicketStats;
/**
 * Get all admins for assignment dropdown
 * @route GET /api/admin/tickets/admins
 */
const getAdminsForAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield models_1.Admin.findAll({
            attributes: ['id', 'username', 'email'],
            order: [['username', 'ASC']]
        });
        res.status(200).json({
            success: true,
            data: admins
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admins',
            error: error.message,
        });
    }
});
exports.getAdminsForAssignment = getAdminsForAssignment;
/**
 * Create a ticket (usually used by customer, but admin can also create)
 * @route POST /api/admin/tickets
 */
const createTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketData = req.body;
        // Validate customer exists
        const customer = yield models_1.Customer.findByPk(ticketData.customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${ticketData.customerId} not found`,
            });
        }
        // Validate purchase exists if provided
        if (ticketData.purchaseId) {
            const purchase = yield models_1.CustomerProduct.findOne({
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
        const ticket = yield models_1.Ticket.create(ticketData);
        // Fetch created ticket with includes
        const createdTicket = yield models_1.Ticket.findByPk(ticket.id, {
            include: [
                {
                    model: models_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: models_1.CustomerProduct,
                    as: 'purchase',
                    attributes: ['id', 'quantity', 'price', 'purchaseDate'],
                    include: [
                        {
                            model: models_1.Product,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating ticket',
            error: error.message,
        });
    }
});
exports.createTicket = createTicket;
//# sourceMappingURL=ticket.controller.js.map
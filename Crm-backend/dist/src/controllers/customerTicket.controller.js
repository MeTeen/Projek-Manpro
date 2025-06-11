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
exports.getCustomerTicketStats = exports.getCustomerPurchases = exports.createCustomerTicket = exports.getCustomerTicketById = exports.getCustomerTickets = void 0;
const models_1 = require("../models");
/**
 * Get all tickets for a customer
 * @route GET /api/customer/tickets
 */
const getCustomerTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        const priority = req.query.priority;
        const category = req.query.category;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        // Build where clause
        const whereClause = { customerId };
        if (status)
            whereClause.status = status;
        if (priority)
            whereClause.priority = priority;
        if (category)
            whereClause.category = category;
        const { count, rows: tickets } = yield models_1.Ticket.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: models_1.Purchase,
                    as: 'purchase',
                    attributes: ['id', 'quantity', 'unitPrice', 'purchaseDate'],
                    include: [
                        {
                            model: models_1.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'dimensions']
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message,
        });
    }
});
exports.getCustomerTickets = getCustomerTickets;
/**
 * Get ticket details for customer
 * @route GET /api/customer/tickets/:id
 */
const getCustomerTicketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const ticketId = parseInt(req.params.id);
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const ticket = yield models_1.Ticket.findOne({
            where: {
                id: ticketId, customerId: customerId // Ensure customer can only see their own tickets
            },
            include: [
                {
                    model: models_1.Purchase,
                    as: 'purchase',
                    attributes: ['id', 'quantity', 'unitPrice', 'purchaseDate'],
                    include: [
                        {
                            model: models_1.Product,
                            as: 'product',
                            attributes: ['id', 'name', 'dimensions']
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket',
            error: error.message,
        });
    }
});
exports.getCustomerTicketById = getCustomerTicketById;
/**
 * Create a new ticket
 * @route POST /api/customer/tickets
 */
const createCustomerTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        } // If purchaseId is provided, verify it belongs to the customer
        if (purchaseId) {
            const purchase = yield models_1.Purchase.findOne({
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
        const ticketData = {
            customerId,
            purchaseId: purchaseId || null,
            subject,
            message,
            category,
            priority: priority || 'Medium',
            attachmentUrls: attachmentUrls || null,
        };
        const ticket = yield models_1.Ticket.create(ticketData); // Fetch created ticket with includes
        const createdTicket = yield models_1.Ticket.findByPk(ticket.id, { include: [
                {
                    model: models_1.Purchase,
                    as: 'purchase',
                    attributes: ['id', 'quantity', 'unitPrice', 'purchaseDate'],
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
exports.createCustomerTicket = createCustomerTicket;
/**
 * Get customer's purchase history for ticket creation
 * @route GET /api/customer/purchases
 */
const getCustomerPurchases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const purchases = yield models_1.Purchase.findAll({
            where: { customerId },
            include: [
                {
                    model: models_1.Product,
                    as: 'product',
                    attributes: ['id', 'name', 'dimensions']
                }
            ],
            order: [['purchaseDate', 'DESC']],
        });
        res.status(200).json({
            success: true,
            data: purchases,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer purchases',
            error: error.message,
        });
    }
});
exports.getCustomerPurchases = getCustomerPurchases;
/**
 * Get ticket statistics for customer dashboard
 * @route GET /api/customer/tickets/stats
 */
const getCustomerTicketStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const [totalTickets, openTickets, resolvedTickets, inProgressTickets] = yield Promise.all([
            models_1.Ticket.count({ where: { customerId } }),
            models_1.Ticket.count({ where: { customerId, status: 'Open' } }),
            models_1.Ticket.count({ where: { customerId, status: 'Resolved' } }),
            models_1.Ticket.count({ where: { customerId, status: 'In Progress' } }),
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket statistics',
            error: error.message,
        });
    }
});
exports.getCustomerTicketStats = getCustomerTicketStats;
//# sourceMappingURL=customerTicket.controller.js.map
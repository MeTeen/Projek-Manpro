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
exports.getAvailablePromosForCustomer = exports.removePromoFromCustomer = exports.assignPromoToCustomer = exports.deletePromo = exports.updatePromo = exports.getPromoById = exports.getAllPromos = exports.createPromo = void 0;
const models_1 = require("../models"); // Sesuaikan path
const sequelize_1 = require("sequelize");
// Hanya Super Admin
const createPromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, type, value, startDate, endDate, isActive } = req.body;
        const createdBy = req.user.id; // Jika ingin mencatat siapa yang create
        if (!name || !type || value === undefined) {
            return res.status(400).json({ success: false, message: 'Name, type, and value are required for promo' });
        }
        const promo = yield models_1.Promo.create({
            name,
            description,
            type,
            value,
            startDate,
            endDate,
            isActive: isActive !== undefined ? isActive : true,
            createdBy
        });
        res.status(201).json({ success: true, message: 'Promo created successfully', data: promo });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating promo', error: error.message });
    }
});
exports.createPromo = createPromo;
const getAllPromos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Optimize: Only fetch eligible customers if specifically requested
        const includeCustomers = req.query.includeCustomers === 'true';
        const promos = yield models_1.Promo.findAll({
            include: includeCustomers ? [{
                    model: models_1.Customer,
                    as: 'eligibleCustomers',
                    attributes: ['id', 'firstName', 'lastName'],
                    through: {
                        attributes: ['isUsed', 'usedAt'], // Include usage status
                        as: 'promoAssignment'
                    }
                }] : [],
            order: [['createdAt', 'DESC']] // Add ordering for consistent results
        });
        res.status(200).json({ success: true, count: promos.length, data: promos });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching promos', error: error.message });
    }
});
exports.getAllPromos = getAllPromos;
const getPromoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const promo = yield models_1.Promo.findByPk(id, { include: [{ model: models_1.Customer, as: 'eligibleCustomers', attributes: ['id', 'firstName', 'lastName'] }] });
        if (!promo) {
            return res.status(404).json({ success: false, message: `Promo with ID ${id} not found` });
        }
        res.status(200).json({ success: true, data: promo });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching promo', error: error.message });
    }
});
exports.getPromoById = getPromoById;
// Hanya Super Admin
const updatePromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const promo = yield models_1.Promo.findByPk(id);
        if (!promo) {
            return res.status(404).json({ success: false, message: `Promo with ID ${id} not found` });
        }
        yield promo.update(req.body);
        res.status(200).json({ success: true, message: 'Promo updated successfully', data: promo });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error updating promo', error: error.message });
    }
});
exports.updatePromo = updatePromo;
// Hanya Super Admin
const deletePromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const promo = yield models_1.Promo.findByPk(id);
        if (!promo) {
            return res.status(404).json({ success: false, message: `Promo with ID ${id} not found` });
        }
        // Pertimbangkan apa yang terjadi pada CustomerPromo jika promo dihapus (cascade atau set null)
        yield models_1.CustomerPromo.destroy({ where: { promoId: id } }); // Hapus dulu assignmentnya
        yield promo.destroy();
        res.status(200).json({ success: true, message: 'Promo deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting promo', error: error.message });
    }
});
exports.deletePromo = deletePromo;
// Admin & Super Admin
const assignPromoToCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, promoId } = req.body;
        const assignedBy = req.user.id; // Jika ingin mencatat siapa yang assign
        if (!customerId || !promoId) {
            return res.status(400).json({ success: false, message: 'Customer ID and Promo ID are required' });
        }
        const customer = yield models_1.Customer.findByPk(customerId);
        const promo = yield models_1.Promo.findByPk(promoId);
        if (!customer)
            return res.status(404).json({ success: false, message: 'Customer not found' });
        if (!promo)
            return res.status(404).json({ success: false, message: 'Promo not found' });
        const existingAssignment = yield models_1.CustomerPromo.findOne({ where: { customerId, promoId } });
        if (existingAssignment) {
            return res.status(400).json({ success: false, message: 'Promo already assigned to this customer' });
        }
        const assignment = yield models_1.CustomerPromo.create({
            customerId,
            promoId,
            assignedBy
        });
        res.status(201).json({ success: true, message: 'Promo assigned to customer successfully', data: assignment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error assigning promo to customer', error: error.message });
    }
});
exports.assignPromoToCustomer = assignPromoToCustomer;
// Admin & Super Admin
const removePromoFromCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, promoId } = req.body; // atau dari req.params jika URLnya /promos/assign/:customerId/:promoId
        if (!customerId || !promoId) {
            return res.status(400).json({ success: false, message: 'Customer ID and Promo ID are required' });
        }
        const result = yield models_1.CustomerPromo.destroy({ where: { customerId, promoId } });
        if (result === 0) {
            return res.status(404).json({ success: false, message: 'Promo assignment not found for this customer' });
        }
        res.status(200).json({ success: true, message: 'Promo removed from customer successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error removing promo from customer', error: error.message });
    }
});
exports.removePromoFromCustomer = removePromoFromCustomer;
// Untuk UI Pembelian
const getAvailablePromosForCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        const customer = yield models_1.Customer.findByPk(customerId, {
            include: [{
                    model: models_1.Promo,
                    as: 'availablePromos',
                    through: {
                        attributes: [],
                        where: { isUsed: false } // Only include unused promos
                    },
                    where: {
                        isActive: true,
                        [sequelize_1.Op.or]: [
                            { startDate: null, endDate: null },
                            { startDate: { [sequelize_1.Op.lte]: new Date() }, endDate: null },
                            { startDate: null, endDate: { [sequelize_1.Op.gte]: new Date() } },
                            { startDate: { [sequelize_1.Op.lte]: new Date() }, endDate: { [sequelize_1.Op.gte]: new Date() } }
                        ]
                    }
                }]
        });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, data: customer.availablePromos || [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching available promos for customer', error: error.message });
    }
});
exports.getAvailablePromosForCustomer = getAvailablePromosForCustomer;
//# sourceMappingURL=promo.controller.js.map
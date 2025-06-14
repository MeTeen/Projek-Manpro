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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerWithPurchases = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getAllCustomers = void 0;
const models_1 = require("../models");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const supabase_storage_service_1 = __importDefault(require("../services/supabase-storage.service"));
const sequelize_1 = require("sequelize");
/**
 * Get all customers with pagination and filtering
 * @route GET /api/customers
 */
const getAllCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const search = req.query.search;
        // Build where clause for search
        const whereClause = {};
        if (search) {
            whereClause[sequelize_1.Op.or] = [
                { firstName: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { lastName: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { email: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ];
        }
        const { count, rows: customers } = yield models_1.Customer.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'totalSpent', 'purchaseCount', 'avatarUrl', 'createdAt']
        });
        res.status(200).json({
            success: true,
            data: customers,
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
            message: 'Error fetching customers',
            error: error.message,
        });
    }
});
exports.getAllCustomers = getAllCustomers;
/**
 * Get a single customer by ID
 * @route GET /api/customers/:id
 */
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const customer = yield models_1.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${id} not found`,
            });
        }
        res.status(200).json({
            success: true,
            data: customer,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer',
            error: error.message,
        });
    }
});
exports.getCustomerById = getCustomerById;
/**
 * Create a new customer
 * @route POST /api/customers
 */
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, phone, address, city, state, zipCode } = req.body;
        // Validate request
        if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required except avatar, totalSpent, and purchaseCount',
            });
        }
        // Check if customer with email already exists
        const existingCustomer = yield models_1.Customer.findOne({ where: { email } });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: `Customer with email ${email} already exists`,
            });
        }
        // Handle avatar upload to Supabase
        let avatarUrl = null;
        if (req.file) {
            try {
                const fileName = supabase_storage_service_1.default.generateAvatarFileName(req.file.originalname);
                const uploadResult = yield supabase_storage_service_1.default.uploadFile(req.file.buffer, fileName, req.file.mimetype);
                avatarUrl = uploadResult.publicUrl;
            }
            catch (uploadError) {
                console.error('Avatar upload failed:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload avatar',
                    error: uploadError.message,
                });
            }
        }
        // Create customer with default values for totalSpent and purchaseCount
        const customer = yield models_1.Customer.create({
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            avatarUrl,
            totalSpent: 0,
            purchaseCount: 0
        });
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer,
        });
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating customer',
            error: error.message,
        });
    }
});
exports.createCustomer = createCustomer;
/**
 * Update a customer
 * @route PUT /api/customers/:id
 */
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, address, city, state, zipCode, totalSpent, purchaseCount } = req.body;
        // Find customer
        const customer = yield models_1.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${id} not found`,
            });
        }
        // Check if updating email to one that already exists (except current customer)
        if (email && email !== customer.email) {
            const existingCustomer = yield models_1.Customer.findOne({ where: { email } });
            if (existingCustomer && existingCustomer.id !== customer.id) {
                return res.status(400).json({
                    success: false,
                    message: `Customer with email ${email} already exists`,
                });
            }
        }
        // Handle avatar upload to Supabase
        let avatarUrl = customer.avatarUrl; // Keep existing avatar by default
        if (req.file) {
            try {
                // Delete old avatar if it exists and is a Supabase URL
                if (customer.avatarUrl && (0, upload_middleware_1.isSupabaseUrl)(customer.avatarUrl)) {
                    const oldFileName = supabase_storage_service_1.default.extractFileNameFromUrl(customer.avatarUrl);
                    if (oldFileName) {
                        try {
                            yield supabase_storage_service_1.default.deleteFile(oldFileName);
                        }
                        catch (deleteError) {
                            console.warn('Failed to delete old avatar:', deleteError);
                            // Continue with upload even if deletion fails
                        }
                    }
                }
                // Upload new avatar
                const fileName = supabase_storage_service_1.default.generateAvatarFileName(req.file.originalname, id);
                const uploadResult = yield supabase_storage_service_1.default.uploadFile(req.file.buffer, fileName, req.file.mimetype);
                avatarUrl = uploadResult.publicUrl;
            }
            catch (uploadError) {
                console.error('Avatar upload failed:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload avatar',
                    error: uploadError.message,
                });
            }
        }
        // Update customer
        yield customer.update({
            firstName: firstName || customer.firstName,
            lastName: lastName || customer.lastName,
            email: email || customer.email,
            phone: phone || customer.phone,
            address: address || customer.address,
            city: city || customer.city,
            state: state || customer.state,
            zipCode: zipCode || customer.zipCode,
            avatarUrl,
            totalSpent: totalSpent !== undefined ? totalSpent : customer.totalSpent,
            purchaseCount: purchaseCount !== undefined ? purchaseCount : customer.purchaseCount
        });
        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating customer',
            error: error.message,
        });
    }
});
exports.updateCustomer = updateCustomer;
/**
 * Delete a customer
 * @route DELETE /api/customers/:id
 */
const deleteCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find customer
        const customer = yield models_1.Customer.findByPk(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${id} not found`,
            });
        }
        // Delete customer
        yield customer.destroy();
        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting customer',
            error: error.message,
        });
    }
});
exports.deleteCustomer = deleteCustomer;
/**
 * Get customer with purchase history and products
 * @route GET /api/customers/:id/purchases
 */
const getCustomerWithPurchases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params; // Find customer with eager loading of products
        const customer = yield models_1.Customer.findByPk(id, {
            include: [{
                    model: models_1.Product,
                    through: {
                        attributes: ['quantity', 'purchaseDate', 'price', 'promoId', 'discountAmount']
                    },
                    as: 'Products' // Use capital P to match the association alias
                }]
        });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${id} not found`,
            });
        }
        // Use type assertion to handle the products association
        const customerWithProducts = customer;
        // Format the response data
        const formattedData = {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
            avatarUrl: customer.avatarUrl,
            totalSpent: customer.totalSpent,
            purchaseCount: customer.purchaseCount,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            purchases: customerWithProducts.Products || []
        };
        res.status(200).json({
            success: true,
            data: formattedData,
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
exports.getCustomerWithPurchases = getCustomerWithPurchases;
//# sourceMappingURL=customer.controller.js.map
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
exports.getCustomerProfile = exports.changePassword = exports.customerLogin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
/**
 * Customer login (customers cannot signup themselves)
 * @route POST /api/customer/auth/login
 */
const customerLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }
        // Find customer by email
        const customer = yield models_1.Customer.findOne({
            where: { email },
        });
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        // Check if password matches
        const isPasswordValid = yield bcryptjs_1.default.compare(password, customer.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        } // Check if this is first login (password equals phone number)
        const isFirstLogin = yield bcryptjs_1.default.compare(customer.phone, customer.password);
        if (isFirstLogin) {
            return res.status(200).json({
                success: true,
                message: 'First login detected. Password change required.',
                requirePasswordChange: true,
                customerId: customer.id,
            });
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            id: customer.id,
            email: customer.email,
            role: 'customer',
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            customer: {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message,
        });
    }
});
exports.customerLogin = customerLogin;
/**
 * Customer password change (for first login)
 * @route POST /api/customer/auth/change-password
 */
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, currentPassword, newPassword } = req.body;
        if (!customerId || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Customer ID, current password, and new password are required',
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long',
            });
        }
        // Find customer
        const customer = yield models_1.Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }
        // Verify current password
        const isCurrentPasswordValid = yield bcryptjs_1.default.compare(currentPassword, customer.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }
        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, saltRounds);
        // Update password
        yield customer.update({ password: hashedNewPassword });
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            id: customer.id,
            email: customer.email,
            role: 'customer',
        });
        res.status(200).json({
            success: true, message: 'Password changed successfully',
            token,
            customer: {
                id: customer.id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message,
        });
    }
});
exports.changePassword = changePassword;
/**
 * Get customer profile
 * @route GET /api/customer/auth/profile
 */
const getCustomerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }
        const customer = yield models_1.Customer.findByPk(customerId, {
            attributes: { exclude: ['password'] },
        });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
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
            message: 'Error fetching profile',
            error: error.message,
        });
    }
});
exports.getCustomerProfile = getCustomerProfile;
//# sourceMappingURL=customerAuth.controller.js.map
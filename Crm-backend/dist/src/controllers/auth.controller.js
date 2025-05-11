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
exports.getProfile = exports.login = exports.signup = void 0;
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
const sequelize_1 = require("sequelize");
/**
 * Register a new admin user
 * @route POST /api/auth/signup
 */
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, role } = req.body;
        // Validate request
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required',
            });
        }
        // Check if username or email already exists
        const existingUser = yield models_1.Admin.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { username },
                    { email }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists',
            });
        }
        // Create new admin with type casting to avoid TS issues
        const admin = yield models_1.Admin.create({
            username,
            email,
            password,
            role: role || 'admin',
        });
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
        });
        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                token,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering admin',
            error: error.message,
        });
    }
});
exports.signup = signup;
/**
 * Login an admin user
 * @route POST /api/auth/login
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate request
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }
        // Find admin by email
        const admin = yield models_1.Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        // Validate password
        const isPasswordValid = yield admin.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                token,
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
exports.login = login;
/**
 * Get current admin user profile
 * @route GET /api/auth/profile
 */
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // req.user is set by the authenticateJWT middleware
        res.status(200).json({
            success: true,
            data: req.user,
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
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map
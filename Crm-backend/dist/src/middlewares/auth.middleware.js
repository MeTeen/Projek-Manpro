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
exports.authenticateCustomer = exports.isSuperAdmin = exports.isAdmin = exports.authenticateJWT = void 0;
const jwt_1 = require("../utils/jwt");
const models_1 = require("../models");
/**
 * Middleware to authenticate users via JWT token
 */
const authenticateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔐 authenticateJWT middleware called for:', req.method, req.path);
        console.log('🔐 Headers authorization:', req.headers.authorization ? 'Present' : 'Missing');
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (!token) {
            console.log('🔐 No token provided');
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: No token provided'
            });
        }
        console.log('🔐 Token found, verifying...');
        // Verify the token
        // Pastikan verifyToken mengembalikan payload yang sesuai dengan AuthenticatedUser atau setidaknya memiliki 'id'
        const decoded = (0, jwt_1.verifyToken)(token); // Type assertion jika perlu
        if (!decoded || !decoded.id) { // Periksa juga keberadaan decoded.id
            console.log('🔐 Invalid token or missing ID');
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: Invalid token'
            });
        }
        console.log('🔐 Token decoded, user ID:', decoded.id);
        // Find user in database
        const admin = yield models_1.Admin.findByPk(decoded.id);
        if (!admin) {
            console.log('🔐 User not found in database for ID:', decoded.id);
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: User not found'
            });
        }
        console.log('🔐 User found:', admin.email, 'Role:', admin.role); // Attach user to request
        req.user = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            // Pastikan admin.role adalah tipe yang kompatibel dengan AuthenticatedUser['role']
            role: admin.role
        };
        console.log('🔐 Authentication successful, proceeding to next middleware');
        next();
    }
    catch (error) {
        console.log('🔐 Authentication error caught:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
});
exports.authenticateJWT = authenticateJWT;
/**
 * Middleware to ensure user has admin role (allows admin or super_admin)
 */
const isAdmin = (req, res, next) => {
    if (!req.user) { // req.user sekarang bertipe AuthenticatedUser | undefined
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    // req.user.role akan memiliki tipe 'admin' | 'super_admin'
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};
exports.isAdmin = isAdmin;
/**
 * Middleware to ensure user has super_admin role
 */
const isSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Super admin access required'
        });
    }
    next();
};
exports.isSuperAdmin = isSuperAdmin;
/**
 * Middleware to authenticate customers via JWT token
 */
const authenticateCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: No token provided'
            });
        }
        // Verify the token
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded || !decoded.id || decoded.role !== 'customer') {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: Invalid token'
            });
        }
        // Find customer in database
        const customer = yield models_1.Customer.findByPk(decoded.id);
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed: Customer not found'
            });
        }
        // Attach customer to request
        req.user = {
            id: customer.id,
            email: customer.email,
            role: 'customer'
        };
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
});
exports.authenticateCustomer = authenticateCustomer;
//# sourceMappingURL=auth.middleware.js.map
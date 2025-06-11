import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { Admin, Customer } from '../models';

// Definisikan interface untuk payload pengguna yang diautentikasi
interface AuthenticatedUser {
  id: number;
  username?: string;
  email: string;
  role: 'admin' | 'super_admin' | 'customer';
}

// Augment Express Request interface untuk menyertakan informasi pengguna
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser; // Gunakan tipe yang lebih spesifik di sini
    }
  }
}

/**
 * Middleware to authenticate users via JWT token
 */
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔐 authenticateJWT middleware called for:', req.method, req.path);
    console.log('🔐 Headers authorization:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      console.log('🔐 No token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided'
      });
    }    console.log('🔐 Token found, verifying...');
    // Verify the token
    // Pastikan verifyToken mengembalikan payload yang sesuai dengan AuthenticatedUser atau setidaknya memiliki 'id'
    const decoded = verifyToken(token) as { id: number; [key: string]: any }; // Type assertion jika perlu

    if (!decoded || !decoded.id) { // Periksa juga keberadaan decoded.id
      console.log('🔐 Invalid token or missing ID');
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token'
      });
    }

    console.log('🔐 Token decoded, user ID:', decoded.id);
    // Find user in database
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      console.log('🔐 User not found in database for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User not found'
      });
    }

    console.log('🔐 User found:', admin.email, 'Role:', admin.role);    // Attach user to request
    req.user = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      // Pastikan admin.role adalah tipe yang kompatibel dengan AuthenticatedUser['role']
      role: admin.role as 'admin' | 'super_admin'
    };

    console.log('🔐 Authentication successful, proceeding to next middleware');
    next();
  } catch (error) {
    console.log('🔐 Authentication error caught:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: (error as Error).message
    });
  }
};

/**
 * Middleware to ensure user has admin role (allows admin or super_admin)
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Middleware to ensure user has super_admin role
 */
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Middleware to authenticate customers via JWT token
 */
export const authenticateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided'
      });
    }

    // Verify the token
    const decoded = verifyToken(token) as { id: number; role: string; [key: string]: any };

    if (!decoded || !decoded.id || decoded.role !== 'customer') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token'
      });
    }

    // Find customer in database
    const customer = await Customer.findByPk(decoded.id);

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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: (error as Error).message
    });
  }
};
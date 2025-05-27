import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { Admin } from '../models';

// Definisikan interface untuk payload pengguna yang diautentikasi
interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'super_admin'; // Sesuaikan jika ada peran lain
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
    // Pastikan verifyToken mengembalikan payload yang sesuai dengan AuthenticatedUser atau setidaknya memiliki 'id'
    const decoded = verifyToken(token) as { id: number; [key: string]: any }; // Type assertion jika perlu

    if (!decoded || !decoded.id) { // Periksa juga keberadaan decoded.id
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token'
      });
    }

    // Find user in database
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User not found'
      });
    }

    // Attach user to request
    req.user = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      // Pastikan admin.role adalah tipe yang kompatibel dengan AuthenticatedUser['role']
      role: admin.role as 'admin' | 'super_admin'
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
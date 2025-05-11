import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
import { Admin } from '../models';

// Augment Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: any;
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
    const decoded = verifyToken(token);
    
    if (!decoded) {
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
      role: admin.role
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
 * Middleware to ensure user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

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
import { Request, Response } from 'express';
import { Admin } from '../models';
import { generateToken } from '../utils/jwt';
import { Op } from 'sequelize';

/**
 * Register a new admin user
 * @route POST /api/auth/signup
 */


export const signup = async (req: Request, res: Response) => {
  console.log('📥 SIGNUP BODY:', req.body);

  try {
    const { username, email, password, role } = req.body;

    if (!['admin', 'super_admin', 'customer'].includes(role)) {
  return res.status(400).json({
    success: false,
    message: 'Invalid role',
  });
}


    // Validate request
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    // Check if username or email already exists
    const existingUser = await Admin.findOne({ 
      where: { 
        [Op.or]: [
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
    const admin = await Admin.create({
      username,
      email,
      password,
      role: role || 'admin',
    } as any);

    // Generate JWT token
    const token = generateToken({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering admin',
      error: (error as Error).message,
    });
  }
};

/**
 * Login an admin user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username and password are required',
      });
    }

    // Find admin by email OR username
    const admin = await Admin.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          { username: email } // Using 'email' field to also check username
        ]
      } 
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
      });
    }

    // Validate password
    const isPasswordValid = await admin.validatePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: (error as Error).message,
    });
  }
};

/**
 * Get current admin user profile
 * @route GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user is set by the authenticateJWT middleware
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: (error as Error).message,
    });
  }
}; 
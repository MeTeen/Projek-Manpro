import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Customer } from '../models';
import { generateToken } from '../utils/jwt';

/**
 * Customer login (customers cannot signup themselves)
 * @route POST /api/customer/auth/login
 */
export const customerLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({
      where: { email },
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }    // Check if this is first login (password equals phone number)
    const isFirstLogin = await bcrypt.compare(customer.phone, customer.password);
    if (isFirstLogin) {
      return res.status(200).json({
        success: true,
        message: 'First login detected. Password change required.',
        requirePasswordChange: true,
        customerId: customer.id,
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: customer.id,
      email: customer.email,
      role: 'customer',
    });    res.status(200).json({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: (error as Error).message,
    });
  }
};

/**
 * Customer password change (for first login)
 * @route POST /api/customer/auth/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
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
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await customer.update({ password: hashedNewPassword });

    // Generate JWT token
    const token = generateToken({
      id: customer.id,
      email: customer.email,
      role: 'customer',
    });

    res.status(200).json({
      success: true,      message: 'Password changed successfully',
      token,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: (error as Error).message,
    });
  }
};

/**
 * Get customer profile
 * @route GET /api/customer/auth/profile
 */
export const getCustomerProfile = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const customer = await Customer.findByPk(customerId, {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: (error as Error).message,
    });
  }
};

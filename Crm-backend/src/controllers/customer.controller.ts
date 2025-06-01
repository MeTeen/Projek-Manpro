import { Request, Response } from 'express';
import { Customer, Product, CustomerProduct } from '../models';
import { CustomerInput } from '../models/customer.model';
import { getAvatarUrl } from '../middlewares/upload.middleware';
import { Op } from 'sequelize';

/**
 * Get all customers with pagination and filtering
 * @route GET /api/customers
 */
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    // Build where clause for search
    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'city', 'state', 'totalSpent', 'purchaseCount', 'avatarUrl', 'createdAt']
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: (error as Error).message,
    });
  }
};

/**
 * Get a single customer by ID
 * @route GET /api/customers/:id
 */
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id);
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: (error as Error).message,
    });
  }
};

/**
 * Create a new customer
 * @route POST /api/customers
 */
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { 
      firstName, 
      lastName,
      email, 
      phone, 
      address,
      city,
      state,
      zipCode
    } = req.body;
    
    // Validate request
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required except avatar, totalSpent, and purchaseCount',
      });
    }
    
    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: `Customer with email ${email} already exists`,
      });
    }
    
    // Get avatar URL from uploaded file
    const avatarUrl = req.file ? getAvatarUrl(req.file.filename) : null;
    
    // Create customer with default values for totalSpent and purchaseCount
    const customer = await Customer.create({
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
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: (error as Error).message,
    });
  }
};

/**
 * Update a customer
 * @route PUT /api/customers/:id
 */
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName,
      email, 
      phone, 
      address,
      city,
      state,
      zipCode,
      totalSpent,
      purchaseCount
    } = req.body;
    
    // Find customer
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found`,
      });
    }
    
    // Check if updating email to one that already exists (except current customer)
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ where: { email } });
      
      if (existingCustomer && existingCustomer.id !== customer.id) {
        return res.status(400).json({
          success: false,
          message: `Customer with email ${email} already exists`,
        });
      }
    }
    
    // Get avatar URL from uploaded file, or keep existing
    const avatarUrl = req.file 
      ? getAvatarUrl(req.file.filename) 
      : customer.avatarUrl;
    
    // Update customer
    await customer.update({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: (error as Error).message,
    });
  }
};

/**
 * Delete a customer
 * @route DELETE /api/customers/:id
 */
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find customer
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found`,
      });
    }
    
    // Delete customer
    await customer.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: (error as Error).message,
    });
  }
};

/**
 * Get customer with purchase history and products
 * @route GET /api/customers/:id/purchases
 */
export const getCustomerWithPurchases = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find customer with eager loading of products
    const customer = await Customer.findByPk(id, {
      include: [{
        model: Product,
        through: {
          attributes: ['quantity', 'purchaseDate']
        },
        as: 'products'
      }]
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${id} not found`,
      });
    }
    
    // Use type assertion to handle the products association
    const customerWithProducts = customer as any;
    
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
      purchases: customerWithProducts.products || []
    };
    
    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer purchases',
      error: (error as Error).message,
    });
  }
}; 
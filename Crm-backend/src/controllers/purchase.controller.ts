import { Request, Response } from 'express';
import { sequelize, Customer, Product, CustomerProduct } from '../models';
import { Transaction, Op } from 'sequelize';

// Create a purchase (add a product to a customer's purchases)
export const createPurchase = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { customerId, productId, quantity = 1 } = req.body;
    
    // Extra logging to help debug
    console.log('Purchase request received:', req.body);
    
    // Validate input - ensure they are valid numbers
    const customerIdNum = parseInt(customerId, 10);
    const productIdNum = parseInt(productId, 10);
    const quantityNum = parseInt(quantity, 10);
    
    if (isNaN(customerIdNum) || customerIdNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid Customer ID: must be a positive number'
      });
    }
    
    if (isNaN(productIdNum) || productIdNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID: must be a positive number'
      });
    }
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity: must be a positive number'
      });
    }
    
    // Find the customer and product
    const customer = await Customer.findByPk(customerIdNum);
    const product = await Product.findByPk(productIdNum);
    
    if (!customer) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${customerIdNum} not found`
      });
    }
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productIdNum} not found`
      });
    }
    
    // Check if we have enough stock
    if (product.stock < quantityNum) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Not enough stock available. Requested: ${quantityNum}, Available: ${product.stock}`
      });
    }
    
    // Safely get the product price
    let productPrice = 0;
    try {
      productPrice = parseFloat(product.price?.toString() || '0');
      if (isNaN(productPrice)) productPrice = 0;
    } catch (e) {
      console.warn('Error parsing product price:', e);
      productPrice = 0;
    }
    
    // Calculate the total for this purchase
    const purchaseTotal = productPrice * quantityNum;
    
    // Create the purchase record with price - with explicit field values
    try {
      const purchase = await CustomerProduct.create({
        customerId: customerIdNum,
        productId: productIdNum,
        quantity: quantityNum,
        price: productPrice,
        purchaseDate: new Date()
      }, { transaction: t });
      
      console.log('Purchase record created:', purchase);
      
      // Update product stock
      await product.update({
        stock: Math.max(0, product.stock - quantityNum)
      }, { transaction: t });
      
      // Safely update customer's totalSpent and purchaseCount
      let currentTotalSpent = 0;
      let currentPurchaseCount = 0;
      
      try {
        if (customer.totalSpent !== null && customer.totalSpent !== undefined) {
          currentTotalSpent = parseFloat(customer.totalSpent.toString());
          if (isNaN(currentTotalSpent)) currentTotalSpent = 0;
        }
        
        if (customer.purchaseCount !== null && customer.purchaseCount !== undefined) {
          currentPurchaseCount = parseInt(customer.purchaseCount.toString(), 10);
          if (isNaN(currentPurchaseCount)) currentPurchaseCount = 0;
        }
      } catch (e) {
        console.warn('Error parsing customer stats:', e);
      }
      
      await customer.update({
        totalSpent: currentTotalSpent + purchaseTotal,
        purchaseCount: currentPurchaseCount + 1
      }, { transaction: t });
      
      await t.commit();
      
      return res.status(201).json({
        success: true,
        message: 'Purchase completed successfully',
        data: {
          purchase,
          customer: {
            id: customer.id,
            totalSpent: currentTotalSpent + purchaseTotal,
            purchaseCount: currentPurchaseCount + 1
          },
          product: {
            id: product.id,
            name: product.name,
            stock: product.stock - quantityNum
          }
        }
      });
    } catch (createError) {
      await t.rollback();
      console.error('Error creating purchase record:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create purchase record',
        error: (createError as Error).message
      });
    }
  } catch (error) {
    try {
      await t.rollback();
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    console.error('Error creating purchase:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create purchase',
      error: (error as Error).message
    });
  }
};

// Get all purchases
export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await CustomerProduct.findAll({
      include: [
        { model: Customer, as: 'customer' },
        { model: Product, as: 'product' }
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: (error as Error).message
    });
  }
};

// Get purchases for a specific customer
export const getCustomerPurchases = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findByPk(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const purchases = await CustomerProduct.findAll({
      where: { customerId },
      include: [{ model: Product, as: 'product' }]
    });
    
    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: {
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          totalSpent: customer.totalSpent,
          purchaseCount: customer.purchaseCount
        },
        purchases
      }
    });
  } catch (error) {
    console.error('Error fetching customer purchases:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer purchases',
      error: (error as Error).message
    });
  }
};

// Get purchase history for a specific product
export const getProductPurchaseHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const purchases = await CustomerProduct.findAll({
      where: { productId },
      include: [{ model: Customer, as: 'customer' }]
    });
    
    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock
        },
        purchases
      }
    });
  } catch (error) {
    console.error('Error fetching product purchase history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product purchase history',
      error: (error as Error).message
    });
  }
};

// Add product to customer from dropdown selection
export const addProductToCustomer = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { customerId, productId, quantity = 1 } = req.body;
    
    // Validate input - convert to numbers
    const customerIdNum = parseInt(customerId.toString(), 10);
    const productIdNum = parseInt(productId.toString(), 10);
    const quantityNum = parseInt(quantity.toString(), 10);
    
    if (isNaN(customerIdNum) || customerIdNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid Customer ID: must be a positive number'
      });
    }
    
    if (isNaN(productIdNum) || productIdNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID: must be a positive number'
      });
    }
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity: must be a positive number'
      });
    }
    
    // Find the customer and product
    const customer = await Customer.findByPk(customerIdNum);
    const product = await Product.findByPk(productIdNum);
    
    if (!customer) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${customerIdNum} not found`
      });
    }
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productIdNum} not found`
      });
    }
    
    // Check if we have enough stock
    if (product.stock < quantityNum) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Not enough stock available. Requested: ${quantityNum}, Available: ${product.stock}`
      });
    }
    
    // Safely get the product price
    let productPrice = 0;
    try {
      productPrice = parseFloat(product.price?.toString() || '0');
      if (isNaN(productPrice)) productPrice = 0;
    } catch (e) {
      console.warn('Error parsing product price:', e);
      productPrice = 0;
    }
    
    const purchaseTotal = productPrice * quantityNum;
    
    // IMPORTANT CHANGE: Always create a new purchase record
    // This allows multiple purchases of the same product by the same customer
    const purchase = await CustomerProduct.create({
      customerId: customerIdNum,
      productId: productIdNum,
      quantity: quantityNum,
      price: productPrice,
      purchaseDate: new Date()
    }, { transaction: t });
    
    console.log('New purchase record created:', purchase);
    
    // Update product stock
    const newStock = Math.max(0, product.stock - quantityNum);
    await product.update({
      stock: newStock
    }, { transaction: t });
    
    // Safely update customer's totalSpent and purchaseCount
    let currentTotalSpent = 0;
    let currentPurchaseCount = 0;
    
    try {
      if (customer.totalSpent !== null && customer.totalSpent !== undefined) {
        currentTotalSpent = parseFloat(customer.totalSpent.toString());
        if (isNaN(currentTotalSpent)) currentTotalSpent = 0;
      }
      
      if (customer.purchaseCount !== null && customer.purchaseCount !== undefined) {
        currentPurchaseCount = parseInt(customer.purchaseCount.toString(), 10);
        if (isNaN(currentPurchaseCount)) currentPurchaseCount = 0;
      }
    } catch (e) {
      console.warn('Error parsing customer stats:', e);
    }
    
    await customer.update({
      totalSpent: currentTotalSpent + purchaseTotal,
      purchaseCount: currentPurchaseCount + 1
    }, { transaction: t });
    
    await t.commit();
    
    return res.status(201).json({
      success: true,
      message: 'Product added to customer successfully',
      data: {
        purchase,
        customer: {
          id: customer.id,
          totalSpent: currentTotalSpent + purchaseTotal,
          purchaseCount: currentPurchaseCount + 1
        },
        product: {
          id: product.id,
          name: product.name,
          stock: newStock
        }
      }
    });
  } catch (error) {
    try {
      await t.rollback();
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    console.error('Error adding product to customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to customer',
      error: (error as Error).message
    });
  }
};

// Direct SQL creation (fallback method for frontend)
export const createPurchaseDirectSql = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { customer_id, product_id, quantity = 1, price } = req.body;
    
    // Log request for debugging
    console.log('DirectSQL purchase request received:', req.body);
    
    // Validate all required fields are present and valid
    if (!customer_id || !product_id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer_id and product_id are required'
      });
    }
    
    // Ensure that all inputs are proper numbers
    const customerIdNum = parseInt(customer_id.toString(), 10);
    const productIdNum = parseInt(product_id.toString(), 10);
    const quantityNum = parseInt(quantity.toString(), 10);
    
    // Price can be 0, but must be a valid number
    let productPrice = 0;
    if (price !== undefined) {
      try {
        productPrice = parseFloat(price.toString());
        if (isNaN(productPrice)) productPrice = 0;
      } catch (e) {
        productPrice = 0;
      }
    }
    
    // Basic validation
    if (isNaN(customerIdNum) || customerIdNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid customer_id: must be a positive number'
      });
    }
    
    if (isNaN(productIdNum) || productIdNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid product_id: must be a positive number'
      });
    }
    
    if (isNaN(quantityNum) || quantityNum <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity: must be a positive number'
      });
    }
    
    // Find the customer and product
    const customer = await Customer.findByPk(customerIdNum);
    const product = await Product.findByPk(productIdNum);
    
    if (!customer) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${customerIdNum} not found`
      });
    }
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productIdNum} not found`
      });
    }
    
    // If price wasn't provided, use the product price
    if (productPrice === 0 && product.price) {
      try {
        productPrice = parseFloat(product.price.toString());
      } catch (e) {
        console.warn('Error parsing product price:', e);
      }
    }
    
    // Create the purchase using the values with explicit field mapping
    try {
      // Create with exactly the fields and format that matches the database
      const purchase = await CustomerProduct.create({
        customerId: customerIdNum, // This will be automatically mapped to customer_id
        productId: productIdNum,   // This will be automatically mapped to product_id
        quantity: quantityNum,
        price: productPrice,
        purchaseDate: new Date()   // This will be mapped to purchase_date
      }, { transaction: t });
      
      // Update related entities
      
      // 1. Update product stock
      const newStock = Math.max(0, product.stock - quantityNum);
      await product.update({ stock: newStock }, { transaction: t });
      
      // 2. Update customer totals
      let currentTotalSpent = 0;
      let currentPurchaseCount = 0;
      
      if (customer.totalSpent !== null && customer.totalSpent !== undefined) {
        currentTotalSpent = parseFloat(customer.totalSpent.toString() || '0');
        if (isNaN(currentTotalSpent)) currentTotalSpent = 0;
      }
      
      if (customer.purchaseCount !== null && customer.purchaseCount !== undefined) {
        currentPurchaseCount = parseInt(customer.purchaseCount.toString() || '0', 10);
        if (isNaN(currentPurchaseCount)) currentPurchaseCount = 0;
      }
      
      const purchaseTotal = productPrice * quantityNum;
      
      await customer.update({
        totalSpent: currentTotalSpent + purchaseTotal,
        purchaseCount: currentPurchaseCount + 1
      }, { transaction: t });
      
      // Commit the transaction
      await t.commit();
      
      return res.status(201).json({
        success: true,
        message: 'Purchase created successfully via direct SQL method',
        data: {
          purchase,
          customer: {
            id: customer.id,
            totalSpent: currentTotalSpent + purchaseTotal,
            purchaseCount: currentPurchaseCount + 1
          },
          product: {
            id: product.id,
            name: product.name,
            stock: newStock
          }
        }
      });
    } catch (createError) {
      await t.rollback();
      console.error('Error in direct SQL purchase creation:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create purchase record',
        error: (createError as Error).message
      });
    }
  } catch (error) {
    try {
      await t.rollback();
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    console.error('Error in direct SQL purchase creation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create purchase',
      error: (error as Error).message
    });
  }
};
import { Request, Response } from 'express';
import { Product } from '../models';
import { ProductAttributes } from '../models/product.model';

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log('Creating product with data:', JSON.stringify(req.body));
    const { name, stock, price, dimensions } = req.body;

    // Validate input
    if (!name) {
      console.log('Validation failed: Product name is missing');
      return res.status(400).json({ 
        success: false, 
        message: 'Product name is required' 
      });
    }

    // Remove any timestamp fields if they were accidentally included
    const productData = {
      name,
      stock: stock !== undefined ? Number(stock) : 0,
      price: price !== undefined ? Number(price) : 0,
      dimensions: dimensions || ''
    };

    console.log('Cleaned product data:', productData);
    console.log('Attempting to create product in database');
    
    // Create the product
    try {
      const product = await Product.create(productData);

      console.log('Product created successfully:', product.id);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (dbError) {
      console.error('Database error creating product:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error while creating product',
        error: (dbError as Error).message
      });
    }
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: (error as Error).message
    });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: (error as Error).message
    });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: (error as Error).message
    });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, stock, price, dimensions } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update the product
    await product.update({
      name: name || product.name,
      stock: stock !== undefined ? stock : product.get('stock'),
      price: price !== undefined ? price : product.get('price'),
      dimensions: dimensions || product.get('dimensions')
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: (error as Error).message
    });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: (error as Error).message
    });
  }
};

// Get products for dropdown selection
export const getProductsForDropdown = async (req: Request, res: Response) => {
  try {
    // Get just the essential fields needed for a dropdown
    const products = await Product.findAll({
      attributes: ['id', 'name', 'price', 'stock']
    });
    
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products for dropdown:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products for dropdown',
      error: (error as Error).message
    });
  }
}; 
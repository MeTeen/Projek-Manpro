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
exports.getProductsForDropdown = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const models_1 = require("../models");
// Create a new product
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const product = yield models_1.Product.create(productData);
            console.log('Product created successfully:', product.id);
            return res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        }
        catch (dbError) {
            console.error('Database error creating product:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database error while creating product',
                error: dbError.message
            });
        }
    }
    catch (error) {
        console.error('Unexpected error creating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});
exports.createProduct = createProduct;
// Get all products
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield models_1.Product.findAll();
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});
exports.getAllProducts = getAllProducts;
// Get a single product by ID
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield models_1.Product.findByPk(id);
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
    }
    catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
});
exports.getProductById = getProductById;
// Update a product
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, stock, price, dimensions } = req.body;
        const product = yield models_1.Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        // Update the product
        yield product.update({
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
    }
    catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});
exports.updateProduct = updateProduct;
// Delete a product
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield models_1.Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        yield product.destroy();
        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});
exports.deleteProduct = deleteProduct;
// Get products for dropdown selection
const getProductsForDropdown = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get just the essential fields needed for a dropdown
        const products = yield models_1.Product.findAll({
            attributes: ['id', 'name', 'price', 'stock']
        });
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        console.error('Error fetching products for dropdown:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch products for dropdown',
            error: error.message
        });
    }
});
exports.getProductsForDropdown = getProductsForDropdown;
//# sourceMappingURL=product.controller.js.map
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
exports.addProductToCustomer = exports.getProductPurchaseHistory = exports.getCustomerPurchases = exports.getAllPurchases = exports.createPurchase = void 0;
const models_1 = require("../models");
// Create a purchase (add a product to a customer's purchases)
const createPurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield models_1.sequelize.transaction();
    try {
        const { customerId, productId, quantity = 1 } = req.body;
        // Validate input
        if (!customerId || !productId) {
            yield t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Customer ID and Product ID are required'
            });
        }
        // Find the customer and product
        const customer = yield models_1.Customer.findByPk(customerId);
        const product = yield models_1.Product.findByPk(productId);
        if (!customer) {
            yield t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        if (!product) {
            yield t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        // Check if we have enough stock
        if (product.stock < quantity) {
            yield t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Not enough stock available'
            });
        }
        // Get the product price
        const productPrice = parseFloat(product.price.toString());
        // Calculate the total for this purchase
        const purchaseTotal = productPrice * quantity;
        // Create the purchase record with price
        const purchase = yield models_1.CustomerProduct.create({
            customerId,
            productId,
            quantity,
            price: productPrice, // Store the price from the product
            purchaseDate: new Date()
        }, { transaction: t });
        // Update product stock
        yield product.update({
            stock: product.stock - quantity
        }, { transaction: t });
        // Update customer's totalSpent and purchaseCount
        yield customer.update({
            totalSpent: parseFloat(customer.totalSpent.toString()) + purchaseTotal,
            purchaseCount: customer.purchaseCount + 1
        }, { transaction: t });
        yield t.commit();
        return res.status(201).json({
            success: true,
            message: 'Purchase completed successfully',
            data: {
                purchase,
                customer: {
                    id: customer.id,
                    totalSpent: customer.totalSpent,
                    purchaseCount: customer.purchaseCount
                },
                product: {
                    id: product.id,
                    name: product.name,
                    stock: product.stock
                }
            }
        });
    }
    catch (error) {
        yield t.rollback();
        console.error('Error creating purchase:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create purchase',
            error: error.message
        });
    }
});
exports.createPurchase = createPurchase;
// Get all purchases
const getAllPurchases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const purchases = yield models_1.CustomerProduct.findAll({
            include: [
                { model: models_1.Customer, as: 'customer' },
                { model: models_1.Product, as: 'product' }
            ]
        });
        return res.status(200).json({
            success: true,
            count: purchases.length,
            data: purchases
        });
    }
    catch (error) {
        console.error('Error fetching purchases:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch purchases',
            error: error.message
        });
    }
});
exports.getAllPurchases = getAllPurchases;
// Get purchases for a specific customer
const getCustomerPurchases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        const customer = yield models_1.Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        const purchases = yield models_1.CustomerProduct.findAll({
            where: { customerId },
            include: [{ model: models_1.Product, as: 'product' }]
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
    }
    catch (error) {
        console.error('Error fetching customer purchases:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch customer purchases',
            error: error.message
        });
    }
});
exports.getCustomerPurchases = getCustomerPurchases;
// Get purchase history for a specific product
const getProductPurchaseHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const product = yield models_1.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        const purchases = yield models_1.CustomerProduct.findAll({
            where: { productId },
            include: [{ model: models_1.Customer, as: 'customer' }]
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
    }
    catch (error) {
        console.error('Error fetching product purchase history:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch product purchase history',
            error: error.message
        });
    }
});
exports.getProductPurchaseHistory = getProductPurchaseHistory;
// Add product to customer from dropdown selection
const addProductToCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield models_1.sequelize.transaction();
    try {
        const { customerId, productId, quantity = 1 } = req.body;
        // Validate input
        if (!customerId || !productId) {
            yield t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Customer ID and Product ID are required'
            });
        }
        // Find the customer and product
        const customer = yield models_1.Customer.findByPk(customerId);
        const product = yield models_1.Product.findByPk(productId);
        if (!customer) {
            yield t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        if (!product) {
            yield t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        // Check if we have enough stock
        if (product.stock < quantity) {
            yield t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Not enough stock available'
            });
        }
        // Get product price
        const productPrice = parseFloat(product.price.toString());
        // Check if the customer already has this product (to avoid duplicates if needed)
        const existingPurchase = yield models_1.CustomerProduct.findOne({
            where: { customerId, productId },
            transaction: t
        });
        let purchase;
        const purchaseTotal = productPrice * quantity;
        if (existingPurchase) {
            // Update the existing purchase with additional quantity
            const newQuantity = existingPurchase.quantity + quantity;
            purchase = yield existingPurchase.update({
                quantity: newQuantity,
                purchaseDate: new Date() // Update purchase date to now
            }, { transaction: t });
        }
        else {
            // Create a new purchase record with price
            purchase = yield models_1.CustomerProduct.create({
                customerId,
                productId,
                quantity,
                price: productPrice, // Store the price from the product
                purchaseDate: new Date()
            }, { transaction: t });
        }
        // Update product stock
        yield product.update({
            stock: product.stock - quantity
        }, { transaction: t });
        // Update customer's totalSpent and purchaseCount
        yield customer.update({
            totalSpent: parseFloat(customer.totalSpent.toString()) + purchaseTotal,
            purchaseCount: customer.purchaseCount + 1
        }, { transaction: t });
        yield t.commit();
        // Get the updated product and customer data
        const updatedCustomer = yield models_1.Customer.findByPk(customerId);
        const updatedProduct = yield models_1.Product.findByPk(productId);
        return res.status(201).json({
            success: true,
            message: 'Product added to customer successfully',
            data: {
                purchase,
                customer: updatedCustomer,
                product: updatedProduct
            }
        });
    }
    catch (error) {
        yield t.rollback();
        console.error('Error adding product to customer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to add product to customer',
            error: error.message
        });
    }
});
exports.addProductToCustomer = addProductToCustomer;
//# sourceMappingURL=purchase.controller.js.map
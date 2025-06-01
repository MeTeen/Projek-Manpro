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
exports.getCacheStats = exports.getTopCustomersBySpend = exports.getProductSalesDistribution = exports.getSalesTrend = exports.getKpis = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const analyticsCache = new Map();
const getCachedData = (key) => {
    const entry = analyticsCache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
        console.log(`🚀 Cache HIT for ${key}`);
        return entry.data;
    }
    if (entry) {
        analyticsCache.delete(key);
        console.log(`⏰ Cache EXPIRED for ${key}`);
    }
    return null;
};
const setCachedData = (key, data, ttlMinutes = 5) => {
    analyticsCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000
    });
    console.log(`💾 Cache SET for ${key} (TTL: ${ttlMinutes}min, Size: ${analyticsCache.size})`);
};
// Cache cleanup function
const cleanupCache = () => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of analyticsCache.entries()) {
        if (now - entry.timestamp >= entry.ttl) {
            analyticsCache.delete(key);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} expired cache entries. Current size: ${analyticsCache.size}`);
    }
};
// Auto cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);
// Helper function to get date range based on period
const getDateRange = (period) => {
    const endDate = new Date();
    let startDate = new Date();
    switch (period) {
        case 'daily':
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'weekly':
            startDate.setDate(endDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'monthly':
            startDate.setDate(endDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        default:
            startDate.setDate(endDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
    }
    return { startDate, endDate };
};
const getMonthlyTrendDateRange = (monthsToDisplay = 12) => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(today.getFullYear(), today.getMonth() - (monthsToDisplay - 1), 1);
    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate };
};
// OPTIMIZED KPIs with Supabase Performance
const getKpis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'kpis_data';
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }
        console.time('⚡ KPIs Query (Supabase)');
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999); // Parallel queries for maximum performance
        const [totalRevenueResult, totalTransactionsResult, newCustomersTodayResult] = yield Promise.all([
            models_1.CustomerProduct.findOne({
                attributes: [
                    [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('(price * quantity) - COALESCE(discount_amount, 0)')), 'totalRevenue']
                ],
                raw: true,
            }),
            models_1.CustomerProduct.count(),
            models_1.Customer.count({
                where: {
                    createdAt: {
                        [sequelize_1.Op.between]: [startOfToday, endOfToday]
                    }
                }
            })
        ]);
        const data = {
            totalRevenue: parseFloat((totalRevenueResult === null || totalRevenueResult === void 0 ? void 0 : totalRevenueResult.totalRevenue) || '0'),
            totalTransactions: totalTransactionsResult || 0,
            newCustomersToday: newCustomersTodayResult || 0,
        };
        setCachedData(cacheKey, data, 2); // Cache for 2 minutes (KPIs need frequent updates)
        console.timeEnd('⚡ KPIs Query (Supabase)');
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error('❌ Error fetching KPIs:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data KPI.', error: error.message });
    }
});
exports.getKpis = getKpis;
// OPTIMIZED Sales Trend with Supabase Performance
const getSalesTrend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const period = req.query.period || 'monthly';
        const cacheKey = `sales_trend_${period}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }
        console.time('⚡ Sales Trend Query (Supabase)');
        const dateFormat = 'YYYY-MM';
        const groupByAttribute = (0, sequelize_1.fn)('TO_CHAR', (0, sequelize_1.col)('purchase_date'), dateFormat);
        const { startDate, endDate } = getMonthlyTrendDateRange(6);
        console.log(`📊 Fetching ${period} sales trend for Supabase`);
        console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        const salesData = yield models_1.CustomerProduct.findAll({
            attributes: [
                [groupByAttribute, 'name'],
                [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('(price * quantity) - COALESCE(discount_amount, 0)')), 'pendapatan'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'transaksi']
            ],
            where: {
                purchaseDate: {
                    [sequelize_1.Op.between]: [startDate, endDate]
                }
            },
            group: ['name'],
            order: [[(0, sequelize_1.col)('name'), 'ASC']],
            raw: true,
        });
        const formattedData = salesData.map((item) => ({
            name: item.name,
            pendapatan: parseFloat(item.pendapatan || '0'),
            transaksi: parseInt(item.transaksi || '0', 10),
        }));
        setCachedData(cacheKey, formattedData, 5); // Cache for 5 minutes
        console.timeEnd('⚡ Sales Trend Query (Supabase)');
        console.log(`✅ Sales trend: ${formattedData.length} periods fetched`);
        res.status(200).json({ success: true, data: formattedData });
    }
    catch (error) {
        console.error('❌ Error fetching sales trend:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil tren penjualan.', error: error.message });
    }
});
exports.getSalesTrend = getSalesTrend;
// OPTIMIZED Product Sales with Supabase Performance
const getProductSalesDistribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = 'product_sales_distribution';
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }
        console.time('⚡ Product Sales Query (Supabase)');
        const productSales = yield models_1.CustomerProduct.findAll({
            attributes: [
                [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('(customer_products.price * customer_products.quantity) - COALESCE(customer_products.discount_amount, 0)')), 'value']
            ],
            include: [{
                    model: models_1.Product,
                    as: 'product',
                    attributes: ['name'],
                    required: true // INNER JOIN for performance
                }],
            group: ['product.id', 'product.name'],
            order: [[models_1.sequelize.literal('value'), 'DESC']],
            limit: 10, // Top 10 products only
            raw: true,
            nest: true,
        });
        const formattedData = productSales.map((item) => {
            var _a;
            return ({
                name: ((_a = item.product) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Product',
                value: parseFloat(item.value || '0')
            });
        });
        setCachedData(cacheKey, formattedData, 10); // Cache for 10 minutes
        console.timeEnd('⚡ Product Sales Query (Supabase)');
        console.log(`✅ Product sales: ${formattedData.length} products fetched`);
        res.status(200).json({ success: true, data: formattedData });
    }
    catch (error) {
        console.error('❌ Error fetching product sales:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil distribusi penjualan produk.', error: error.message });
    }
});
exports.getProductSalesDistribution = getProductSalesDistribution;
// OPTIMIZED Top Customers with Supabase Performance
const getTopCustomersBySpend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit, 10) || 5;
    try {
        const cacheKey = `top_customers_${limit}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }
        console.time('⚡ Top Customers Query (Supabase)');
        const topCustomers = yield models_1.CustomerProduct.findAll({
            attributes: [
                [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('(customer_products.price * customer_products.quantity) - COALESCE(customer_products.discount_amount, 0)')), 'value']
            ],
            include: [{
                    model: models_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'firstName', 'lastName'],
                    required: true // INNER JOIN for performance
                }],
            group: [(0, sequelize_1.col)('customer.id'), (0, sequelize_1.col)('customer.firstName'), (0, sequelize_1.col)('customer.lastName')],
            order: [[models_1.sequelize.literal('value'), 'DESC']],
            limit: limit,
            raw: true,
            nest: true,
        });
        const formattedData = topCustomers.map((item) => {
            var _a, _b;
            return ({
                name: `${((_a = item.customer) === null || _a === void 0 ? void 0 : _a.firstName) || ''} ${((_b = item.customer) === null || _b === void 0 ? void 0 : _b.lastName) || ''}`.trim(),
                value: parseFloat(item.value || '0')
            });
        });
        setCachedData(cacheKey, formattedData, 10); // Cache for 10 minutes
        console.timeEnd('⚡ Top Customers Query (Supabase)');
        console.log(`✅ Top customers: ${formattedData.length} customers fetched`);
        res.status(200).json({ success: true, data: formattedData });
    }
    catch (error) {
        console.error('❌ Error fetching top customers:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data top customer.',
            error: error.message
        });
    }
});
exports.getTopCustomersBySpend = getTopCustomersBySpend;
// Cache monitoring endpoint (optional - for debugging)
const getCacheStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = {
        cacheSize: analyticsCache.size,
        cacheEntries: Array.from(analyticsCache.keys()),
        cacheDetails: Array.from(analyticsCache.entries()).map(([key, entry]) => ({
            key,
            age: Math.round((Date.now() - entry.timestamp) / 1000),
            ttl: Math.round(entry.ttl / 1000),
            expired: Date.now() - entry.timestamp >= entry.ttl
        }))
    };
    res.status(200).json({ success: true, data: stats });
});
exports.getCacheStats = getCacheStats;
//# sourceMappingURL=analytics.controller.js.map
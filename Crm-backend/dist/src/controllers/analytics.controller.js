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
exports.getTopCustomersBySpend = exports.getProductSalesDistribution = exports.getSalesTrend = exports.getKpis = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
// Helper function to get date range based on period
const getDateRange = (period) => {
    const endDate = new Date();
    let startDate = new Date();
    switch (period) {
        case 'daily': // Data untuk hari ini
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'weekly': // Data untuk 7 hari terakhir termasuk hari ini
            startDate.setDate(endDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'monthly': // Data untuk 30 hari terakhir termasuk hari ini (atau bulan kalender saat ini)
            // Contoh ini untuk 30 hari terakhir
            startDate.setDate(endDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        default: // Default to monthly if period is unknown
            startDate.setDate(endDate.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
    }
    return { startDate, endDate };
};
const getKpis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalRevenueResult = yield models_1.CustomerProduct.findOne({
            attributes: [
                [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('("price" * "quantity") - COALESCE("discount_amount", 0)')), 'totalRevenue']
            ],
            raw: true,
        });
        const totalTransactionsResult = yield models_1.CustomerProduct.count();
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        const newCustomersTodayResult = yield models_1.Customer.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.between]: [startOfToday, endOfToday]
                }
            }
        });
        res.status(200).json({
            success: true,
            data: {
                totalRevenue: parseFloat((totalRevenueResult === null || totalRevenueResult === void 0 ? void 0 : totalRevenueResult.totalRevenue) || '0'),
                totalTransactions: totalTransactionsResult || 0,
                newCustomersToday: newCustomersTodayResult || 0,
            }
        });
    }
    catch (error) {
        console.error('Error fetching KPIs:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data KPI.', error: error.message });
    }
});
exports.getKpis = getKpis;
const getMonthlyTrendDateRange = (monthsToDisplay = 12) => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999); // Akhir hari ini
    // Ambil data dari awal bulan 'monthsToDisplay' bulan yang lalu hingga akhir hari ini
    startDate = new Date(today.getFullYear(), today.getMonth() - (monthsToDisplay - 1), 1);
    startDate.setHours(0, 0, 0, 0); // Set ke awal hari dari bulan tersebut
    return { startDate, endDate };
};
const getSalesTrend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Periode sekarang sudah tetap bulanan, tidak perlu membaca dari req.query.period
    const dateFormat = 'YYYY-MM'; // Format untuk grouping per bulan (TAHUN-BULAN) untuk PostgreSQL
    const groupByAttribute = (0, sequelize_1.fn)('TO_CHAR', (0, sequelize_1.col)('purchase_date'), dateFormat);
    // Ambil rentang tanggal untuk tren bulanan (misalnya 6 bulan terakhir)
    const { startDate, endDate } = getMonthlyTrendDateRange(6); // Anda bisa sesuaikan jumlah bulan di sini
    console.log(`Workspaceing MONTHLY sales trend`);
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    console.log(`Grouping by: ${dateFormat}`);
    try {
        const salesData = yield models_1.CustomerProduct.findAll({
            attributes: [
                [groupByAttribute, 'name'], // 'name' akan berisi format YYYY-MM
                [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('("price" * "quantity") - COALESCE("discount_amount", 0)')), 'pendapatan'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'transaksi']
            ],
            where: {
                purchaseDate: {
                    [sequelize_1.Op.between]: [startDate, endDate]
                }
            },
            group: ['name'], // Group berdasarkan hasil format tanggal (YYYY-MM)
            order: [[(0, sequelize_1.col)('name'), 'ASC']], // Urutkan berdasarkan periode bulan
            raw: true,
        });
        const formattedData = salesData.map(item => ({
            name: item.name, // Ini akan menjadi seperti "2025-03", "2025-04"
            pendapatan: parseFloat(item.pendapatan || '0'),
            transaksi: parseInt(item.transaksi || '0', 10),
        }));
        console.log('Monthly sales trend data fetched:', formattedData);
        res.status(200).json({ success: true, data: formattedData });
    }
    catch (error) {
        console.error('Error fetching monthly sales trend:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil tren penjualan bulanan.', error: error.message });
    }
});
exports.getSalesTrend = getSalesTrend;
const getProductSalesDistribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productSales = yield models_1.CustomerProduct.findAll({
            attributes: [
                // Tidak perlu productId di sini karena kita join dengan Product
                [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('("CustomerProduct"."price" * "CustomerProduct"."quantity") - COALESCE("CustomerProduct"."discount_amount", 0)')), 'value']
            ],
            include: [{
                    model: models_1.Product,
                    as: 'product', // Pastikan alias ini sesuai
                    attributes: ['name'] // Ambil nama produk
                }],
            group: ['product.id', 'product.name'], // Group berdasarkan ID dan nama produk dari tabel Product
            order: [[models_1.sequelize.literal('value'), 'DESC']],
            raw: true, // Memberikan hasil yang lebih bersih untuk agregasi
            nest: true, // Untuk menyusun hasil include product
        });
        // Format data untuk pie chart (name, value)
        const formattedData = productSales.map((item) => ({
            name: item.product.name,
            value: parseFloat(item.value || '0')
        }));
        res.status(200).json({ success: true, data: formattedData });
    }
    catch (error) {
        console.error('Error fetching product sales distribution:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil distribusi penjualan produk.', error: error.message });
    }
});
exports.getProductSalesDistribution = getProductSalesDistribution;
const getTopCustomersBySpend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit, 10) || 5;
    try {
        const topCustomers = yield models_1.CustomerProduct.findAll({
            attributes: [
                // `CustomerProduct.price` dan `CustomerProduct.quantity` adalah nama field di model CustomerProduct
                // Sequelize akan memetakannya ke nama kolom database jika ada 'field' atau 'underscored:true'
                // Untuk literal, lebih aman menggunakan nama kolom database aktual jika berbeda dari nama field model.                // Asumsi nama kolom di DB adalah price, quantity, discount_amount (sesuai migrasi)
                [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('("CustomerProduct"."price" * "CustomerProduct"."quantity") - COALESCE("CustomerProduct"."discount_amount", 0)')), 'value']
            ],
            include: [{
                    model: models_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'firstName', 'lastName'] // Ambil juga ID untuk memastikan grouping benar
                }],
            // ✅ PERUBAHAN DI SINI: Group hanya berdasarkan ID customer dari tabel yang di-join
            group: [(0, sequelize_1.col)('customer.id')], // Menggunakan col() untuk merujuk ke kolom dari model yang di-include
            order: [[models_1.sequelize.literal('value'), 'DESC']],
            limit: limit,
            // raw: true, // Coba hilangkan raw dan nest dulu untuk debugging, atau pastikan mapping setelahnya benar
            // nest: true,
        });
        // Jika tidak pakai raw:true dan nest:true, aksesnya akan seperti ini:
        const formattedData = topCustomers.map((cp) => {
            const customerData = cp.get('customer'); // Akses data customer yang di-include
            const spendValue = cp.get('value') || 0; // Akses hasil agregasi 'value'
            return {
                name: `${(customerData === null || customerData === void 0 ? void 0 : customerData.firstName) || ''} ${(customerData === null || customerData === void 0 ? void 0 : customerData.lastName) || ''}`.trim(),
                value: parseFloat(spendValue.toString()) // Pastikan value adalah number
            };
        });
        // Jika Anda tetap menggunakan raw: true dan nest: true, pastikan path aksesnya benar
        // const formattedData = topCustomers.map((item: any) => ({
        //     name: `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.trim(),
        //     value: parseFloat(item.value || '0')
        // }));
        res.status(200).json({ success: true, data: formattedData });
    }
    catch (error) {
        console.error('Error fetching top customers:', error);
        // Kirim juga SQL query yang gagal jika ada untuk debugging lebih lanjut
        const sqlError = error.parent ? error.parent.sql : error.sql;
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data top customer.',
            error: error.message,
            sql: sqlError // Opsional: kirim SQL error untuk debugging di frontend/Postman
        });
    }
});
exports.getTopCustomersBySpend = getTopCustomersBySpend;
//# sourceMappingURL=analytics.controller.js.map
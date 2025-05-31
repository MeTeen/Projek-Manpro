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
exports.getRecentActivities = void 0;
const models_1 = require("../models");
const date_fns_1 = require("date-fns");
const getRecentActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit, 10) || 10; // Default 10 aktivitas terakhir
    try {
        const activities = [];
        // 1. Pelanggan Baru
        const newCustomers = yield models_1.Customer.findAll({
            limit: Math.ceil(limit / 3), // Ambil sepertiga dari limit
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'firstName', 'lastName', 'createdAt'],
        });
        newCustomers.forEach(c => {
            activities.push({
                id: `customer-${c.id}`,
                type: 'customer',
                description: `Pelanggan baru ditambahkan: ${c.firstName} ${c.lastName}`,
                timestamp: c.createdAt,
                relatedEntity: { id: c.id, name: `${c.firstName} ${c.lastName}`, path: `/customers/${c.id}` }
            });
        });
        // 2. Transaksi Baru
        const newPurchases = yield models_1.CustomerProduct.findAll({
            limit: Math.ceil(limit / 2),
            order: [['createdAt', 'DESC']],
            include: [
                { model: models_1.Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName'] },
                { model: models_1.Product, as: 'product', attributes: ['id', 'name', 'price'] } // 'price' adalah harga master produk
            ],
            attributes: ['id', 'createdAt', 'quantity', 'price', 'discountAmount', 'productId', 'customerId'] // Pastikan semua field dasar juga diambil
        });
        newPurchases.forEach(p => {
            const purchase = p;
            const customerName = purchase.customer ? `${purchase.customer.firstName} ${purchase.customer.lastName}` : 'Unknown Customer';
            const productName = purchase.product ? purchase.product.name : 'Unknown Product';
            const total = (purchase.price * purchase.quantity) - (purchase.discountAmount || 0);
            activities.push({
                id: `purchase-${purchase.id}`,
                type: 'purchase',
                description: `Transaksi baru oleh ${customerName} untuk produk ${productName} (Qty: ${purchase.quantity}, Total: Rp ${total.toLocaleString('id-ID')})`,
                timestamp: purchase.createdAt,
                relatedEntity: { id: purchase.id, name: `Transaksi #${purchase.id}`, path: `/transaksi` } // atau ke detail transaksi jika ada
            });
        });
        // 3. Promo Baru (Contoh, Anda bisa tambahkan perubahan status promo, dll)
        const newPromos = yield models_1.Promo.findAll({
            limit: Math.ceil(limit / 4),
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'createdAt']
        });
        newPromos.forEach(pr => {
            activities.push({
                id: `promo-${pr.id}`,
                type: 'promo',
                description: `Promo baru ditambahkan: ${pr.name}`,
                timestamp: pr.createdAt,
                relatedEntity: { id: pr.id, name: pr.name, path: `/promo` } // atau ke detail promo
            });
        });
        // 4. Task Baru (Contoh)
        const newTasks = yield models_1.Task.findAll({
            limit: Math.ceil(limit / 4),
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'content', 'createdAt', 'date', 'isCompleted']
        });
        newTasks.forEach(t => {
            activities.push({
                id: `task-${t.id}`,
                type: 'task',
                description: `Tugas baru: "${t.content}" (Jatuh tempo: ${(0, date_fns_1.format)(new Date(t.date), 'dd MMM yyyy')})`,
                timestamp: t.createdAt,
                relatedEntity: { id: t.id, name: t.content, path: '/tasksection' }
            });
        });
        // Sort semua aktivitas berdasarkan timestamp (terbaru dulu)
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        // Ambil sejumlah 'limit' dari aktivitas yang sudah digabung dan diurutkan
        const recentActivities = activities.slice(0, limit);
        res.status(200).json({ success: true, data: recentActivities });
    }
    catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil aktivitas terkini.', error: error.message });
    }
});
exports.getRecentActivities = getRecentActivities;
//# sourceMappingURL=activity.controller.js.map
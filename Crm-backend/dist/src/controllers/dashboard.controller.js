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
exports.getDashboardSummary = void 0;
const models_1 = require("../models"); // Pastikan Task dan Promo diimpor
const sequelize_1 = require("sequelize");
const date_fns_1 = require("date-fns"); // Untuk manipulasi tanggal
const getDashboardSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todayStart = (0, date_fns_1.startOfDay)(new Date());
        const todayEnd = (0, date_fns_1.endOfDay)(new Date());
        const sevenDaysAgoStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(new Date(), 6)); // 7 hari termasuk hari ini
        // OPTIMISASI: Jalankan semua query secara parallel menggunakan Promise.all
        const [revenueResult, customerCount, transactionCount, pendingTasksToday, activePromosCount, newCustomersToday, salesTrendLast7Days] = yield Promise.all([
            // 1. Total Pendapatan (Net setelah diskon)
            models_1.CustomerProduct.findOne({
                attributes: [
                    [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('("price" * "quantity") - COALESCE("discount_amount", 0)')), 'totalRevenue']
                ],
                raw: true,
            }),
            // 2. Jumlah Pelanggan Total
            models_1.Customer.count(),
            // 3. Jumlah Transaksi Total
            models_1.CustomerProduct.count(),
            // 4. Tugas Tertunda Hari Ini
            models_1.Task.count({
                where: {
                    isCompleted: false,
                    date: {
                        [sequelize_1.Op.between]: [todayStart, todayEnd]
                    }
                }
            }),
            // 5. Jumlah Promo Aktif
            models_1.Promo.count({
                where: {
                    isActive: true,
                    [sequelize_1.Op.or]: [
                        { endDate: null },
                        { endDate: { [sequelize_1.Op.gte]: todayStart } }
                    ]
                }
            }),
            // 6. Pelanggan Baru Hari Ini
            models_1.Customer.count({
                where: {
                    createdAt: {
                        [sequelize_1.Op.between]: [todayStart, todayEnd]
                    }
                }
            }),
            // 7. Tren Penjualan 7 Hari Terakhir (Pendapatan Harian)
            models_1.CustomerProduct.findAll({
                attributes: [
                    [(0, sequelize_1.fn)('TO_CHAR', (0, sequelize_1.col)('purchase_date'), 'YYYY-MM-DD'), 'name'],
                    [(0, sequelize_1.fn)('SUM', models_1.sequelize.literal('("price" * "quantity") - COALESCE("discount_amount", 0)')), 'pendapatan']
                ],
                where: {
                    purchaseDate: {
                        [sequelize_1.Op.between]: [sevenDaysAgoStart, todayEnd]
                    }
                },
                group: ['name'],
                order: [[(0, sequelize_1.col)('name'), 'ASC']],
                raw: true,
            })
        ]);
        const totalRevenue = parseFloat((revenueResult === null || revenueResult === void 0 ? void 0 : revenueResult.totalRevenue) || '0');
        const formattedSalesTrend = salesTrendLast7Days.map(item => ({
            name: item.name,
            pendapatan: parseFloat(item.pendapatan || '0'),
        }));
        // Pastikan semua 7 hari ada, isi dengan 0 jika tidak ada data
        const completeSalesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = (0, date_fns_1.subDays)(new Date(), i);
            const dateString = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
            const existingData = formattedSalesTrend.find(d => d.name === dateString);
            if (existingData) {
                completeSalesTrend.push(existingData);
            }
            else {
                completeSalesTrend.push({ name: dateString, pendapatan: 0 });
            }
        }
        res.status(200).json({
            success: true,
            data: {
                kpis: {
                    totalRevenue,
                    customerCount,
                    transactionCount,
                    pendingTasksToday,
                    activePromosCount,
                    newCustomersToday
                },
                salesTrendLast7Days: completeSalesTrend,
            }
        });
    }
    catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan dashboard.', error: error.message });
    }
});
exports.getDashboardSummary = getDashboardSummary;
//# sourceMappingURL=dashboard.controller.js.map
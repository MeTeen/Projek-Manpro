// src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import { sequelize, Customer, Product, CustomerProduct, Promo, Task } from '../models'; // Pastikan Task dan Promo diimpor
import { Op, fn, col, literal } from 'sequelize';
import { format, startOfDay, endOfDay, subDays } from 'date-fns'; // Untuk manipulasi tanggal

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        const sevenDaysAgoStart = startOfDay(subDays(new Date(), 6)); // 7 hari termasuk hari ini

        // 1. Total Pendapatan (Net setelah diskon)
        const revenueResult = await CustomerProduct.findOne({
            attributes: [
                [fn('SUM', sequelize.literal('(`price` * `quantity`) - COALESCE(`discount_amount`, 0)')), 'totalRevenue']
            ],
            raw: true,
        });
        const totalRevenue = parseFloat((revenueResult as any)?.totalRevenue || '0');

        // 2. Jumlah Pelanggan Total
        const customerCount = await Customer.count();

        // 3. Jumlah Transaksi Total
        const transactionCount = await CustomerProduct.count();

        // 4. Tugas Tertunda Hari Ini
        const pendingTasksToday = await Task.count({
            where: {
                isCompleted: false,
                date: { // Asumsi 'date' di Task adalah tanggal tugas, bukan timestamp created_at
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        });

        // 5. Jumlah Promo Aktif
        const activePromosCount = await Promo.count({
            where: {
                isActive: true,
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: todayStart } } // Masih berlaku hari ini atau di masa depan
                ],
                // Opsional: tambahkan startDate juga jika perlu
                // [Op.and]: [
                //     { startDate: { [Op.lte]: todayEnd } }, // Sudah dimulai
                // ]
            }
        });

        // 6. Pelanggan Baru Hari Ini
        const newCustomersToday = await Customer.count({
            where: {
                createdAt: { // Berdasarkan kapan customer dibuat
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        });

        // 7. Tren Penjualan 7 Hari Terakhir (Pendapatan Harian)
        const salesTrendLast7Days = await CustomerProduct.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('purchase_date'), '%Y-%m-%d'), 'name'], // Format sebagai YYYY-MM-DD
                [fn('SUM', sequelize.literal('(`price` * `quantity`) - COALESCE(`discount_amount`, 0)')), 'pendapatan']
            ],
            where: {
                purchaseDate: {
                    [Op.between]: [sevenDaysAgoStart, todayEnd]
                }
            },
            group: ['name'],
            order: [[col('name'), 'ASC']],
            raw: true,
        });

        const formattedSalesTrend = salesTrendLast7Days.map(item => ({
            name: (item as any).name,
            pendapatan: parseFloat((item as any).pendapatan || '0'),
        }));
        
        // Pastikan semua 7 hari ada, isi dengan 0 jika tidak ada data
        const completeSalesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateString = format(date, 'yyyy-MM-dd');
            const existingData = formattedSalesTrend.find(d => d.name === dateString);
            if (existingData) {
                completeSalesTrend.push(existingData);
            } else {
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

    } catch (error: any) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan dashboard.', error: error.message });
    }
};
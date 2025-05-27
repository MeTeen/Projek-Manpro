// src/controllers/analytics.controller.ts
import { Request, Response } from 'express';
import { sequelize, Customer, Product, CustomerProduct, Promo } from '../models';
import { Op, fn, col, literal } from 'sequelize';

// Helper function to get date range based on period
const getDateRange = (period: string): { startDate: Date, endDate: Date } => {
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


export const getKpis = async (req: Request, res: Response) => {
    try {
        const totalRevenueResult = await CustomerProduct.findOne({
            attributes: [
                [fn('SUM', sequelize.literal('(price * quantity) - COALESCE(discount_amount, 0)')), 'totalRevenue']
            ],
            raw: true,
        });

        const totalTransactionsResult = await CustomerProduct.count();
        
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const newCustomersTodayResult = await Customer.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfToday, endOfToday]
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: parseFloat( (totalRevenueResult as any)?.totalRevenue || '0' ),
                totalTransactions: totalTransactionsResult || 0,
                newCustomersToday: newCustomersTodayResult || 0,
            }
        });
    } catch (error: any) {
        console.error('Error fetching KPIs:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data KPI.', error: error.message });
    }
};


const getMonthlyTrendDateRange = (monthsToDisplay: number = 12): { startDate: Date, endDate: Date } => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);

    endDate.setHours(23, 59, 59, 999); // Akhir hari ini

    // Ambil data dari awal bulan 'monthsToDisplay' bulan yang lalu hingga akhir hari ini
    startDate = new Date(today.getFullYear(), today.getMonth() - (monthsToDisplay - 1), 1);
    startDate.setHours(0, 0, 0, 0); // Set ke awal hari dari bulan tersebut
    
    return { startDate, endDate };
};

export const getSalesTrend = async (req: Request, res: Response) => {
    // Periode sekarang sudah tetap bulanan, tidak perlu membaca dari req.query.period
    const dateFormat: string = '%Y-%m'; // Format untuk grouping per bulan (TAHUN-BULAN)
    const groupByAttribute: any = fn('DATE_FORMAT', col('purchase_date'), dateFormat);

    // Ambil rentang tanggal untuk tren bulanan (misalnya 6 bulan terakhir)
    const { startDate, endDate } = getMonthlyTrendDateRange(6); // Anda bisa sesuaikan jumlah bulan di sini

    console.log(`Workspaceing MONTHLY sales trend`);
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    console.log(`Grouping by: ${dateFormat}`);

    try {
        const salesData = await CustomerProduct.findAll({
            attributes: [
                [groupByAttribute, 'name'], // 'name' akan berisi format YYYY-MM
                [fn('SUM', sequelize.literal('(price * quantity) - COALESCE(discount_amount, 0)')), 'pendapatan'],
                [fn('COUNT', col('id')), 'transaksi']
            ],
            where: {
                purchaseDate: { // Gunakan nama field di model Sequelize (purchaseDate)
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['name'], // Group berdasarkan hasil format tanggal (YYYY-MM)
            order: [[col('name'), 'ASC']], // Urutkan berdasarkan periode bulan
            raw: true,
        });

        const formattedData = salesData.map(item => ({
            name: (item as any).name, // Ini akan menjadi seperti "2025-03", "2025-04"
            pendapatan: parseFloat((item as any).pendapatan || '0'),
            transaksi: parseInt((item as any).transaksi || '0', 10),
        }));

        console.log('Monthly sales trend data fetched:', formattedData);
        res.status(200).json({ success: true, data: formattedData });
    } catch (error: any) {
        console.error('Error fetching monthly sales trend:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil tren penjualan bulanan.', error: error.message });
    }
};

export const getProductSalesDistribution = async (req: Request, res: Response) => {
    try {
        const productSales = await CustomerProduct.findAll({
            attributes: [
                // Tidak perlu productId di sini karena kita join dengan Product
                [fn('SUM', sequelize.literal('(CustomerProduct.price * CustomerProduct.quantity) - COALESCE(CustomerProduct.discount_amount, 0)')), 'value']
            ],
            include: [{
                model: Product,
                as: 'product', // Pastikan alias ini sesuai
                attributes: ['name'] // Ambil nama produk
            }],
            group: ['product.id', 'product.name'], // Group berdasarkan ID dan nama produk dari tabel Product
            order: [[sequelize.literal('value'), 'DESC']],
            raw: true, // Memberikan hasil yang lebih bersih untuk agregasi
            nest: true, // Untuk menyusun hasil include product
        });
        
        // Format data untuk pie chart (name, value)
        const formattedData = productSales.map((item: any) => ({
            name: item.product.name,
            value: parseFloat(item.value || '0')
        }));

        res.status(200).json({ success: true, data: formattedData });
    } catch (error: any) {
        console.error('Error fetching product sales distribution:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil distribusi penjualan produk.', error: error.message });
    }
};

export const getTopCustomersBySpend = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 5;
    try {
        const topCustomers = await CustomerProduct.findAll({
            attributes: [
                // `CustomerProduct.price` dan `CustomerProduct.quantity` adalah nama field di model CustomerProduct
                // Sequelize akan memetakannya ke nama kolom database jika ada 'field' atau 'underscored:true'
                // Untuk literal, lebih aman menggunakan nama kolom database aktual jika berbeda dari nama field model.
                // Asumsi nama kolom di DB adalah price, quantity, discount_amount (sesuai migrasi)
                [fn('SUM', sequelize.literal('(CustomerProduct.price * CustomerProduct.quantity) - COALESCE(CustomerProduct.discount_amount, 0)')), 'value']
            ],
            include: [{
                model: Customer,
                as: 'customer',
                attributes: ['id', 'firstName', 'lastName'] // Ambil juga ID untuk memastikan grouping benar
            }],
            // ✅ PERUBAHAN DI SINI: Group hanya berdasarkan ID customer dari tabel yang di-join
            group: [col('customer.id')], // Menggunakan col() untuk merujuk ke kolom dari model yang di-include
            order: [[sequelize.literal('value'), 'DESC']],
            limit: limit,
            // raw: true, // Coba hilangkan raw dan nest dulu untuk debugging, atau pastikan mapping setelahnya benar
            // nest: true,
        });

        // Jika tidak pakai raw:true dan nest:true, aksesnya akan seperti ini:
        const formattedData = topCustomers.map((cp) => {
            const customerData = cp.get('customer') as Customer; // Akses data customer yang di-include
            const spendValue = (cp.get('value') as number) || 0; // Akses hasil agregasi 'value'

            return {
                name: `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim(),
                value: parseFloat(spendValue.toString()) // Pastikan value adalah number
            };
        });
        
        // Jika Anda tetap menggunakan raw: true dan nest: true, pastikan path aksesnya benar
        // const formattedData = topCustomers.map((item: any) => ({
        //     name: `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.trim(),
        //     value: parseFloat(item.value || '0')
        // }));


        res.status(200).json({ success: true, data: formattedData });
    } catch (error: any) {
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
};
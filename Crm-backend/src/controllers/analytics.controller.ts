// SUPABASE OPTIMIZED Analytics Controller
import { Request, Response } from 'express';
import { sequelize, Customer, Product, CustomerProduct, Promo } from '../models';
import { Op, fn, col, literal, QueryTypes } from 'sequelize';

// Enhanced in-memory cache system for Supabase
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const analyticsCache = new Map<string, CacheEntry>();

const getCachedData = (key: string): any | null => {
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

const setCachedData = (key: string, data: any, ttlMinutes: number = 5): void => {
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
const getDateRange = (period: string): { startDate: Date, endDate: Date } => {
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

const getMonthlyTrendDateRange = (monthsToDisplay: number = 12): { startDate: Date, endDate: Date } => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);

    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(today.getFullYear(), today.getMonth() - (monthsToDisplay - 1), 1);
    startDate.setHours(0, 0, 0, 0);
    
    return { startDate, endDate };
};

// OPTIMIZED KPIs with Supabase Performance
export const getKpis = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'kpis_data';
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }

        console.time('⚡ KPIs Query (Supabase)');
        
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);        // Parallel queries for maximum performance
        const [totalRevenueResult, totalTransactionsResult, newCustomersTodayResult] = await Promise.all([
            CustomerProduct.findOne({
                attributes: [
                    [fn('SUM', sequelize.literal('(price * quantity) - COALESCE(discount_amount, 0)')), 'totalRevenue']
                ],
                raw: true,
            }),
            CustomerProduct.count(),
            Customer.count({
                where: {
                    createdAt: {
                        [Op.between]: [startOfToday, endOfToday]
                    }
                }
            })
        ]);

        const data = {
            totalRevenue: parseFloat((totalRevenueResult as any)?.totalRevenue || '0'),
            totalTransactions: totalTransactionsResult || 0,
            newCustomersToday: newCustomersTodayResult || 0,
        };

        setCachedData(cacheKey, data, 2); // Cache for 2 minutes (KPIs need frequent updates)
        
        console.timeEnd('⚡ KPIs Query (Supabase)');
        res.status(200).json({ success: true, data });
    } catch (error: any) {
        console.error('❌ Error fetching KPIs:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data KPI.', error: error.message });
    }
};

// OPTIMIZED Sales Trend with Supabase Performance
export const getSalesTrend = async (req: Request, res: Response) => {
    try {
        const period = req.query.period as string || 'monthly';
        const cacheKey = `sales_trend_${period}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }

        console.time('⚡ Sales Trend Query (Supabase)');        const dateFormat: string = 'YYYY-MM';
        const groupByAttribute: any = fn('TO_CHAR', col('purchase_date'), dateFormat);
        const { startDate, endDate } = getMonthlyTrendDateRange(6);

        console.log(`📊 Fetching ${period} sales trend for Supabase`);
        console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        const salesData = await CustomerProduct.findAll({
            attributes: [
                [groupByAttribute, 'name'],
                [fn('SUM', sequelize.literal('(price * quantity) - COALESCE(discount_amount, 0)')), 'pendapatan'],
                [fn('COUNT', col('id')), 'transaksi']
            ],
            where: {
                purchaseDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['name'],
            order: [[col('name'), 'ASC']],
            raw: true,
        });

        const formattedData = salesData.map((item: any) => ({
            name: (item as any).name,
            pendapatan: parseFloat((item as any).pendapatan || '0'),
            transaksi: parseInt((item as any).transaksi || '0', 10),
        }));

        setCachedData(cacheKey, formattedData, 5); // Cache for 5 minutes
        
        console.timeEnd('⚡ Sales Trend Query (Supabase)');
        console.log(`✅ Sales trend: ${formattedData.length} periods fetched`);
        res.status(200).json({ success: true, data: formattedData });
    } catch (error: any) {
        console.error('❌ Error fetching sales trend:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil tren penjualan.', error: error.message });
    }
};

// OPTIMIZED Product Sales with Supabase Performance
export const getProductSalesDistribution = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'product_sales_distribution';
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }

        console.time('⚡ Product Sales Query (Supabase)');
        
        // Use raw SQL query to avoid table alias conflicts
        const productSalesQuery = `
            SELECT 
                p.name,
                SUM((cp.price * cp.quantity) - COALESCE(cp.discount_amount, 0)) as value
            FROM customer_products cp
            INNER JOIN products p ON cp.product_id = p.id
            GROUP BY p.id, p.name
            ORDER BY value DESC
            LIMIT 10
        `;
        
        const productSales = await sequelize.query(productSalesQuery, {
            type: QueryTypes.SELECT
        });
        
        const formattedData = productSales.map((item: any) => ({
            name: item.name || 'Unknown Product',
            value: parseFloat(item.value || '0')
        }));

        setCachedData(cacheKey, formattedData, 10); // Cache for 10 minutes
        
        console.timeEnd('⚡ Product Sales Query (Supabase)');
        console.log(`✅ Product sales: ${formattedData.length} products fetched`);
        res.status(200).json({ success: true, data: formattedData });
    } catch (error: any) {
        console.error('❌ Error fetching product sales:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil distribusi penjualan produk.', error: error.message });
    }
};

// OPTIMIZED Top Customers with Supabase Performance
export const getTopCustomersBySpend = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 5;
    
    try {
        const cacheKey = `top_customers_${limit}`;
        const cachedData = getCachedData(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData });
        }

        console.time('⚡ Top Customers Query (Supabase)');
        
        // Use raw SQL query to avoid table alias conflicts
        const topCustomersQuery = `
            SELECT 
                CONCAT(c.first_name, ' ', c.last_name) as name,
                SUM((cp.price * cp.quantity) - COALESCE(cp.discount_amount, 0)) as value
            FROM customer_products cp
            INNER JOIN customers c ON cp.customer_id = c.id
            GROUP BY c.id, c.first_name, c.last_name
            ORDER BY value DESC
            LIMIT $1
        `;
        
        const topCustomers = await sequelize.query(topCustomersQuery, {
            bind: [limit],
            type: QueryTypes.SELECT
        });
        
        const formattedData = topCustomers.map((item: any) => ({
            name: (item.name || 'Unknown Customer').trim(),
            value: parseFloat(item.value || '0')
        }));

        setCachedData(cacheKey, formattedData, 10); // Cache for 10 minutes
        
        console.timeEnd('⚡ Top Customers Query (Supabase)');
        console.log(`✅ Top customers: ${formattedData.length} customers fetched`);
        res.status(200).json({ success: true, data: formattedData });
    } catch (error: any) {
        console.error('❌ Error fetching top customers:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data top customer.',
            error: error.message
        });
    }
};

// Cache monitoring endpoint (optional - for debugging)
export const getCacheStats = async (req: Request, res: Response) => {
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
};

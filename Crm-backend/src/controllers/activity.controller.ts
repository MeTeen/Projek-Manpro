// src/controllers/activity.controller.ts
import { Request, Response } from 'express';
import { sequelize, Customer, Purchase, Product, Promo, Task, Admin } from '../models';
import { Op, literal } from 'sequelize';
import { format } from 'date-fns';
import { formatTransactionReference } from '../utils/transactionFormatter';

interface ActivityItem {
  id: string; // Gabungan tipe dan ID, misal 'customer-1', 'purchase-5'
  type: 'customer' | 'purchase' | 'promo' | 'task' | 'admin_login' | 'admin_action'; // Contoh tipe aktivitas
  description: string;
  timestamp: Date;
  user?: { // Admin atau user yang terkait dengan aktivitas
    id: number;
    username: string;
  } | null;
  relatedEntity?: { // Entitas yang terkait, misal nama customer atau produk
    id: number;
    name: string;
    path?: string; // Path di frontend untuk navigasi
  } | null;
}

export const getRecentActivities = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 10; // Default 10 aktivitas terakhir

  try {
    // Execute all queries in parallel for better performance
    const [newCustomers, newPurchases, newPromos, newTasks] = await Promise.all([
      // 1. Pelanggan Baru
      Customer.findAll({
        limit: Math.ceil(limit / 3), // Ambil sepertiga dari limit
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'firstName', 'lastName', 'createdAt'],
      }),      // 2. Transaksi Baru
      Purchase.findAll({
        limit: Math.ceil(limit / 2),
        order: [['createdAt', 'DESC']],
        include: [
          { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName'] },
          { model: Product, as: 'product', attributes: ['id', 'name', 'price'] }
        ],
        attributes: ['id', 'createdAt', 'quantity', 'unitPrice', 'discountAmount', 'productId', 'customerId']
      }),

      // 3. Promo Baru
      Promo.findAll({
        limit: Math.ceil(limit / 4),
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'createdAt']
      }),

      // 4. Task Baru
      Task.findAll({
        limit: Math.ceil(limit / 4),
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'content', 'createdAt', 'date', 'isCompleted']
      })
    ]);

    const activities: ActivityItem[] = [];    // Process customers
    newCustomers.forEach((c: any) => {
      activities.push({
        id: `customer-${c.id}`,
        type: 'customer',
        description: `Pelanggan baru ditambahkan: ${c.firstName} ${c.lastName}`,
        timestamp: c.createdAt!,
        relatedEntity: { id: c.id, name: `${c.firstName} ${c.lastName}`, path: `/customers/${c.id}` }
      });
    });// Process purchases
    newPurchases.forEach((p: any) => {      const purchase = p as typeof p & {
        customer?: { id: number; firstName: string; lastName: string };
        product?: { id: number; name: string; price: number };
      };      const customerName = purchase.customer ? `${purchase.customer.firstName} ${purchase.customer.lastName}` : 'Unknown Customer';
      const productName = purchase.product ? purchase.product.name : 'Unknown Product';
      const total = (purchase.unitPrice * purchase.quantity) - (purchase.discountAmount || 0);
      activities.push({
        id: `purchase-${purchase.id}`,
        type: 'purchase',        description: `Transaksi baru oleh ${customerName} untuk produk ${productName} (Qty: ${purchase.quantity}, Total: Rp ${total.toLocaleString('id-ID')})`,
        timestamp: purchase.createdAt!,
        relatedEntity: { id: purchase.id, name: `Transaksi ${formatTransactionReference(purchase.id)}`, path: `/transaksi` }
      });
    });    // Process promos
    newPromos.forEach((pr: any) => {
      activities.push({
        id: `promo-${pr.id}`,
        type: 'promo',
        description: `Promo baru ditambahkan: ${pr.name}`,
        timestamp: pr.createdAt!,
        relatedEntity: { id: pr.id, name: pr.name, path: `/promo` }
      });
    });

    // Process tasks
    newTasks.forEach((t: any) => {
      activities.push({
        id: `task-${t.id}`,
        type: 'task',
        description: `Tugas baru: "${t.content}" (Jatuh tempo: ${format(new Date(t.date), 'dd MMM yyyy')})`,
        timestamp: t.createdAt!,
        relatedEntity: { id: t.id, name: t.content, path: '/tasksection' }
      });
    });

    // Sort semua aktivitas berdasarkan timestamp (terbaru dulu)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Ambil sejumlah 'limit' dari aktivitas yang sudah digabung dan diurutkan
    const recentActivities = activities.slice(0, limit);

    res.status(200).json({ success: true, data: recentActivities });

  } catch (error: any) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil aktivitas terkini.', error: error.message });
  }
};
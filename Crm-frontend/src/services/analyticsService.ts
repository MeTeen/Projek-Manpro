// src/services/analyticsService.ts
import axios from 'axios';
import authService from './authService'; // Asumsi Anda menggunakan ini untuk token

// Mengambil base URL dari environment variable Vite
const API_BASE_URL = `http://localhost:3000/api/analytics`; // Sesuaikan path jika endpoint analitik Anda berbeda

// Helper function untuk mendapatkan token (jika endpoint dilindungi)
const getAuthToken = (): string | null => {
  return authService.getToken(); // Atau cara Anda mendapatkan token
};

// Contoh tipe data yang diharapkan dari backend
// Anda perlu menyesuaikan ini dengan apa yang sebenarnya dikembalikan oleh backend Anda
interface SalesTrendItem {
  name: string; // Misal: 'Jan', 'Feb', 'Minggu 1'
  pendapatan?: number;
  transaksi?: number;
  // Tambahkan field lain jika ada
}

interface ProductSalesItem {
  name: string; // Nama produk
  value: number; // Jumlah penjualan atau kuantitas
  fill: string; // Warna untuk pie chart (bisa juga di-generate di frontend)
}

interface TopCustomerItem {
  name: string; // Nama customer
  value: number; // Total belanja
}

interface KpiData {
  totalRevenue: number;
  totalTransactions: number;
  newCustomersToday?: number; // Contoh KPI tambahan
  // Tambahkan KPI lainnya
}

const analyticsService = {
  // Panggilan untuk mendapatkan KPI Utama
  async getKpis(): Promise<KpiData> {
    authService.initializeAuth(); // Jika menggunakan authService
    const token = getAuthToken();
    if (!token && import.meta.env.PROD) { // Di production, token mungkin wajib
        throw new Error('Authentication required.');
    }
    // Di development, Anda mungkin ingin membiarkannya jika endpoint tidak dilindungi
    // atau tambahkan header Authorization jika ada token

    const response = await axios.get(`${API_BASE_URL}/kpis`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return response.data.data; // Asumsi backend mengembalikan data di response.data.data
  },

  // Panggilan untuk tren penjualan (pendapatan & jumlah transaksi)
  async getSalesTrend(period: string = 'monthly'): Promise<SalesTrendItem[]> {
    authService.initializeAuth();
    const token = getAuthToken();
    if (!token && import.meta.env.PROD) throw new Error('Authentication required.');
    
    const response = await axios.get(`${API_BASE_URL}/sales-trend?period=${period}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return response.data.data;
  },

  // Panggilan untuk distribusi penjualan produk
  async getProductSalesDistribution(): Promise<ProductSalesItem[]> {
    authService.initializeAuth();
    const token = getAuthToken();
    if (!token && import.meta.env.PROD) throw new Error('Authentication required.');

    const response = await axios.get(`${API_BASE_URL}/product-sales`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    // Backend mungkin hanya mengembalikan name & value, 'fill' bisa ditambahkan di frontend
    return response.data.data.map((item: any, index: number) => ({
        ...item,
        // Contoh penambahan warna jika tidak ada dari backend
        fill: item.fill || ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'][index % 5] 
    }));
  },

  // Panggilan untuk top customers berdasarkan total belanja
  async getTopCustomersBySpend(limit: number = 5): Promise<TopCustomerItem[]> {
    authService.initializeAuth();
    const token = getAuthToken();
    if (!token && import.meta.env.PROD) throw new Error('Authentication required.');

    const response = await axios.get(`${API_BASE_URL}/top-customers?limit=${limit}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return response.data.data;
  },
  
  // Anda bisa menambahkan fungsi lain di sini untuk analitik lainnya
  // seperti promo paling efektif, dll.
};

export default analyticsService;

// Ekspor juga tipe data jika akan digunakan di komponen lain
export type { SalesTrendItem, ProductSalesItem, TopCustomerItem, KpiData };
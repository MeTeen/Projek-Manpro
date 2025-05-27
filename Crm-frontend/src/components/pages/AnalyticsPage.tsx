// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../dashboard/Sidebar'; // Sesuaikan path
import Header from '../dashboard/Header';   // Sesuaikan path
import ReusableBarChart from '../charts/ReusableBarChart';
import ReusableLineChart from '../charts/ReusableLineChart';
import ReusablePieChart from '../charts/ReusablePieChart';
// Impor service dan tipe data
import analyticsService, {
    SalesTrendItem,
    ProductSalesItem,
    TopCustomerItem,
    KpiData
} from '../../services/analyticsService'; // Sesuaikan path

const AnalyticsPage: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [kpiData, setKpiData] = useState<KpiData | null>(null);
    const [salesTrendData, setSalesTrendData] = useState<SalesTrendItem[]>([]);
    const [productSalesData, setProductSalesData] = useState<ProductSalesItem[]>([]);
    const [topCustomersData, setTopCustomersData] = useState<TopCustomerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Menggunakan Promise.allSettled untuk menangani error individual jika perlu
                const [kpis, trend, products, customers] = await Promise.all([
                    analyticsService.getKpis(),
                    analyticsService.getSalesTrend('monthly'), // Ambil data bulanan sebagai default
                    analyticsService.getProductSalesDistribution(),
                    analyticsService.getTopCustomersBySpend(5) // Ambil top 5 customer
                ]);

                setKpiData(kpis);
                setSalesTrendData(trend);
                setProductSalesData(products);
                setTopCustomersData(customers);

            } catch (err) {
                setError('Gagal memuat data analitik. Pastikan backend berjalan dan endpoint tersedia.');
                console.error(err);
                // Set state data ke array kosong agar chart tidak error jika data tidak ter-load
                setKpiData(null);
                setSalesTrendData([]);
                setProductSalesData([]);
                setTopCustomersData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper untuk format angka jika diperlukan di KPI card
    const formatKpiNumber = (num: number | undefined) => {
        if (num === undefined || num === null) return 'N/A';
        return num.toLocaleString('id-ID');
    }
    const formatKpiCurrency = (num: number | undefined) => {
        if (num === undefined || num === null) return 'N/A';
        return `Rp ${num.toLocaleString('id-ID')}`;
    }


    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh' }}>
                <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
                <div style={{ flex: 1, padding: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p>Memuat data analitik...</p> {/* Ganti dengan komponen spinner/skeleton jika ada */}
                </div>
            </div>
        );
    }

    if (error && !kpiData) { // Hanya tampilkan error besar jika tidak ada data sama sekali
        return (
            <div style={{ display: 'flex', height: '100vh' }}>
                <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
                <div style={{ flex: 1, padding: '20px', color: 'red', textAlign: 'center' }}>
                    <p>Error: {error}</p>
                    <p>Silakan coba refresh halaman atau hubungi administrator.</p>
                </div>
            </div>
        );
    }


    const salesTrendLines = [
        { key: 'pendapatan', color: '#8884d8', name: 'Pendapatan (Rp)', yAxisId: 'left' }, // Sumbu kiri untuk pendapatan
        { key: 'transaksi', color: '#82ca9d', name: 'Jumlah Transaksi', yAxisId: 'right' } // Sumbu kanan untuk transaksi
    ];

    return (


        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '20px 30px' }}>
                <Header />
                <div style={{ padding: '20px 10px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '20px', color: '#1F2937' }}>
                        Analitik Penjualan
                    </h1>
                    {error && <p style={{ color: 'orange', marginBottom: '15px' }}>Sebagian data mungkin gagal dimuat: {error}</p>}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#6B7280', fontSize: '14px' }}>Total Pendapatan</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#10B981' }}>
                                {kpiData ? formatKpiCurrency(kpiData.totalRevenue) : 'Memuat...'}
                            </p>
                        </div>
                        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#6B7280', fontSize: '14px' }}>Total Transaksi</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#3B82F6' }}>
                                {kpiData ? formatKpiNumber(kpiData.totalTransactions) : 'Memuat...'}
                            </p>
                        </div>
                        {/* Contoh KPI tambahan */}
                        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#6B7280', fontSize: '14px' }}>Pelanggan Baru (Hari Ini)</h4>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#F59E0B' }}>
                                {kpiData ? formatKpiNumber(kpiData.newCustomersToday) : 'Memuat...'}
                            </p>
                        </div>
                    </div>


                    {salesTrendData.length > 0 ? (
                        <ReusableLineChart
                            data={salesTrendData}
                            xAxisKey="name"
                            lines={salesTrendLines}
                            title="Tren Pendapatan & Transaksi (Bulanan)"
                        />
                    ) : !loading && <p>Data tren penjualan bulanan tidak tersedia.</p>}



                    <div style={{ padding: '100px 20px 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        {productSalesData.length > 0 ? (
                            <ReusablePieChart data={productSalesData} title="Distribusi Penjualan per Produk (berdasarkan nilai)" />
                        ) : !loading && <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center' }}><p>Data penjualan produk tidak tersedia.</p></div>}

                        {topCustomersData.length > 0 ? (
                            <ReusableBarChart data={topCustomersData} xAxisKey="name" dataKey="value" barColor="#82ca9d" title="Top Customers by Spend" />
                        ) : !loading && <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center' }}><p>Data top customer tidak tersedia.</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
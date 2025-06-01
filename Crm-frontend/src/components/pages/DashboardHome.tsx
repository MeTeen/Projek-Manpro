import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MdPerson,
  MdShoppingCart,
  MdAttachMoney,
  MdTrendingUp,
  MdErrorOutline,
  MdPeopleOutline,
  MdListAlt,
  MdCardMembership,
  MdFiberNew,
  MdReceipt,
  MdLocalOffer as MdPromoIcon,
  MdAssignmentTurnedIn
} from "react-icons/md";

// Komponen UI Internal
import Header from "../dashboard/Header";
import Sidebar from "../dashboard/Sidebar";
import AddNewDropdown from "../dashboard/AddNewDropdown";

// Services
import authService from '../../services/authService';
import dashboardService, { DashboardSummaryData } from '../../services/dashboardService';
import activityService, { Activity } from '../../services/activityService';

// Komponen lain
import ReusableLineChart from '../charts/ReusableLineChart'; // Sesuaikan path jika perlu
import CustomerSection from "../dashboard/CustomerSection";
import TaskSection from "../dashboard/TaskSection";
import ErrorBoundary from "../common/ErrorBoundary";

// Helper untuk format harga
const formatPrice = (price: number | undefined): string => {
  if (price === undefined || price === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Menggunakan date-fns untuk format waktu relatif
import { formatDistanceToNow } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';

const spinAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Komponen untuk Statistik Card
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  isLoading?: boolean;
}> = ({ title, value, icon, description, color = '#4F46E5', isLoading }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    transition: 'all 0.3s ease',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#4B5563', margin: 0 }}>{title}</h3>
      <div style={{
        backgroundColor: `${color}1A`,
        color: color,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
    </div>
    <div>
      <span style={{ fontSize: '2rem', fontWeight: '700', color: '#1F2937', lineHeight: '1.2' }}>
        {isLoading ? '...' : value}
      </span>
      {description && <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '8px 0 0 0' }}>{description}</p>}
    </div>
  </div>
);


const DashboardHome: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [kpis, setKpis] = useState<DashboardSummaryData['kpis'] | null>(null);
  const [salesTrendData, setSalesTrendData] = useState<DashboardSummaryData['salesTrendLast7Days']>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);


  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingActivities(true);
      setError(null);
      authService.initializeAuth();
      const token = authService.getToken();

      if (!token) {
        setError('Sesi tidak valid atau Anda belum login. Silakan login kembali.');
        setIsLoading(false);
        setLoadingActivities(false);
        return;
      }

      const [summaryRes, activitiesRes] = await Promise.allSettled([
        dashboardService.getSummary(),
        activityService.getRecentActivities(7) // Ambil 7 aktivitas terakhir
      ]);

      if (summaryRes.status === 'fulfilled') {
        setKpis(summaryRes.value.kpis);
        setSalesTrendData(summaryRes.value.salesTrendLast7Days || []);
      } else {
        console.error("Error fetching dashboard summary:", summaryRes.reason);
        setError(prev => `${prev ? prev + ' | ' : ''}Gagal memuat ringkasan dashboard.`);
      }

      if (activitiesRes.status === 'fulfilled') {
        setRecentActivities(activitiesRes.value);
      } else {
        console.error("Error fetching recent activities:", activitiesRes.reason);
        setError(prev => `${prev ? prev + ' | ' : ''}Gagal memuat aktivitas terkini.`);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Gagal memuat data dashboard.');
      setKpis(null);
      setSalesTrendData([]);
      setRecentActivities([]);
    } finally {
      setIsLoading(false);
      setLoadingActivities(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshTrigger]);

  const handleCustomerCreated = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleAddNewClick = () => {
    setIsDropdownOpen(true);
  };

  const handleAddProduct = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const salesTrendLines = [
    { key: 'pendapatan', color: '#4F46E5', name: 'Daily Revenue (Rp)' },
    // Jika backend getSummary -> salesTrendLast7Days juga ada 'transaksi':
    // { key: 'transaksi', color: '#10B981', name: 'Jumlah Transaksi', yAxisId: 'right' },
  ];

  const getActivityIcon = (type: string | undefined) => {
    switch (type) {
      case 'customer': return <MdPeopleOutline style={{ color: '#3B82F6' }} size={22} />;
      case 'purchase': return <MdReceipt style={{ color: '#10B981' }} size={22} />;
      case 'promo': return <MdPromoIcon style={{ color: '#8B5CF6' }} size={22} />;
      case 'task': return <MdAssignmentTurnedIn style={{ color: '#F59E0B' }} size={22} />;
      default: return <MdFiberNew style={{ color: '#6B7280' }} size={22} />;
    }
  };

  if (isLoading && !kpis && recentActivities.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '48px', height: '48px', border: '5px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '20px', fontSize: '18px', color: '#4B5563', fontWeight: 500 }}>Memuat Dashboard...</p>
          <style>{spinAnimation}</style>
        </div>
      </div>
    );
  }

  if (error && !kpis && recentActivities.length === 0) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Header onCustomerCreated={handleCustomerCreated} onAddNewClick={handleAddNewClick} />
          <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)' }}>
            <MdErrorOutline size={64} color="#EF4444" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: '#EF4444', marginBottom: '12px', fontSize: '22px' }}>Terjadi Kesalahan</h2>
            <p style={{ color: '#4B5563', marginBottom: '28px', textAlign: 'center', maxWidth: '400px' }}>{error}</p>
            <button onClick={fetchDashboardData} style={{ padding: '12px 28px', border: 'none', backgroundColor: '#4F46E5', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 500 }}>
              Coba Muat Ulang
            </button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <style>{spinAnimation}</style>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '20px 30px' }}>
        <Header
          onCustomerCreated={handleCustomerCreated}
          onAddNewClick={handleAddNewClick}
        />
        <main>
          <div style={{
            marginBottom: '24px',
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ padding: '0 0px 0 5px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Main Dashboard</h1>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>
                Monitor your business performance in real-time.
              </p>

            </div>
          </div>


          {error && (kpis || recentActivities.length > 0) && (
            <div style={{ backgroundColor: '#FFFBEB', color: '#B45309', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center' }}>
              <MdErrorOutline style={{ marginRight: '8px' }} />Sebagian data mungkin gagal dimuat. Data yang ditampilkan mungkin tidak lengkap.
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <StatCard title="Total Revenue" value={kpis ? formatPrice(kpis.totalRevenue) : "..."} icon={<MdAttachMoney size={22} />} color="#10B981" isLoading={isLoading && !kpis} />
            <StatCard title="Total Customers" value={kpis ? kpis.customerCount.toString() : "..."} icon={<MdPeopleOutline size={22} />} color="#3B82F6" isLoading={isLoading && !kpis} />
            <StatCard title="Total Transactions" value={kpis ? kpis.transactionCount.toString() : "..."} icon={<MdShoppingCart size={20} />} color="#F59E0B" isLoading={isLoading && !kpis} />
            <StatCard title="Active Promotions" value={kpis ? kpis.activePromosCount.toString() : "..."} icon={<MdCardMembership size={20} />} color="#8B5CF6" isLoading={isLoading && !kpis} />
            <StatCard title="Pending Tasks (Today)" value={kpis ? kpis.pendingTasksToday.toString() : "..."} icon={<MdListAlt size={22} />} color="#EF4444" isLoading={isLoading && !kpis} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', marginTop: 0, marginBottom: '20px' }}>
                Sales Trend (Last 7 Days)
              </h2>
              {isLoading && !salesTrendData.length ? (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Memuat data chart...</div>
              ) : salesTrendData && salesTrendData.length > 0 ? (
                <div style={{ height: '320px' }}> {/* Beri sedikit ruang lebih untuk legend */}
                  <ReusableLineChart
                    data={salesTrendData}
                    xAxisKey="name"
                    lines={salesTrendLines}
                  />
                </div>
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', border: '1px dashed #D1D5DB', borderRadius: '8px', flexDirection: 'column' }}>
                  <MdTrendingUp size={48} style={{ marginBottom: '8px' }} />
                  <p>Data tren penjualan tidak tersedia.</p>
                </div>
              )}
            </div>            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>Upcoming Tasks</h2>
                <Link to="/tasksection" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>View All</Link>
              </div>
              <ErrorBoundary>
                <TaskSection />
              </ErrorBoundary>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '32px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                  Aktivitas Terkini
                </h2>
                {/* Tambahkan Link ke halaman log aktivitas jika ada */}
              </div>
              {loadingActivities ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Memuat aktivitas...</div>
              ) : recentActivities.length === 0 && !error?.includes("aktivitas") ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                  <MdListAlt size={48} style={{ marginBottom: '16px', color: '#9CA3AF' }} />
                  <p style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>Tidak ada aktivitas terkini.</p>
                </div>
              ) : recentActivities.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '350px', overflowY: 'auto' }}>
                  {recentActivities.map((activity) => (
                    <li key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ marginRight: '16px', flexShrink: 0, paddingTop: '3px' }}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5', wordBreak: 'break-word' }}>
                          {activity.description}
                          {activity.relatedEntity?.path && activity.relatedEntity?.name ? (
                            <Link
                              to={activity.relatedEntity.path}
                              style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 500, marginLeft: '5px', whiteSpace: 'nowrap' }}
                              title={`View detail ${activity.relatedEntity.name}`}
                            >
                              (View)
                            </Link>
                          ) : activity.relatedEntity?.name ? (
                            <span style={{ color: '#6B7280', marginLeft: '5px' }}>({activity.relatedEntity.name})</span>
                          ) : null}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9CA3AF' }}>
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: indonesiaLocale })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                error && error.includes("aktivitas") && <div style={{ padding: '20px', color: '#EF4444', textAlign: 'center' }}>Gagal memuat aktivitas.</div>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: 0 }}>
                  Pelanggan Terbaru
                </h2>
                <Link to="/customers" style={{ color: '#4F46E5', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>View All</Link>
              </div>
              <CustomerSection refreshTrigger={refreshTrigger} limit={5} isDashboardView={true} />
            </div>
          </div>

        </main>
        <AddNewDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onAddCustomer={handleCustomerCreated}
          onAddProduct={handleAddProduct}
        />
      </div>
    </div>
  );
};

export default DashboardHome;
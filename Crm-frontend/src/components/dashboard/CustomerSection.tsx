// src/components/dashboard/CustomerSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import customerService, { Customer } from '../../services/customerService'; // Sesuaikan path
import { MdChevronRight, MdErrorOutline, MdPeopleOutline } from 'react-icons/md'; // Tambahkan ikon
import { Link } from 'react-router-dom'; // Untuk link "Lihat Semua"

// Definisikan interface Props untuk CustomerSection
export interface CustomerSectionProps {
  refreshTrigger?: number;      // Untuk memicu refresh data dari luar
  limit?: number;               // Batas jumlah customer yang ditampilkan
  isDashboardView?: boolean;    // Flag untuk menandakan apakah ini tampilan dashboard
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ refreshTrigger, limit, isDashboardView }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add spin animation for loading spinner
  const spinAnimation = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let fetchedCustomers = await customerService.getAllCustomers();

      // Urutkan berdasarkan tanggal dibuat (terbaru dulu) jika ada createdAt
      if (fetchedCustomers.length > 0 && fetchedCustomers[0].createdAt) {
        fetchedCustomers.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
      }
      
      if (limit && typeof limit === 'number') {
        fetchedCustomers = fetchedCustomers.slice(0, limit);
      }

      setCustomers(fetchedCustomers);
    } catch (err) {
      console.error("Error fetching customers for section:", err);
      setError("Gagal memuat daftar pelanggan.");
    } finally {
      setLoading(false);
    }
  }, [limit]); // refreshTrigger akan dihandle oleh useEffect di bawah
  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger, fetchCustomers]); // fetchCustomers dimasukkan sebagai dependency useCallback
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '20px', 
        color: '#6b7280' 
      }}>
        <style>{spinAnimation}</style>
        <div style={{ 
          display: 'inline-block', 
          width: '24px', 
          height: '24px', 
          border: '3px solid #e5e7eb', 
          borderTop: '3px solid #4f46e5', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <span style={{ marginLeft: '10px' }}>Memuat pelanggan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#ef4444', 
        backgroundColor: '#fef2f2', 
        borderRadius: '8px', 
        border: '1px solid #fecaca', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <MdErrorOutline size={20}/> {error}
      </div>
    );
  }  return (
    <div>
      {customers.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          color: '#6B7280',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isDashboardView ? '40px 20px' : '20px',
          minHeight: isDashboardView ? '200px' : 'auto',
          border: isDashboardView ? '1px dashed #D1D5DB' : 'none',
          borderRadius: isDashboardView ? '8px' : '0'
        }}>
          <MdPeopleOutline 
            size={isDashboardView ? 48 : 32} 
            style={{ marginBottom: '16px', color: '#9CA3AF' }} 
          />
          <p style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>Belum ada pelanggan.</p>
          {!isDashboardView && (
            <p style={{ fontSize: '14px', marginTop: '8px', margin: '8px 0 0 0' }}>
              Mulai dengan menambahkan pelanggan baru.
            </p>
          )}
        </div>
      )}
      {customers.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {customers.map((customer, index) => (
            <li 
              key={customer.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: index < customers.length - 1 ? '1px solid #F3F4F6' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={
                    customer.avatarUrl
                      ? `${customer.avatarUrl}`
                      : `https://ui-avatars.com/api/?name=${customer.firstName}+${customer.lastName}&background=random&size=128`
                  }
                  alt={`${customer.firstName} ${customer.lastName}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '12px',
                    objectFit: 'cover',
                    border: '1px solid #E5E7EB'
                  }}
                />
                <div>
                  <div style={{
                    fontWeight: 600,
                    color: '#111827',
                    fontSize: '14px',
                    marginBottom: '2px'
                  }}>
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    {customer.email}
                  </div>
                </div>
              </div>
              {/* Jika tidak di dashboard, mungkin tampilkan tombol aksi atau link detail */}
              {!isDashboardView && (
                <Link 
                  to={`/customers/${customer.id}`} 
                  style={{
                    color: '#4F46E5',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title="Lihat Detail"
                >
                  <MdChevronRight size={24} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Tombol "Lihat Semua" hanya jika bukan tampilan dashboard dan ada pelanggan */}
      {!isDashboardView && customers.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: customers.length > 0 ? '1px solid #E5E7EB' : 'none'
        }}>
          <Link
            to="/customers"
            style={{
              color: '#4F46E5',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: '#EEF2FF',
              display: 'inline-block',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E0E7FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EEF2FF';
            }}
          >
            Lihat Semua Pelanggan
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerSection;
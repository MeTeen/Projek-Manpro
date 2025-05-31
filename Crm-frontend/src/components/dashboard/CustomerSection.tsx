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
      <div className="flex justify-center items-center p-5 text-gray-500">
        <div className="inline-block w-6 h-6 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="ml-2.5">Memuat pelanggan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-red-500 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
        <MdErrorOutline size={20}/> {error}
      </div>
    );
  }
  return (
    <div>
      {customers.length === 0 && !loading && (
        <div className={`text-center text-gray-500 flex flex-col items-center justify-center ${
          isDashboardView 
            ? 'py-10 px-5 min-h-[200px] border border-dashed border-gray-300 rounded-lg' 
            : 'p-5'
        }`}>
          <MdPeopleOutline size={isDashboardView ? 48 : 32} className="mb-4 text-gray-400" />
          <p className="text-base font-medium m-0">Belum ada pelanggan.</p>
          {!isDashboardView && (
            <p className="text-sm mt-2">Mulai dengan menambahkan pelanggan baru.</p>
          )}
        </div>
      )}
      {customers.length > 0 && (
        <ul className="list-none p-0 m-0">
          {customers.map(customer => (
            <li 
              key={customer.id} 
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <img
                  src={customer.avatarUrl || `https://ui-avatars.com/api/?name=${customer.firstName}+${customer.lastName}&background=random&size=128`}
                  alt={`${customer.firstName} ${customer.lastName}`}
                  className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200"
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{customer.email}</div>
                </div>
              </div>
              {/* Jika tidak di dashboard, mungkin tampilkan tombol aksi atau link detail */}
              {!isDashboardView && (
                <Link to={`/customers/${customer.id}`} className="text-indigo-600 no-underline hover:text-indigo-700" title="Lihat Detail">
                  <MdChevronRight size={24} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Tombol "Lihat Semua" hanya jika bukan tampilan dashboard dan ada pelanggan */}
      {!isDashboardView && customers.length > 0 && (
        <div className={`text-center mt-5 pt-5 ${customers.length > 0 ? 'border-t border-gray-200' : ''}`}>
          <Link
            to="/customers"
            className="text-indigo-600 no-underline text-sm font-medium py-2 px-4 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors inline-block"
          >
            Lihat Semua Pelanggan
          </Link>
        </div>
      )}
    </div>
  );
};

export default CustomerSection;
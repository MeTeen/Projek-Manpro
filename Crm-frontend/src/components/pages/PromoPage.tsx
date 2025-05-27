// src/pages/PromoPage.tsx (Contoh Struktur Dasar)
import React, { useState, useEffect, useContext, useMemo } from 'react';
import Header from '../dashboard/Header'; // Sesuaikan path
import Sidebar from '../dashboard/Sidebar'; // Sesuaikan path
import { EditModal } from '../common/EditModal'; // Sesuaikan path
import promoService, { Promo, PromoInput, AssignPromoInput } from '../../services/promoService'; // Sesuaikan path
import customerService, { Customer } from '../../services/customerService'; // Untuk assign
import AuthContext from '../../context/AuthContext'; // Untuk role check
import { MdEdit, MdDelete, MdAdd, MdPersonAdd } from 'react-icons/md';
import Select from 'react-select';
import { formatPrice } from '../../utils/formatters';
import PromoForm from '../forms/PromoForm';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'; // Pastikan ini sesuai dengan konfigurasi Anda

const styles = {
    actionButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#5E5CEB' },
    tableCell: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #e5e7eb' },
    tableHeader: { padding: '12px 16px', textAlign: 'left' as 'left', fontWeight: 600, color: '#374151', fontSize: '14px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
};

const PromoPage: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [promos, setPromos] = useState<Promo[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]); // Untuk dropdown assign
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<PromoInput>>({});
    const [assignFormData, setAssignFormData] = useState<{ customerId: number | null }>({ customerId: null });

    const authContext = useContext(AuthContext);
    const currentUserRole = authContext?.user?.role; // 'admin' atau 'super_admin'

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    // Buat customerOptions menggunakan useMemo agar tidak dihitung ulang setiap render kecuali customers berubah
    const customerOptions = useMemo(() => customers
        .filter(customer => typeof customer.id === 'number')
        .map(customer => ({
            value: customer.id as number,
            label: `${customer.firstName} ${customer.lastName}`, // Label dasar untuk pencarian
            // Sertakan data customer lengkap untuk digunakan di formatOptionLabel
            customerData: customer
        })), [customers]);


    // Komponen kustom untuk menampilkan setiap opsi di dropdown
    const formatOptionLabel = ({ value, label, customerData }: { value: number, label: string, customerData: Customer }) => {
        let imageUrl = 'https://via.placeholder.com/40?text=N/A'; // Fallback default

        if (customerData.avatarUrl) {
            if (customerData.avatarUrl.startsWith('http://') || customerData.avatarUrl.startsWith('https://')) {
                // Jika sudah URL lengkap, gunakan langsung
                imageUrl = customerData.avatarUrl;
            } else if (customerData.avatarUrl.startsWith('/')) {
                // Jika path relatif dari root server (misal: /uploads/avatars/file.png)
                imageUrl = `${BACKEND_URL}${customerData.avatarUrl}`;
            } else {
                // Asumsi hanya nama file (misal: file.png), kita tambahkan path standar
                imageUrl = `${BACKEND_URL}/uploads/avatars/${customerData.avatarUrl}`;
            }
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 0' }}>
                <img
                    src={imageUrl}
                    alt={`${customerData.firstName} ${customerData.lastName}`}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        marginRight: '12px',
                        objectFit: 'cover',
                        border: '1px solid #eee'
                    }}
                    onError={(e) => {
                        // Jika terjadi error saat memuat gambar (misal, file tidak ada di server),
                        // ganti dengan placeholder untuk menghindari ikon gambar rusak.
                        (e.target as HTMLImageElement).onerror = null; // mencegah loop error jika placeholder juga error
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=N/A';
                    }}
                />
                <div style={{ lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {customerData.firstName} {customerData.lastName}
                    </div>
                    <div style={{ fontSize: '0.85em', color: 'grey' }}>
                        <span>Total Transaction: {customerData.purchaseCount || 0}</span>
                        <span style={{ margin: '0 5px' }}>|</span>
                        <span>Spend: {formatPrice(customerData.totalSpent || 0)}</span>
                    </div>
                </div>
            </div>
        );
    };

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const data = await promoService.getAllPromos();
            setPromos(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load promos');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => { // Untuk modal assign
        try {
            const data = await customerService.getAllCustomers();
            setCustomers(data);
        } catch (err) {
            console.error("Failed to load customers for assignment", err);
        }
    };

    useEffect(() => {
        fetchPromos();
        if (currentUserRole === 'admin' || currentUserRole === 'super_admin') {
            fetchCustomers(); // Hanya fetch jika bisa assign
        }
    }, [currentUserRole]);

    const handleAddClick = () => {
        setSelectedPromo(null);
        setFormData({
            name: '',
            type: 'percentage',
            value: 0,
            description: '',
            startDate: new Date().toISOString().split('T')[0], // Default today
            endDate: '',
            isActive: true,
        });
        setIsAddEditModalOpen(true);
    };

    const handleEditClick = (promo: Promo) => {
        setSelectedPromo(promo);
        setFormData({
            name: promo.name,
            type: promo.type,
            value: promo.value,
            description: promo.description || '',
            startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
            endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
            isActive: promo.isActive,
        });
        setIsAddEditModalOpen(true);
    };

    const handleDeleteClick = (promo: Promo) => {
        setSelectedPromo(promo);
        setIsDeleteModalOpen(true);
    };

    // handleInputChange sekarang menjadi onFormChange untuk PromoForm
    const handlePromoFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'value' ? parseFloat(value) : value)
        }));
    };

    const handleAssignClick = (promo: Promo) => {
        setSelectedPromo(promo);
        setAssignFormData({ customerId: null });
        setIsAssignModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'value' ? parseFloat(value) : value)
        }));
    };

    const handleAddEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.type || formData.value === undefined) {
            alert("Name, type, and value are required.");
            return;
        }

        // Pastikan value adalah angka
        const payload: PromoInput = {
            ...formData,
            value: Number(formData.value) || 0,
            startDate: formData.startDate || null, // Kirim null jika kosong
            endDate: formData.endDate || null,     // Kirim null jika kosong
        } as PromoInput;


        try {
            setLoading(true);
            if (selectedPromo?.id) { // Update
                await promoService.updatePromo(selectedPromo.id, payload);
                alert('Promo updated successfully');
            } else { // Create
                await promoService.createPromo(payload);
                alert('Promo created successfully');
            }
            setIsAddEditModalOpen(false);
            fetchPromos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save promo');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPromo?.id) return;
        try {
            setLoading(true);
            await promoService.deletePromo(selectedPromo.id);
            setIsDeleteModalOpen(false);
            fetchPromos();
            alert('Promo deleted successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete promo');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPromo?.id || !assignFormData.customerId) {
            alert("Please select a customer.");
            return;
        }
        try {
            setLoading(true);
            await promoService.assignPromoToCustomer({ promoId: selectedPromo.id, customerId: assignFormData.customerId });
            alert('Promo assigned successfully');
            setIsAssignModalOpen(false);
            fetchPromos(); // Refresh untuk lihat updated eligibleCustomers (jika di-display)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign promo');
        } finally {
            setLoading(false);
        }
    };
    // Render UI (mirip ProductPage.tsx)
    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 30px' }}>
                <Header />
                <div style={{ marginBottom: '24px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ padding: '0 0px 0 5px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Promos</h1>
                        <p style={{ color: '#6b7280', marginTop: '8px' }}>Manage your promotional offers</p>
                    </div>
                    {currentUserRole === 'super_admin' && (
                        <button onClick={handleAddClick} style={{ backgroundColor: '#5E5CEB', color: 'white', padding: '10px 16px', borderRadius: '4px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                            <MdAdd size={18} /> Add Promo
                        </button>
                    )}
                </div>

                {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Name</th>
                                <th style={styles.tableHeader}>Type</th>
                                <th style={styles.tableHeader}>Value</th>
                                <th style={styles.tableHeader}>Active</th>
                                <th style={styles.tableHeader}>Start Date</th>
                                <th style={styles.tableHeader}>End Date</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading promos...</td></tr>
                            ) : promos.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>No promos found.</td></tr>
                            ) : (
                                promos.map(promo => (
                                    <tr key={promo.id}>
                                        <td style={styles.tableCell}>{promo.name}</td>
                                        <td style={styles.tableCell}>{promo.type}</td>
                                        <td style={styles.tableCell}>{promo.type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}</td>
                                        <td style={styles.tableCell}>{promo.isActive ? 'Yes' : 'No'}</td>
                                        <td style={styles.tableCell}>{promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'N/A'}</td>
                                        <td style={styles.tableCell}>{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'N/A'}</td>
                                        <td style={{ ...styles.tableCell, textAlign: 'right' as 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
                                                    <button onClick={() => handleAssignClick(promo)} title="Assign to Customer" style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }}><MdPersonAdd size={18} /></button>
                                                )}
                                                {currentUserRole === 'super_admin' && (
                                                    <>
                                                        <button onClick={() => handleEditClick(promo)} title="Edit Promo" style={{ background: 'none', border: 'none', color: '#5E5CEB', cursor: 'pointer' }}><MdEdit size={18} /></button>
                                                        <button onClick={() => handleDeleteClick(promo)} title="Delete Promo" style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><MdDelete size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add/Edit Promo Modal */}
                <EditModal
                    isOpen={isAddEditModalOpen}
                    title={selectedPromo ? "Edit Promo" : "Add New Promo"}
                    onClose={() => setIsAddEditModalOpen(false)}
                    onSubmit={handleAddEditSubmit}
                >
                    <PromoForm formData={formData} onFormChange={handlePromoFormChange} />
                </EditModal>

                {/* Delete Promo Modal */}
                {isDeleteModalOpen && selectedPromo && (
                    <EditModal // Re-use EditModal structure for simplicity or create a dedicated ConfirmModal
                        isOpen={isDeleteModalOpen}
                        title="Delete Promo"
                        onClose={() => setIsDeleteModalOpen(false)}
                        onSubmit={handleDeleteConfirm} // onSubmit akan jadi onConfirm di sini
                    >
                        <p>Are you sure you want to delete promo "{selectedPromo.name}"?</p>
                    </EditModal>
                )}

                {/* Assign Promo to Customer Modal */}
                <EditModal
                    isOpen={isAssignModalOpen} // Pastikan ini dikontrol oleh state yang benar
                    title={`Assign Promo: ${selectedPromo?.name}`} // selectedPromo juga dari state
                    onClose={() => setIsAssignModalOpen(false)} // Pastikan setIsAssignModalOpen didefinisikan
                    onSubmit={handleAssignSubmit} // Pastikan handleAssignSubmit didefinisikan
                // submitText="Assign Promo" // Anda bisa menambahkan prop ini jika EditModal mendukungnya
                >
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                            Select Customer*
                        </label>
                        <Select
                            options={customerOptions}
                            formatOptionLabel={formatOptionLabel}
                            value={customerOptions.find(option => option.value === assignFormData.customerId)}
                            onChange={(selectedOption) => {
                                const customerId = selectedOption ? selectedOption.value : null;
                                setAssignFormData({ customerId });
                            }}
                            isLoading={!customers.length && loading}
                            placeholder="Cari atau pilih customer..."
                            isClearable
                            menuPosition="fixed" // ⬅️ penting agar dropdown tidak ketahan modal
                            menuShouldScrollIntoView={false}
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    minHeight: '44px',
                                    borderRadius: '6px',
                                    borderColor: '#3B82F6',
                                    boxShadow: '0 0 0 1px #3B82F6',
                                    '&:hover': {
                                        borderColor: '#2563EB',
                                    },
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    padding: '8px 12px',
                                    backgroundColor: state.isFocused ? '#EEF2FF' : 'white',
                                    color: '#111827',
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999, // ⬅️ pastikan dropdown muncul di atas modal
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                }),
                                menuList: (provided) => ({
                                    ...provided,
                                    maxHeight: '250px', // batas agar tidak kepanjangan
                                }),
                            }}
                        />
                    </div>
                    {/* Komentar Anda sebelumnya: 
                    "Tambahkan juga opsi untuk remove promo from customer jika sudah ter-assign, 
                    atau daftar customer yg sudah ter-assign"
                    Ini bisa jadi fitur tambahan di sini, misal menampilkan daftar customer yang sudah
                    mendapatkan promo ini dengan tombol untuk 'unassign'.
                */}
                </EditModal>

            </div>
        </div>
    );
};

export default PromoPage;
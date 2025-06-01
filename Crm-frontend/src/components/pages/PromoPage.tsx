// src/pages/PromoPage.tsx (Contoh Struktur Dasar)
import React, { useState, useEffect, useContext, useMemo } from 'react';
import Header from '../dashboard/Header'; // Sesuaikan path
import Sidebar from '../dashboard/Sidebar'; // Sesuaikan path
import { ConfirmModal, FormModal } from '../ui'; // Updated imports
import promoService, { Promo, PromoInput } from '../../services/promoService'; // Sesuaikan path
import customerService, { Customer } from '../../services/customerService'; // Untuk assign
import AuthContext from '../../context/AuthContext'; // Untuk role check
import { MdEdit, MdDelete, MdAdd, MdPersonAdd } from 'react-icons/md';
import Select from 'react-select';
import { formatPrice, BACKEND_URL } from '../../utils/formatters';
import PromoForm from '../forms/PromoForm';

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

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);    // Buat customerOptions menggunakan useMemo agar tidak dihitung ulang setiap render kecuali customers berubah
    const customerOptions = useMemo(() => customers
        // Filter out any invalid customers
        .filter(customer => typeof customer?.id === 'number')
        .map(customer => {
            // Ensure we have valid string values for names to prevent issues
            const firstName = customer.firstName || '';
            const lastName = customer.lastName || '';
            const label = `${firstName} ${lastName}`.trim() || 'Customer';
            
            return {
                value: customer.id as number,
                label: label, // Label dasar untuk pencarian
                // Sertakan data customer lengkap untuk digunakan di formatOptionLabel
                customerData: customer
            };
        }), [customers]);
    // Komponen kustom untuk menampilkan setiap opsi di dropdown
    const formatOptionLabel = ({ customerData }: { value: number, label: string, customerData: Customer }) => {
        // Use initials as default fallback instead of placeholder.com
        const getInitials = () => {
            const first = customerData.firstName ? customerData.firstName.charAt(0) : '';
            const last = customerData.lastName ? customerData.lastName.charAt(0) : '';
            return (first + last).toUpperCase() || 'NA';
        };
        
        // Create data URL for fallback avatar with initials
        const createFallbackAvatar = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 40;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#E5E7EB'; // Light gray background
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = 'bold 16px sans-serif';
                ctx.fillStyle = '#6B7280'; // Text color
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(getInitials(), canvas.width/2, canvas.height/2);
                return canvas.toDataURL();
            }
            return ''; // Empty string as last resort
        };
        
        let imageUrl = createFallbackAvatar();

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
                        // If image loading fails, use our canvas-generated fallback with initials
                        (e.target as HTMLImageElement).onerror = null; // prevent error loop
                        (e.target as HTMLImageElement).src = createFallbackAvatar();
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
    };const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
              // Use Promise.allSettled for parallel loading with error handling
            const isAdminUser = currentUserRole === 'admin' || currentUserRole === 'super_admin';
            
            const promises: Promise<any>[] = [
                promoService.getAllPromos(false), // Don't include customers for basic list
            ];
            
            // Only fetch customers if user has admin privileges
            if (isAdminUser) {
                promises.push(customerService.getCustomersBasicInfo(['id', 'firstName', 'lastName']));
            }
            
            const results = await Promise.allSettled(promises);
            
            // Handle promos result
            if (results[0].status === 'fulfilled') {
                setPromos(results[0].value);
            } else {
                console.error('Failed to load promos:', results[0].reason);
                setError('Failed to load promos');
            }
            
            // Handle customers result (if applicable)
            if (isAdminUser && results[1]) {
                if (results[1].status === 'fulfilled') {
                    setCustomers(results[1].value as Customer[]);
                } else {
                    console.error('Failed to load customers:', results[1].reason);
                    // Don't set error here as promos are more important
                }
            }
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const data = await promoService.getAllPromos(false);
            setPromos(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load promos');        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Use the optimized parallel fetch
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
    };    const handleAssignClick = (promo: Promo) => {
        setSelectedPromo(promo);
        setAssignFormData({ customerId: null });
        setIsAssignModalOpen(true);
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
    };    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPromo?.id) {
            setError("No promo selected. Please try again.");
            return;
        }
        
        if (!assignFormData.customerId) {
            alert("Please select a customer.");
            return;
        }
        
        try {
            setLoading(true);
            await promoService.assignPromoToCustomer({ 
                promoId: selectedPromo.id, 
                customerId: assignFormData.customerId 
            });
            alert('Promo assigned successfully');
            setIsAssignModalOpen(false);
            fetchPromos(); // Refresh to see updated eligibleCustomers (if displayed)
        } catch (err) {
            console.error("Error assigning promo:", err);
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

                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
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
                                    <tr key={promo.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={styles.tableCell}>{promo.name}</td>
                                        <td style={styles.tableCell}>{promo.type}</td>
                                        <td style={styles.tableCell}>{promo.type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString('id-ID')}`}</td>
                                        <td style={styles.tableCell}>{promo.isActive ? 'Yes' : 'No'}</td>
                                        <td style={styles.tableCell}>{promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'N/A'}</td>
                                        <td style={styles.tableCell}>{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'N/A'}</td>
                                        <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
                                                    <button onClick={() => handleAssignClick(promo)} title="Assign to Customer" style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', transition: 'background 0.2s' }}><MdPersonAdd size={18} /></button>
                                                )}
                                                {currentUserRole === 'super_admin' && (
                                                    <>
                                                        <button onClick={() => handleEditClick(promo)} title="Edit Promo" style={{ background: 'none', border: 'none', color: '#5E5CEB', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', transition: 'background 0.2s' }}><MdEdit size={18} /></button>
                                                        <button onClick={() => handleDeleteClick(promo)} title="Delete Promo" style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', transition: 'background 0.2s' }}><MdDelete size={18} /></button>
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
                </div>                {/* Add/Edit Promo Modal */}
                <FormModal
                    isOpen={isAddEditModalOpen}
                    onClose={() => setIsAddEditModalOpen(false)}
                    onSubmit={handleAddEditSubmit}
                    title={selectedPromo ? "Edit Promo" : "Add New Promo"}
                    submitText={loading ? 'Saving...' : 'Save Changes'}
                    loading={loading}                    icon={<MdEdit size={22} style={{ color: '#4f46e5' }} />}
                >
                    <PromoForm formData={formData} onFormChange={handlePromoFormChange} />
                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#b91c1c',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}
                </FormModal>{/* Delete Promo Modal */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Promo"
                    message={`Are you sure you want to delete promo "${selectedPromo?.name}"? This action cannot be undone.`}
                    confirmText="Delete Promo"
                    cancelText="Cancel"
                    variant="danger"
                    loading={loading}
                    icon={<MdDelete size={22} />}
                />                {/* Assign Promo to Customer Modal */}
                <FormModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    onSubmit={handleAssignSubmit}
                    title={`Assign Promo: ${selectedPromo?.name}`}
                    submitText={loading ? 'Assigning...' : 'Assign Promo'}
                    loading={loading}
                    disabled={!assignFormData.customerId}                    
                    icon={<MdPersonAdd size={22} style={{ color: '#4f46e5' }} />}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
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
                                placeholder="Search or select a customer..."
                                isClearable
                                menuPosition="fixed"
                                menuShouldBlockScroll={true}
                                menuPortalTarget={document.body}
                                menuPlacement="auto"
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
                                        zIndex: 9999,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    }),
                                    menuList: (provided) => ({
                                        ...provided,
                                        maxHeight: '250px',
                                    }),
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999
                                    }),
                                }}
                            />                        </div>
                        {error && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>
                </FormModal>
            </div>
        </div>
    );
};

export default PromoPage;
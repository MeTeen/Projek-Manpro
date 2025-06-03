// src/pages/PromoPage.tsx (Contoh Struktur Dasar)
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { toast } from 'react-toastify';
import Header from '../dashboard/Header'; // Sesuaikan path
import Sidebar from '../dashboard/Sidebar'; // Sesuaikan path
import { ConfirmModal, FormModal } from '../ui'; // Updated imports
import promoService, { Promo, PromoInput } from '../../services/promoService'; // Sesuaikan path
import customerService, { Customer } from '../../services/customerService'; // Untuk dropdown assign
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
    const [assignFormData, setAssignFormData] = useState<{ customerIds: number[] }>({ customerIds: [] }); const authContext = useContext(AuthContext);
    const currentUserRole = authContext?.user?.role; // 'admin' atau 'super_admin'

    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    // Buat customerOptions menggunakan useMemo agar tidak dihitung ulang setiap render kecuali customers berubah
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
        }), [customers]);    // Helper function to determine if tooltip should be shown
    const shouldShowTooltip = (promo: Promo, status: string): boolean => {
        // Only show tooltip if promo has eligible customers
        if (!promo.eligibleCustomers || promo.eligibleCustomers.length === 0) {
            return false;
        }

        // Show tooltip only for these statuses:
        // - Assigned to (active promos that are assigned)
        // - Used by (partially used promos)
        // - Fully Used (completely used promos)
        // Do NOT show for: Inactive, Expired, Available, Scheduled
        return status.includes('Assigned to') ||
            status.includes('Used by') ||
            status.includes('Fully Used');
    };

    // Helper function to get comprehensive status for multiple customers
    const getPromoStatus = (promo: Promo): string => {
        const now = new Date();
        const startDate = promo.startDate ? new Date(promo.startDate) : null;
        const endDate = promo.endDate ? new Date(promo.endDate) : null;

        // Priority 1: Check if promo is expired (end date passed) - HIGHEST PRIORITY
        if (endDate && now > endDate) {
            return 'Expired';
        }

        // Priority 2: Check if promo is not active
        if (!promo.isActive) {
            return 'Inactive';
        }

        // Priority 3: Check if promo hasn't started yet
        if (startDate && now < startDate) {
            return 'Scheduled';
        }

        // Priority 4: Check usage status for assigned customers
        if (promo.eligibleCustomers && promo.eligibleCustomers.length > 0) {
            const usedCustomers = promo.eligibleCustomers.filter(customer =>
                customer.promoAssignment?.isUsed === true
            );
            const totalAssigned = promo.eligibleCustomers.length;

            // If all assigned customers have used it
            if (usedCustomers.length === totalAssigned) {
                return `Fully Used (${totalAssigned}/${totalAssigned})`;
            }

            // If some customers have used it
            if (usedCustomers.length > 0) {
                return `Used by ${usedCustomers.length}/${totalAssigned}`;
            }

            // If assigned but none have used it yet, show assigned count
            return `Assigned to ${totalAssigned} customer${totalAssigned > 1 ? 's' : ''}`;
        }

        // Priority 5: Check assignment status
        if (!promo.eligibleCustomers || promo.eligibleCustomers.length === 0) {
            return 'Available';
        }

        // If we reach here, it means promo is assigned but not used yet
        return 'Assigned';
    };
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
                ctx.fillText(getInitials(), canvas.width / 2, canvas.height / 2);
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
    }; const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Use Promise.allSettled for parallel loading with error handling
            const isAdminUser = currentUserRole === 'admin' || currentUserRole === 'super_admin';

            const promises: Promise<any>[] = [
                promoService.getAllPromos(true), // Include customers to get usage status
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
    }; const fetchPromos = async () => {
        try {
            setLoading(true);
            // Fetch promos with customer usage information
            const data = await promoService.getAllPromos(true); // Include customers to get usage status
            setPromos(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load promos');
        } finally {
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
    }; const handleAssignClick = (promo: Promo) => {
        setSelectedPromo(promo);
        setAssignFormData({ customerIds: [] });
        setIsAssignModalOpen(true);
    }; const handleAddEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.type || formData.value === undefined) {
            toast.error("Name, type, and value are required.");
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
                toast.success('Promo updated successfully');
            } else { // Create
                await promoService.createPromo(payload);
                toast.success('Promo created successfully');
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
            setLoading(true); await promoService.deletePromo(selectedPromo.id);
            setIsDeleteModalOpen(false);
            fetchPromos();
            toast.success('Promo deleted successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete promo');
        } finally {
            setLoading(false);
        }
    }; const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPromo?.id) {
            setError("No promo selected. Please try again.");
            return;
        }
        if (!assignFormData.customerIds || assignFormData.customerIds.length === 0) {
            toast.error("Please select at least one customer.");
            return;
        }

        try {
            setLoading(true);
            const assignmentPromises = assignFormData.customerIds.map(customerId =>
                promoService.assignPromoToCustomer({
                    promoId: selectedPromo.id,
                    customerId: customerId
                })
            );

            await Promise.all(assignmentPromises);
            toast.success(`Promo assigned successfully to ${assignFormData.customerIds.length} customer${assignFormData.customerIds.length > 1 ? 's' : ''}`);
            setIsAssignModalOpen(false);
            fetchPromos(); // Refresh to see updated eligibleCustomers
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
            {/* Add CSS for tooltip hover effect */}            <style>{`
                .tooltip-trigger:hover .tooltip {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateX(-50%) translateY(0) !important;
                }
                .table-container {
                    overflow: visible !important;
                }
                .table-scroll {
                    overflow-x: auto;
                    overflow-y: visible;
                }
                .tooltip {
                    z-index: 9999 !important;
                    position: fixed !important;
                }
                .tooltip-trigger {
                    position: relative;
                }
                .tooltip-trigger:hover {
                    z-index: 100;
                }
            `}</style>

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

                {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} className="table-container">
                    <div style={{ overflowX: 'auto' }} className="table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead style={{ backgroundColor: '#f9fafb' }}>
                                <tr>
                                    <th style={styles.tableHeader}>Name</th>
                                    <th style={styles.tableHeader}>Type</th>
                                    <th style={styles.tableHeader}>Value</th>
                                    <th style={styles.tableHeader}>Active</th>
                                    <th style={styles.tableHeader}>Start Date</th>
                                    <th style={styles.tableHeader}>End Date</th>
                                    <th style={styles.tableHeader}>Status</th>
                                    <th style={styles.tableHeader}>Actions</th>                            </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading promos...</td></tr>
                                ) : promos.length === 0 ? (
                                    <tr><td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>No promos found.</td></tr>
                                ) : (
                                    promos.map(promo => {
                                        const status = getPromoStatus(promo);
                                        return (
                                            <tr key={promo.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={styles.tableCell}>{promo.name}</td>
                                                <td style={styles.tableCell}>{promo.type}</td>
                                                <td style={styles.tableCell}>
                                                    {promo.type === 'percentage'
                                                        ? `${promo.value}%`
                                                        : `Rp ${Math.round(promo.value).toLocaleString('id-ID')}`
                                                    }
                                                </td>
                                                <td style={styles.tableCell}>{promo.isActive ? 'Yes' : 'No'}</td>
                                                <td style={styles.tableCell}>{promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'N/A'}</td>
                                                <td style={styles.tableCell}>{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'N/A'}</td>
                                                <td style={styles.tableCell}>
                                                    <div style={{ position: 'relative', display: 'inline-block' }} className="tooltip-trigger">
                                                        <span
                                                            style={{
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                cursor: shouldShowTooltip(promo, status) ? 'pointer' : 'default',
                                                                position: 'relative',
                                                                transition: 'all 0.2s ease',
                                                                backgroundColor: (() => {
                                                                    switch (true) {
                                                                        case status === 'Available': return '#D1FAE5'; // Light green
                                                                        case status.includes('Assigned to'): return '#DBEAFE'; // Light blue
                                                                        case status.includes('Used by') && !status.includes('Fully'): return '#FEF3C7'; // Light yellow
                                                                        case status.includes('Fully Used'): return '#E0E7FF'; // Light purple
                                                                        case status === 'Expired': return '#FEE2E2'; // Light red
                                                                        case status === 'Inactive': return '#F3F4F6'; // Light gray
                                                                        case status === 'Scheduled': return '#E0F2FE'; // Light sky blue
                                                                        default: return '#F3F4F6';
                                                                    }
                                                                })(),
                                                                color: (() => {
                                                                    switch (true) {
                                                                        case status === 'Available': return '#065F46'; // Dark green
                                                                        case status.includes('Assigned to'): return '#1E40AF'; // Dark blue
                                                                        case status.includes('Used by') && !status.includes('Fully'): return '#92400E'; // Dark amber
                                                                        case status.includes('Fully Used'): return '#5B21B6'; // Dark purple
                                                                        case status === 'Expired': return '#B91C1C'; // Dark red
                                                                        case status === 'Inactive': return '#6B7280'; // Dark gray
                                                                        case status === 'Scheduled': return '#0369A1'; // Dark sky blue
                                                                        default: return '#6B7280';
                                                                    }
                                                                })()
                                                            }} onMouseEnter={(e) => {
                                                                if (shouldShowTooltip(promo, status)) {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

                                                                    // Position tooltip
                                                                    const tooltip = e.currentTarget.parentElement?.querySelector('.tooltip') as HTMLElement;
                                                                    if (tooltip) {
                                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                                        tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
                                                                        tooltip.style.left = `${rect.left + rect.width / 2}px`;
                                                                    }
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (shouldShowTooltip(promo, status)) {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }
                                                            }}
                                                        >
                                                            {status}                                                        {shouldShowTooltip(promo, status) && (
                                                                <span style={{
                                                                    marginLeft: '4px',
                                                                    fontSize: '10px',
                                                                    opacity: 0.7
                                                                }}>
                                                                </span>
                                                            )}
                                                        </span>                                                      {/* Custom Modern Tooltip */}
                                                        {shouldShowTooltip(promo, status) && (<div style={{
                                                            position: 'fixed',
                                                            top: 'auto',
                                                            bottom: 'auto',
                                                            left: '50%',
                                                            marginTop: '8px',
                                                            background: 'rgba(255, 255, 255, 0.25)',
                                                            color: '#1f2937',
                                                            padding: '8px 14px 10px 14px',
                                                            borderRadius: '10px',
                                                            fontSize: '13px',
                                                            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                                                            opacity: 0,
                                                            visibility: 'hidden',
                                                            zIndex: 9999,
                                                            width: 'auto',
                                                            maxWidth: '400px',
                                                            whiteSpace: 'nowrap',
                                                            lineHeight: '1.6',
                                                            backdropFilter: 'blur(16px) saturate(180%)',
                                                            border: '1px solid rgba(255, 255, 255, 0.125)'
                                                        }} className="tooltip"
                                                        >
                                                            {/* Header */}                                                            <div style={{
                                                                fontWeight: '600',
                                                                marginBottom: '8px',
                                                                fontSize: '14px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                borderBottom: '1px solid rgba(0,0,0,0.1)',
                                                                paddingBottom: '2px'
                                                            }}><span style={{ marginRight: '6px' }}>👥</span>
                                                                Assigned Customers ({promo.eligibleCustomers?.length || 0})
                                                            </div>                                                              {/* Customer List */}
                                                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                                {promo.eligibleCustomers?.map((customer, index) => {
                                                                    const name = `${customer.firstName} ${customer.lastName}`.trim();
                                                                    const isUsed = customer.promoAssignment?.isUsed;

                                                                    return (<div key={index} style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        marginBottom: index < promo.eligibleCustomers!.length - 1 ? '8px' : '0',
                                                                        padding: '6px 8px',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                                        transition: 'background-color 0.2s ease'
                                                                    }}>
                                                                        <div style={{
                                                                            marginRight: '12px',
                                                                            flex: 1,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap'
                                                                        }}>
                                                                            <span style={{
                                                                                fontWeight: '500',
                                                                                fontSize: '13px'
                                                                            }}>
                                                                                {name}
                                                                            </span>
                                                                        </div>                                                                            <span style={{
                                                                            padding: '4px 8px',
                                                                            borderRadius: '3px',
                                                                            fontSize: '10px',
                                                                            fontWeight: '600',
                                                                            backgroundColor: isUsed ? '#10B981' : '#F59E0B',
                                                                            color: 'white',
                                                                            flexShrink: 0,
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                        }}>
                                                                            {isUsed ? '✅ Used' : '⏳ Pending'}
                                                                        </span>
                                                                    </div>
                                                                    );
                                                                })}
                                                            </div>                                                            {/* Arrow */}                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '100%',
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                width: 0,
                                                                height: 0,
                                                                borderLeft: '6px solid transparent',
                                                                borderRight: '6px solid transparent',
                                                                borderBottom: '6px solid rgba(255, 255, 255, 0.3)'
                                                            }} />
                                                        </div>
                                                        )}                                                </div>
                                                </td>
                                                <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (<button
                                                            onClick={() => handleAssignClick(promo)}
                                                            title={
                                                                status === 'Expired' ? "Promo has expired and cannot be assigned" :
                                                                    status === 'Inactive' ? "Promo is inactive and cannot be assigned" :
                                                                        status.includes('Fully Used') ? "Promo has been fully used and cannot be reassigned" :
                                                                            "Assign to Customer(s)"
                                                            }
                                                            disabled={status === 'Expired' || status === 'Inactive' || status.includes('Fully Used')}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: (status === 'Expired' || status === 'Inactive' || status.includes('Fully Used')) ? '#9CA3AF' : '#10B981',
                                                                cursor: (status === 'Expired' || status === 'Inactive' || status.includes('Fully Used')) ? 'not-allowed' : 'pointer',
                                                                padding: '6px 8px',
                                                                borderRadius: '6px',
                                                                transition: 'all 0.2s ease',
                                                                opacity: (status === 'Expired' || status === 'Inactive' || status.includes('Fully Used')) ? 0.5 : 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!(status === 'Expired' || status === 'Inactive' || status.includes('Fully Used'))) {
                                                                    e.currentTarget.style.backgroundColor = '#D1FAE5';
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!(status === 'Expired' || status === 'Inactive' || status.includes('Fully Used'))) {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }
                                                            }}
                                                        >
                                                            <MdPersonAdd size={18} />
                                                        </button>
                                                        )}                                                    {currentUserRole === 'super_admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditClick(promo)}
                                                                    title="Edit Promo"
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#5E5CEB',
                                                                        cursor: 'pointer',
                                                                        padding: '6px 8px',
                                                                        borderRadius: '6px',
                                                                        transition: 'all 0.2s ease',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#EEF2FF';
                                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                        e.currentTarget.style.transform = 'scale(1)';
                                                                    }}
                                                                >
                                                                    <MdEdit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteClick(promo)}
                                                                    title="Delete Promo"
                                                                    style={{
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#EF4444',
                                                                        cursor: 'pointer',
                                                                        padding: '6px 8px',
                                                                        borderRadius: '6px',
                                                                        transition: 'all 0.2s ease',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#FEE2E2';
                                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                        e.currentTarget.style.transform = 'scale(1)';
                                                                    }}
                                                                >
                                                                    <MdDelete size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Promo Modal */}                <FormModal
                    isOpen={isAddEditModalOpen}
                    onClose={() => setIsAddEditModalOpen(false)}
                    onSubmit={handleAddEditSubmit}
                    title={selectedPromo ? "Edit Promo" : "Add New Promo"}
                    submitText={loading ? 'Saving...' : 'Save Changes'}
                    loading={loading}
                    icon={<MdEdit size={22} style={{ color: '#4f46e5' }} />}
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
                    disabled={!assignFormData.customerIds || assignFormData.customerIds.length === 0}
                    icon={<MdPersonAdd size={22} style={{ color: '#4f46e5' }} />}
                >                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Select Customers* (Multiple Selection Allowed)
                            </label>
                            <Select
                                isMulti
                                options={customerOptions}
                                formatOptionLabel={formatOptionLabel}
                                value={customerOptions.filter(option => assignFormData.customerIds.includes(option.value))}
                                onChange={(selectedOptions) => {
                                    const customerIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                    setAssignFormData({ customerIds });
                                }}
                                isLoading={!customers.length && loading}
                                placeholder="Search and select customers..."
                                isClearable
                                closeMenuOnSelect={false}
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
                                    multiValue: (provided) => ({
                                        ...provided,
                                        backgroundColor: '#EEF2FF',
                                        borderRadius: '4px',
                                    }),
                                    multiValueLabel: (provided) => ({
                                        ...provided,
                                        color: '#1E40AF',
                                        fontSize: '13px',
                                    }),
                                    multiValueRemove: (provided) => ({
                                        ...provided,
                                        color: '#1E40AF',
                                        ':hover': {
                                            backgroundColor: '#DBEAFE',
                                            color: '#1E3A8A',
                                        },
                                    }),
                                }}
                            /></div>
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
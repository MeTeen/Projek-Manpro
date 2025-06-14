import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import AddNewDropdown from '../../components/dashboard/AddNewDropdown';
import { FormModal, FormInput, FormSelect } from '../../components/ui';
import customerService, { Customer } from '../../services/customerService';
import productService, { Product } from '../../services/productService';
// Pastikan PurchaseInput diimpor dengan definisi yang menyertakan promoId?
import purchaseService, { PurchaseInput, Purchase } from '../../services/purchaseService';
import promoService, { Promo } from '../../services/promoService';
import { MdAdd, MdShoppingCart, MdInfoOutline } from 'react-icons/md';
import Select from 'react-select';
import { BACKEND_URL } from '../../utils/formatters';
import { formatTransactionId } from '../../utils/transactionFormatter';

const TransactionPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]); // Tipe Purchase dari service Anda
  const [loading, setLoading] = useState(true);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // PurchaseInput dari service sekarang seharusnya sudah termasuk promoId? opsional
  const [transactionData, setTransactionData] = useState<PurchaseInput>({
    customerId: 0,
    productId: 0,
    quantity: 1,
    promoId: null, // Inisialisasi promoId
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availablePromos, setAvailablePromos] = useState<Promo[]>([]);
  const [selectedPromoObject, setSelectedPromoObject] = useState<Promo | null>(null);
  // usedPromosInSession bisa dipertimbangkan kembali jika validasi penggunaan promo sepenuhnya di backend
  // Untuk UX, mungkin masih berguna agar admin tidak memilih promo yang sama berulang kali di form yang sama sebelum submit.
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleAddNewClick = () => setIsDropdownOpen(true);
  const handleCustomerCreated = useCallback(() => { fetchData(); }, []);

  // Create customerOptions for react-select with useMemo for performance
  const customerOptions = useMemo(() => customers
    .filter(customer => typeof customer?.id === 'number')
    .map(customer => {
      const firstName = customer.firstName || '';
      const lastName = customer.lastName || '';
      const label = `${firstName} ${lastName}`.trim() || 'Customer';
      
      return {
        value: customer.id as number,
        label: label,
        customerData: customer
      };
    }), [customers]);

  // Format option label for customer select dropdown with avatar
  const formatOptionLabel = ({ customerData }: { value: number, label: string, customerData: Customer }) => {
    const getInitials = () => {
      const first = customerData.firstName ? customerData.firstName.charAt(0) : '';
      const last = customerData.lastName ? customerData.lastName.charAt(0) : '';
      return (first + last).toUpperCase() || 'NA';
    };
    
    const createFallbackAvatar = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getInitials(), canvas.width/2, canvas.height/2);
        return canvas.toDataURL();
      }
      return '';
    };
    
    let imageUrl = createFallbackAvatar();

    if (customerData.avatarUrl) {
      if (customerData.avatarUrl.startsWith('http://') || customerData.avatarUrl.startsWith('https://')) {
        imageUrl = customerData.avatarUrl;
      } else if (customerData.avatarUrl.startsWith('/')) {
        imageUrl = `${BACKEND_URL}${customerData.avatarUrl}`;
      } else {
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
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = createFallbackAvatar();
          }}
        />
        <div style={{ lineHeight: '1.4' }}>
          <div style={{ fontWeight: 'bold', color: '#333' }}>
            {customerData.firstName} {customerData.lastName}
          </div>
          <div style={{ fontSize: '0.85em', color: 'grey' }}>
            <span>Email: {customerData.email || 'N/A'}</span>
            {customerData.phone && (
              <>
                <span style={{ margin: '0 5px' }}>|</span>
                <span>Phone: {customerData.phone}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const fetchData = async () => { /* ... Sama seperti sebelumnya, pastikan mengambil Purchase yang sudah ada promoId & discountAmount ... */
    try {
      setLoading(true);
      setError(null);
      const [purchasesRes, customersRes, productsRes] = await Promise.allSettled([
        purchaseService.getAllPurchases(), // Ini akan mengambil data Purchase termasuk promoId dan discountAmount
        customerService.getAllCustomers(),
        productService.getAllProducts(),
      ]);

      if (purchasesRes.status === 'fulfilled') setPurchases(purchasesRes.value);
      else { console.error('Gagal memuat transaksi:', purchasesRes.reason); setError(prev => `${prev || ''} Gagal memuat transaksi.`); }

      if (customersRes.status === 'fulfilled') setCustomers(customersRes.value);
      else { console.error('Gagal memuat customer:', customersRes.reason); setError(prev => `${prev || ''} Gagal memuat customer.`); }

      if (productsRes.status === 'fulfilled') setProducts(productsRes.value);
      else { console.error('Gagal memuat produk:', productsRes.reason); setError(prev => `${prev || ''} Gagal memuat produk.`); }

    } catch (err) {
      console.error('Error fetchData:', err);
      setError('Terjadi kesalahan saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (isAddModalOpen && transactionData.customerId > 0) {
      const fetchCustomerPromos = async () => {
        try {
          const promosData = await promoService.getAvailablePromosForCustomer(transactionData.customerId);
          setAvailablePromos(promosData);
        } catch (err) {
          console.error("Gagal memuat promo tersedia:", err);
          setAvailablePromos([]);
        }
      };
      fetchCustomerPromos();
    } else {
      setAvailablePromos([]);
      setSelectedPromoObject(null);
      // Jangan reset transactionData.promoId di sini agar pilihan tetap ada jika modal ditutup-buka tanpa ganti customer
    }
  }, [isAddModalOpen, transactionData.customerId]);

  const handleAddTransactionClick = () => {
    setTransactionData({ customerId: 0, productId: 0, quantity: 1, promoId: null });
    setSelectedProduct(null);
    setSelectedPromoObject(null);
    setAvailablePromos([]);
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | null = value;

    if (name === 'customerId' || name === 'productId' || name === 'quantity') {
      processedValue = Number(value) || 0;
    } else if (name === 'promoId') { // Input dropdown promo sekarang langsung bernama 'promoId'
      const promoIdVal = value ? Number(value) : null;
      processedValue = promoIdVal;
      if (promoIdVal) {
        setSelectedPromoObject(availablePromos.find(p => p.id === promoIdVal) || null);
      } else {
        setSelectedPromoObject(null);
      }
    }

    setTransactionData(prev => {
      const updated = { ...prev, [name]: processedValue };
      if (name === 'customerId' && prev.customerId !== updated.customerId) {
        updated.productId = 0;
        updated.promoId = null; // Reset promoId jika customer berubah
        setSelectedProduct(null);
        setSelectedPromoObject(null);
        setAvailablePromos([]);
      }
      if (name === 'productId' && prev.productId !== updated.productId) {
        updated.promoId = null; // Reset promoId jika produk berubah
        setSelectedPromoObject(null);
      }
      return updated;
    });

    if (name === 'productId' && Number(value) > 0) {
      setSelectedProduct(products.find(p => p.id === Number(value)) || null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!transactionData.customerId) { setModalError('Silakan pilih customer'); return; }
    if (!transactionData.productId) { setModalError('Silakan pilih produk'); return; }
    if (transactionData.quantity < 1) { setModalError('Kuantitas minimal 1'); return; }
    if (selectedProduct && selectedProduct.stock < transactionData.quantity) {
      setModalError(`Stok tidak cukup untuk ${selectedProduct.name}. Tersedia: ${selectedProduct.stock}`);
      return;
    }

    // transactionData sekarang sudah berisi promoId jika dipilih
    const dataToSend: PurchaseInput = {
      customerId: transactionData.customerId,
      productId: transactionData.productId,
      quantity: transactionData.quantity,
      promoId: transactionData.promoId, // Kirim promoId ke service
    };

    try {
      setFormSubmitLoading(true);
      console.log('Submitting transaction data (with promoId if selected):', dataToSend);      const response = await purchaseService.createPurchase(dataToSend);      
      setIsAddModalOpen(false);
      fetchData(); // Muat ulang semua data
        // Extract transaction ID from response if available
      const transactionId = response?.id;
      const successMessage = transactionId 
        ? `Transaction ${formatTransactionId(transactionId)} berhasil dicatat!`
        : 'Transaksi berhasil dicatat!';
      
      toast.success(successMessage);
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mencatat transaksi.';
      // Coba parse error dari backend jika ada detail
      if (errorMessage.startsWith('API Error:')) {
        try {
          const errorDetail = errorMessage.substring(errorMessage.indexOf('-') + 2).trim();
          const parsedDetail = JSON.parse(errorDetail); // Coba parse sebagai JSON
          setModalError(parsedDetail.message || parsedDetail.error || errorDetail);
        } catch (parseErr) {
          setModalError(errorMessage);
        }
      } else {
        setModalError(errorMessage);
      }
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const calculatePriceDetails = (): { subTotal: number; discountValue: number; total: number } => {
    if (!selectedProduct) return { subTotal: 0, discountValue: 0, total: 0 };
    const subTotal = selectedProduct.price * transactionData.quantity;
    let discountValue = 0;
    if (selectedPromoObject) {
      if (selectedPromoObject.type === 'percentage') {
        discountValue = subTotal * (selectedPromoObject.value / 100);
      } else if (selectedPromoObject.type === 'fixed_amount') {
        discountValue = selectedPromoObject.value;
      }
      discountValue = Math.min(discountValue, subTotal);
    }
    const total = subTotal - discountValue;
    return { subTotal, discountValue, total };
  };

  const priceDetails = calculatePriceDetails();
  const formatPrice = (price: number): string => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  const getCustomerName = (customerId: number): string => { const c = customers.find(cust => cust.id === customerId); return c ? `${c.firstName} ${c.lastName}` : 'N/A'; };
  const getProductName = (productId: number): string => { const p = products.find(prod => prod.id === productId); return p ? p.name : 'N/A'; };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ flex: 1, overflow: 'auto', transition: 'margin-left 0.3s ease' }}>
        <div style={{ padding: '20px 30px' }}>
          <Header onCustomerCreated={handleCustomerCreated} onAddNewClick={handleAddNewClick} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>            <div style={{ padding: '0 0px 0 5px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Transaction History</h1>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>View and manage customer transactions with promo tracking</p>
            </div>            <button onClick={handleAddTransactionClick} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <MdAdd size={20} /> <span style={{ marginLeft: '5px' }}>Tambah Transaksi</span>
            </button>
          </div>
          {error && !isAddModalOpen && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>                    {['Transaction ID', 'Customer', 'Product', 'Qty', 'Unit Price', 'Discount', 'Total Paid', 'Date', 'Promo Used'].map((header) => (
                      <th key={header} style={{ 
                        padding: '12px 16px', 
                        textAlign: header === 'Qty' || header.includes('Price') || header === 'Discount' || header.includes('Total') ? 'right' : 'left', 
                        borderBottom: '1px solid #e5e7eb', 
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        minWidth: header === 'Discount' ? '120px' : 'auto'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading...</td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
                        {error ? 'Gagal memuat transaksi.' : 'Tidak ada transaksi.'}
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => {                      const totalPaid = (purchase.unitPrice * purchase.quantity) - (purchase.discountAmount || 0);
                      return (
                        <tr key={purchase.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
                            {formatTransactionId(purchase.id)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {purchase.customer ? `${purchase.customer.firstName} ${purchase.customer.lastName}` : getCustomerName(purchase.customerId)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {purchase.product ? purchase.product.name : getProductName(purchase.productId)}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>{purchase.quantity}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            {formatPrice(purchase.unitPrice || 0)}
                          </td>                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: (purchase.discountAmount || 0) > 0 ? '#dc2626' : '#6b7280',
                            fontWeight: (purchase.discountAmount || 0) > 0 ? '600' : '400',
                            whiteSpace: 'nowrap',
                            minWidth: '120px'
                          }}>
                            {(purchase.discountAmount || 0) > 0 
                              ? `- ${formatPrice(purchase.discountAmount || 0)}` 
                              : '-'
                            }
                          </td><td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right', 
                            color: '#059669',
                            fontWeight: '600'
                          }}>
                            {formatPrice(totalPaid)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>                          <td style={{ padding: '12px 16px' }}>                            {purchase.promo ? (
                              <div>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#4f46e5',
                                  fontSize: '13px'
                                }}>
                                  {purchase.promo.name}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#6b7280',
                                  marginTop: '2px'
                                }}>
                                  {purchase.promo.type === 'percentage'
                                    ? `${parseFloat(purchase.promo.value.toString()).toFixed(0)}% OFF`
                                    : `${formatPrice(purchase.promo.value)} OFF`
                                  }
                                </div>
                              </div>
                            ) : purchase.promoId ? (
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#f59e0b',
                                fontStyle: 'italic'
                              }}>
                                Promo ID: {purchase.promoId}
                              </div>
                            ) : (
                              <span style={{ 
                                color: '#9ca3af',
                                fontSize: '12px'
                              }}>
                                No promo
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>          </div>
        </div>
      </div>

      {/* Modal Tambah Transaksi */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}        title="Create New Transaction"
        submitText="💳 Create Transaction"
        loading={formSubmitLoading}
        disabled={!transactionData.productId}        icon={<MdShoppingCart style={{ marginRight: '8px', color: '#4f46e5' }} size={22} />}
      >        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontWeight: 500,
            fontSize: '14px',
            color: '#374151'
          }}>
            Customer: <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
          </label>
          <Select
            options={customerOptions}
            formatOptionLabel={formatOptionLabel}
            value={customerOptions.find(option => option.value === transactionData.customerId) || null}
            onChange={(selectedOption) => {
              const customerId = selectedOption ? selectedOption.value : 0;
              setTransactionData(prev => ({ ...prev, customerId }));
              
              // Reset product selection when customer changes
              if (customerId !== transactionData.customerId) {
                setTransactionData(prev => ({ 
                  ...prev, 
                  customerId,
                  productId: 0,
                  promoId: null 
                }));
                setSelectedProduct(null);
                setSelectedPromoObject(null);
                setAvailablePromos([]);
              }
            }}
            isLoading={loading}
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
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
                '&:focus-within': {
                  borderColor: '#5E5CEB',
                  boxShadow: '0 0 0 1px #5E5CEB',
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
          />
        </div>

        <FormSelect
          name="productId"
          value={transactionData.productId}
          onChange={handleInputChange}
          required
          disabled={!transactionData.customerId}          label="Product:"
        >
          <option value={0}>-- Select Product --</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Stok: {p.stock}) - {formatPrice(p.price)}
            </option>
          ))}
        </FormSelect>        <div style={{ marginBottom: '16px' }}>
          <FormInput
            type="number"
            name="quantity"
            value={transactionData.quantity}
            onChange={handleInputChange}
            min={1}
            required
            disabled={!transactionData.productId}
            label="Quantity:"
          />
        </div>        {/* Promo Selection Dropdown */}
        {transactionData.customerId > 0 && transactionData.productId > 0 && availablePromos.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #0ea5e9', 
              borderRadius: '6px', 
              padding: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                color: '#0369a1',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                🎯 Promo Available for this Customer
              </div>
              <FormSelect
                name="promoId"
                value={transactionData.promoId ?? ''}
                onChange={handleInputChange}
                label=""
              >
                <option value="">-- Select a Promo (Optional) --</option>
                {availablePromos.map(promo => (
                  <option key={promo.id} value={promo.id}>
                    {promo.name} - {promo.type === 'percentage' 
                      ? `${Number(promo.value)}% OFF` 
                      : `${formatPrice(promo.value)} OFF`
                    }
                  </option>
                ))}
              </FormSelect>            </div>
          </div>
        )}        {/* No Promo Available Message */}
        {transactionData.customerId > 0 && transactionData.productId > 0 && availablePromos.length === 0 && (
          <div style={{ 
            marginBottom: '16px',
            backgroundColor: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: '6px', 
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#92400e'
          }}>
            ℹ️ No promos available for this customer
          </div>
        )}

        {/* Customer Selection Info */}
        {transactionData.customerId > 0 && (
          <div style={{ 
            marginBottom: '16px',
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '6px', 
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            👤 Customer selected: <strong style={{ marginLeft: '8px' }}>
              {customers.find(c => c.id === transactionData.customerId)?.firstName} {customers.find(c => c.id === transactionData.customerId)?.lastName}
            </strong>
          </div>
        )}

        {/* Product Selection Info */}
        {selectedProduct && (
          <div style={{ 
            marginBottom: '16px',
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '6px', 
            padding: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#0369a1',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              📦 Product Information
            </div>
            <div style={{ fontSize: '13px', color: '#0369a1' }}>
              <strong>{selectedProduct.name}</strong> - Stock Available: {selectedProduct.stock} units
            </div>
          </div>
        )}

        {/* Price Information */}
        {selectedProduct && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '16px', 
            backgroundColor: selectedPromoObject ? '#f0fdf4' : '#f9fafb', 
            borderRadius: '8px', 
            border: selectedPromoObject ? '1px solid #10b981' : '1px solid #e5e7eb' 
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center'
            }}>
              💰 Price Summary
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '14px', 
              marginBottom: '8px', 
              color: '#6b7280' 
            }}>
              <span>Unit Price:</span>
              <span style={{ fontWeight: '500' }}>{formatPrice(selectedProduct.price)}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '14px', 
              marginBottom: selectedPromoObject ? '8px' : '12px', 
              color: '#6b7280' 
            }}>
              <span>Subtotal ({transactionData.quantity} item{transactionData.quantity > 1 ? 's' : ''}):</span>
              <span style={{ fontWeight: '500' }}>{formatPrice(priceDetails.subTotal)}</span>
            </div>              {selectedPromoObject && (              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '14px', 
                color: '#dc2626',
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: '#fef2f2',
                borderRadius: '4px',
                border: '1px dashed #fca5a5',
                flexWrap: 'nowrap',
                minWidth: 0,
                overflow: 'hidden',
                width: '100%'
              }}>                <span style={{ 
                  fontWeight: '500',
                  flex: '1',
                  marginRight: '8px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  🎯 Promo: {selectedPromoObject.name}
                </span>
                <span style={{ 
                  fontWeight: '600', 
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>- {formatPrice(priceDetails.discountValue)}</span>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontWeight: '600', 
              fontSize: '16px', 
              color: selectedPromoObject ? '#059669' : '#111827', 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '12px', 
              marginTop: '12px',
              backgroundColor: selectedPromoObject ? '#ecfdf5' : 'transparent',
              padding: '12px',
              borderRadius: '6px'
            }}>
              <span>Final Total:</span>
              <span style={{ fontSize: '18px' }}>
                {formatPrice(priceDetails.total)}
              </span>
            </div>
            <div style={{ 
              marginTop: '12px', 
              fontSize: '12px', 
              color: '#6b7280', 
              textAlign: 'center', 
              borderTop: '1px dashed #d1d5db', 
              paddingTop: '12px' 
            }}>
              <MdInfoOutline style={{ display: 'inline', marginRight: '4px' }} />
              Note Admin: Pastikan kuantitas tidak melebihi stok produk. Promo hanya berlaku untuk customer terpilih.
            </div>
          </div>
        )}        {modalError && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#b91c1c', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            fontSize: '14px', 
            border: '1px solid #fecaca', 
            marginBottom: '16px' 
          }}>
            {modalError}
          </div>
        )}
      </FormModal>

      <AddNewDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} onAddCustomer={handleCustomerCreated} onAddProduct={() => fetchData()} />
    </div>
  );
};

export default TransactionPage;
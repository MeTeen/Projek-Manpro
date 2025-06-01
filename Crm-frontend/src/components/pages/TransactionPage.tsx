import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import AddNewDropdown from '../dashboard/AddNewDropdown';
import { FormModal, FormInput, FormSelect } from '../ui';
import customerService, { Customer } from '../../services/customerService';
import productService, { Product } from '../../services/productService';
// Pastikan PurchaseInput diimpor dengan definisi yang menyertakan promoId?
import purchaseService, { PurchaseInput, Purchase } from '../../services/purchaseService';
import promoService, { Promo } from '../../services/promoService';
import { MdAdd, MdShoppingCart, MdInfoOutline } from 'react-icons/md';

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
      console.log('Submitting transaction data (with promoId if selected):', dataToSend);

      await purchaseService.createPurchase(dataToSend);

      setIsAddModalOpen(false);
      fetchData(); // Muat ulang semua data
      alert('Transaksi berhasil dicatat!'); // Pesan lebih netral
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
            </div>
            <button onClick={handleAddTransactionClick} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <MdAdd size={20} /> <span style={{ marginLeft: '5px' }}>Tambah Transaksi</span>
            </button>
          </div>
          {error && !isAddModalOpen && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    {['Transaction ID', 'Customer', 'Product', 'Qty', 'Unit Price', 'Discount', 'Total Paid', 'Date', 'Promo Used'].map((header) => (
                      <th key={header} style={{ padding: '12px 16px', textAlign: header === 'Qty' || header.includes('Harga') || header === 'Diskon' || header === 'Total Bayar' ? 'right' : 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
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
                    purchases.map((purchase) => {
                      const totalPaid = (purchase.price * purchase.quantity) - (purchase.discountAmount || 0);
                      return (
                        <tr key={purchase.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px 16px' }}>{purchase.id}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {purchase.customer ? `${purchase.customer.firstName} ${purchase.customer.lastName}` : getCustomerName(purchase.customerId)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {purchase.product ? purchase.product.name : getProductName(purchase.productId)}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>{purchase.quantity}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            {formatPrice(purchase.price || 0)}
                          </td>                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: (purchase.discountAmount || 0) > 0 ? '#dc2626' : '#6b7280',
                            fontWeight: (purchase.discountAmount || 0) > 0 ? '600' : '400',
                          }}>
                            {(purchase.discountAmount || 0) > 0 
                              ? `- ${formatPrice(purchase.discountAmount || 0)}` 
                              : '-'
                            }
                          </td>                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right', 
                            color: '#059669',
                            fontWeight: '600'
                          }}>
                            {formatPrice(totalPaid)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>                          <td style={{ padding: '12px 16px' }}>
                            {purchase.appliedPromoDetails ? (
                              <div>
                                <div style={{ 
                                  fontWeight: '600', 
                                  color: '#4f46e5',
                                  fontSize: '13px'
                                }}>
                                  {purchase.appliedPromoDetails.name}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#6b7280',
                                  marginTop: '2px'
                                }}>
                                  {purchase.appliedPromoDetails.type === 'percentage'
                                    ? `${parseFloat(purchase.appliedPromoDetails.value.toString()).toFixed(0)}% OFF`
                                    : `${formatPrice(purchase.appliedPromoDetails.value)} OFF`
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
        submitText="Create Transaction"
        loading={formSubmitLoading}
        disabled={!transactionData.productId}        icon={<MdShoppingCart style={{ marginRight: '8px', color: '#4f46e5' }} size={22} />}
      >
        <FormSelect
          name="customerId"
          value={transactionData.customerId}
          onChange={handleInputChange}
          required          label="Customer:"
        >
          <option value={0}>-- Select Customer --</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </FormSelect>

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
        )}

        {/* No Promo Available Message */}
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
            </div>
              {selectedPromoObject && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '14px', 
                color: '#dc2626',
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: '#fef2f2',
                borderRadius: '4px',
                border: '1px dashed #fca5a5'
              }}>
                <span style={{ fontWeight: '500' }}>
                  🎯 Promo Applied ({selectedPromoObject.name}):
                </span>
                <span style={{ fontWeight: '600' }}>- {formatPrice(priceDetails.discountValue)}</span>
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
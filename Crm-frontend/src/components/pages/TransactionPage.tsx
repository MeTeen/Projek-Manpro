import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import AddNewDropdown from '../dashboard/AddNewDropdown';
import customerService, { Customer } from '../../services/customerService';
import productService, { Product } from '../../services/productService';
// Pastikan PurchaseInput diimpor dengan definisi yang menyertakan promoId?
import purchaseService, { PurchaseInput, Purchase } from '../../services/purchaseService';
import promoService, { Promo } from '../../services/promoService';
import { MdAdd, MdShoppingCart, MdLocalOffer, MdInfoOutline } from 'react-icons/md';

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ padding: '0 0px 0 5px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Daftar Transaksi</h1>
              <p style={{ color: '#6b7280', marginTop: '8px' }}>Manage your product inventory</p>
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
                    {['ID', 'Customer', 'Produk', 'Qty', 'Harga Satuan', 'Diskon', 'Total Bayar', 'Tgl Transaksi', 'Promo Digunakan'].map((header) => (
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
                          </td>
                          <td style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            color: (purchase.discountAmount || 0) > 0 ? 'red' : '',
                          }}>
                            {purchase.discountAmount ? `- ${formatPrice(purchase.discountAmount)}` : formatPrice(0)}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', color: 'green' }}>
                            {formatPrice(totalPaid)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {purchase.appliedPromoDetails
                              ? // Jika ada detail promo yang di-include dari backend
                              `${purchase.appliedPromoDetails.name} (ID: ${purchase.appliedPromoDetails.id}) - ${purchase.appliedPromoDetails.type === 'percentage'
                                ? `${parseFloat(purchase.appliedPromoDetails.value.toString()).toFixed(0)}%` // ✅ PERUBAHAN DI SINI
                                : formatPrice(purchase.appliedPromoDetails.value)
                              }`
                              : purchase.promoId
                                ? // Jika hanya ada promoId (misalnya detail tidak di-include)
                                `Promo ID: ${purchase.promoId} - Info detail tidak tersedia`
                                : // Jika tidak ada promo sama sekali
                                '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      {/* Modal Tambah Transaksi */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '500px', padding: '24px 24px 10px 24px', maxHeight: '100vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 7px 0', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <MdShoppingCart style={{ marginRight: '10px', color: '#4F46E5' }} size={22} />
              Tambah Transaksi Baru
            </h2>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Customer:</label>
                <select name="customerId" value={transactionData.customerId} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <option value={0}>-- Pilih Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Produk:</label>
                <select name="productId" value={transactionData.productId} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} disabled={!transactionData.customerId}>
                  <option value={0}>-- Pilih Produk --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock}) - {formatPrice(p.price)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Kuantitas:</label>
                <input type="number" name="quantity" value={transactionData.quantity} onChange={handleInputChange} min="1" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} disabled={!transactionData.productId} />
              </div>

              {/* Promo Selection Dropdown */}
              {transactionData.customerId > 0 && transactionData.productId > 0 && availablePromos.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>
                    <MdLocalOffer style={{ marginRight: '4px', verticalAlign: 'bottom' }} />
                    Promo Tersedia (Opsional):
                  </label>
                  <select
                    name="promoId" // Langsung bind ke transactionData.promoId
                    value={transactionData.promoId ?? ''}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box', height: '42px' }}
                  >
                    <option value="">-- Tidak Pakai Promo --</option>
                    {availablePromos.map(promo => (
                      <option key={promo.id} value={promo.id}>
                        {promo.name} ({promo.type === 'percentage' ? `${Number(promo.value)}%` : formatPrice(promo.value)})
                      </option>))}
                  </select>
                </div>
              )}

              {/* Price Information */}
              {selectedProduct && (
                <div style={{ marginBottom: '14px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', color: '#4B5563' }}>
                    <span>Harga Satuan:</span>
                    <span>{formatPrice(selectedProduct.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#4B5563' }}>
                    <span>Subtotal ({transactionData.quantity} item):</span>
                    <span>{formatPrice(priceDetails.subTotal)}</span>
                  </div>
                  {selectedPromoObject && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'green', marginBottom: '8px' }}>
                      <span>Promo Diterapkan ({selectedPromoObject.name}):</span>
                      <span>- {formatPrice(priceDetails.discountValue)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '16px', color: '#1F2937', borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '12px' }}>
                    <span>Total Akhir:</span>
                    <span style={{ color: selectedPromoObject ? '#2563EB' : '#1F2937' }}>{formatPrice(priceDetails.total)}</span>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                    <MdInfoOutline style={{ verticalAlign: 'bottom', marginRight: '4px' }} />
                    Note Admin: Pastikan kuantitas tidak melebihi stok produk. Promo hanya berlaku untuk customer terpilih.
                  </div>
                </div>
              )}

              {modalError && (
                <div style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid #FCA5A5' }}>
                  {modalError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: 'white', color: '#374151', fontSize: '14px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4F46E5', color: 'white', fontSize: '14px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', opacity: (formSubmitLoading || !transactionData.productId) ? 0.6 : 1 }}
                  disabled={formSubmitLoading || !transactionData.productId}
                >
                  {formSubmitLoading ? 'Memproses...' : 'Buat Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AddNewDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} onAddCustomer={handleCustomerCreated} onAddProduct={() => fetchData()} />
    </div>
  );
};

export default TransactionPage;
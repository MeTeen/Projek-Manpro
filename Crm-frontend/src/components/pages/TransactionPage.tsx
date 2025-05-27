import React, { useState, useEffect, useCallback } from 'react';
// axios tidak perlu diimpor di sini jika semua panggilan API melalui service
// import axios from 'axios'; 

import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import AddNewDropdown from '../dashboard/AddNewDropdown';
import customerService, { Customer } from '../../services/customerService';
import productService, { Product } from '../../services/productService';
// Menggunakan PurchaseInput dan Purchase dari purchaseService yang Anda berikan
import purchaseService, { PurchaseInput, Purchase } from '../../services/purchaseService'; 
import promoService, { Promo } from '../../services/promoService';
import { MdAdd, MdShoppingCart, MdLocalOffer, MdInfoOutline } from 'react-icons/md';

const TransactionPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form data untuk transaksi baru - Sesuai PurchaseInput dari service Anda
  const [transactionData, setTransactionData] = useState<PurchaseInput>({
    customerId: 0,
    productId: 0,
    quantity: 1,
  });
  // State lokal untuk UI pemilihan promo, tidak dikirim ke backend
  const [selectedLocalPromoId, setSelectedLocalPromoId] = useState<number | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availablePromos, setAvailablePromos] = useState<Promo[]>([]);
  const [selectedPromoObject, setSelectedPromoObject] = useState<Promo | null>(null);
  const [usedPromosInSession, setUsedPromosInSession] = useState<Array<{ customerId: number; promoId: number }>>([]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleAddNewClick = () => setIsDropdownOpen(true);
  const handleCustomerCreated = useCallback(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [purchasesRes, customersRes, productsRes] = await Promise.allSettled([
        purchaseService.getAllPurchases(),
        customerService.getAllCustomers(),
        productService.getAllProducts(),
      ]);

      if (purchasesRes.status === 'fulfilled') {
        // Update: Map response agar sesuai dengan Purchase interface yang memiliki appliedPromoDetails
        // Namun, karena backend tidak menyimpan promo, appliedPromoDetails akan selalu null dari getAllPurchases
        // Jika Anda ingin menampilkan promo yang *mungkin* digunakan berdasarkan logika frontend,
        // itu perlu penanganan berbeda dan tidak akan akurat secara historis.
        // Untuk saat ini, kita asumsikan purchasesData adalah array Purchase
        setPurchases(purchasesRes.value);
      } else {
        console.error('Gagal memuat transaksi:', purchasesRes.reason);
        setError(prev => `${prev || ''} Gagal memuat transaksi.`);
      }

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
          // setLoading(true); // Mungkin tidak perlu loading global di sini
          const promosData = await promoService.getAvailablePromosForCustomer(transactionData.customerId);
          const filteredPromos = promosData.filter(
            p => !usedPromosInSession.some(up => up.customerId === transactionData.customerId && up.promoId === p.id)
          );
          setAvailablePromos(filteredPromos);
        } catch (err) {
          console.error("Gagal memuat promo tersedia:", err);
          setAvailablePromos([]);
        } finally {
          // setLoading(false);
        }
      };
      fetchCustomerPromos();
    } else {
      setAvailablePromos([]);
      setSelectedPromoObject(null);
      setSelectedLocalPromoId(null);
    }
  }, [isAddModalOpen, transactionData.customerId, usedPromosInSession]);

  const handleAddTransactionClick = () => {
    setTransactionData({ customerId: 0, productId: 0, quantity: 1 });
    setSelectedLocalPromoId(null);
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
    } else if (name === 'localPromoId_ui') {
      const promoIdVal = value ? Number(value) : null;
      setSelectedLocalPromoId(promoIdVal);
      if (promoIdVal) {
        setSelectedPromoObject(availablePromos.find(p => p.id === promoIdVal) || null);
      } else {
        setSelectedPromoObject(null);
      }
      return; // Tidak update transactionData dengan promoId
    }

    setTransactionData(prev => {
      const updated = { ...prev, [name]: processedValue };
      if (name === 'customerId' && prev.customerId !== updated.customerId) {
        updated.productId = 0; // Reset produk jika customer berubah
        setSelectedProduct(null);
        setSelectedLocalPromoId(null);
        setSelectedPromoObject(null);
        setAvailablePromos([]); // Akan di-fetch ulang
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

    // Data yang dikirim ke backend adalah PurchaseInput standar Anda
    const dataToSend: PurchaseInput = {
      customerId: transactionData.customerId,
      productId: transactionData.productId,
      quantity: transactionData.quantity,
    };

    try {
      setLoading(true);
      console.log('Submitting original transaction data (no promo/discount sent):', dataToSend);
      
      // Hanya panggil purchaseService.createPurchase
      await purchaseService.createPurchase(dataToSend);

      // Jika transaksi berhasil DAN promo dipilih secara lokal:
      if (selectedPromoObject) {
        setUsedPromosInSession(prev => [
          ...prev,
          { customerId: transactionData.customerId, promoId: selectedPromoObject.id }
        ]);
      }

      setIsAddModalOpen(false);
      fetchData();
      alert('Transaksi berhasil dicatat (dengan harga asli produk). Informasikan harga promo (jika ada) kepada customer secara manual.');
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mencatat transaksi.';
      setModalError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceDetailsForDisplay = (): { subTotal: number; visualDiscount: number; visualTotal: number } => {
    if (!selectedProduct) return { subTotal: 0, visualDiscount: 0, visualTotal: 0 };

    const subTotal = selectedProduct.price * transactionData.quantity;
    let visualDiscount = 0;

    if (selectedPromoObject) {
      if (selectedPromoObject.type === 'percentage') {
        visualDiscount = subTotal * (selectedPromoObject.value / 100);
      } else if (selectedPromoObject.type === 'fixed_amount') {
        visualDiscount = selectedPromoObject.value;
      }
      visualDiscount = Math.min(visualDiscount, subTotal);
    }
    const visualTotal = subTotal - visualDiscount;
    return { subTotal, visualDiscount, visualTotal };
  };

  const priceDetailsForDisplay = calculatePriceDetailsForDisplay();

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
            <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Daftar Transaksi</h1>
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
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Produk</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Harga Satuan (Tercatat)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Total (Tercatat)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Tgl Transaksi</th>
                    {/* Kolom promo dihilangkan dari tabel utama karena tidak ada data historis dari backend */}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr>
                  ) : purchases.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>{error ? 'Gagal memuat transaksi.' : 'Tidak ada transaksi.'}</td></tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px' }}>{purchase.id}</td>
                        <td style={{ padding: '12px 16px' }}>{purchase.customer ? `${purchase.customer.firstName} ${purchase.customer.lastName}` : getCustomerName(purchase.customerId)}</td>
                        <td style={{ padding: '12px 16px' }}>{purchase.product ? purchase.product.name : getProductName(purchase.productId)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{purchase.quantity}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                           {/* Menampilkan harga produk asli karena itu yang tercatat */}
                          {formatPrice(purchase.product?.price || 0)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>
                          {formatPrice((purchase.product?.price || 0) * purchase.quantity)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex:1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '500px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <MdShoppingCart style={{ marginRight: '8px' }} /> Tambah Transaksi Baru
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
                <input type="number" name="quantity" value={transactionData.quantity} onChange={handleInputChange} min="1" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} disabled={!transactionData.productId}/>
              </div>

              {transactionData.customerId > 0 && transactionData.productId > 0 && availablePromos.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>
                    <MdLocalOffer style={{ marginRight: '4px', verticalAlign: 'bottom' }}/>
                    Promo Tersedia (Opsional):
                  </label>
                  <select name="localPromoId_ui" value={selectedLocalPromoId ?? ''} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <option value="">-- Tidak Pakai Promo --</option>
                    {availablePromos.map(promo => (
                      <option key={promo.id} value={promo.id}>
                        {promo.name} ({promo.type === 'percentage' ? `${promo.value}%` : formatPrice(promo.value)})
                      </option>))}
                  </select>
                </div>
              )}
              
              {selectedProduct && (
                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>Harga Satuan Asli:</span>
                    <span>{formatPrice(selectedProduct.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                    <span>Subtotal Asli ({transactionData.quantity} item):</span>
                    <span>{formatPrice(priceDetailsForDisplay.subTotal)}</span>
                  </div>
                  {selectedPromoObject && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'green', marginBottom: '8px' }}>
                      <span>Promo Diterapkan ({selectedPromoObject.name}):</span>
                      <span>- {formatPrice(priceDetailsForDisplay.visualDiscount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                    <span>Harga untuk Customer (Setelah Promo):</span>
                    <span style={{color: selectedPromoObject ? 'blue' : 'inherit'}}>{formatPrice(priceDetailsForDisplay.visualTotal)}</span>
                  </div>
                  <div style={{marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center', borderTop: '1px dashed #ccc', paddingTop: '10px'}}>
                     <MdInfoOutline style={{verticalAlign: 'bottom', marginRight: '4px'}} />
                     Admin: Informasikan harga setelah promo kepada customer. Transaksi akan dicatat dengan **harga asli produk** di sistem.
                  </div>
                </div>
              )}

              {modalError && ( <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{modalError}</div> )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer' }} disabled={loading || !transactionData.productId}>
                  {loading ? 'Memproses...' : 'Catat Transaksi (Harga Asli)'}
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
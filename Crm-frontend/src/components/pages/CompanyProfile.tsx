import React, { useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import { useAuth } from '../../context/AuthContext';

const CompanyProfile: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const { isAuthenticated } = useAuth();
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleProductDetail = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleBackToProducts = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  // Data produk mebel dengan placeholder
  const furnitureProducts = [
    {
      id: 1,
      name: 'Sofa Modern Minimalis',
      category: 'sofa',
      price: 'Rp 8.500.000',
      description: 'Sofa 3 dudukan dengan desain modern minimalis, bahan kulit sintetis berkualitas tinggi.',
      image: 'https://www.pojahome.co.id/wp-content/uploads/2024/08/Sofa-Kulit-Minimalis-2-Seater-untuk-Ruang-Tamu.jpg'
    },
    {
      id: 2,
      name: 'Meja Makan Kayu Jati',
      category: 'dining',
      price: 'Rp 12.000.000',
      description: 'Meja makan kayu jati solid untuk 6 orang, finishing natural dengan proteksi anti rayap.',
      image: 'https://sfd-craft.com/wp-content/uploads/2018/10/black-forest-table-from-forest'
    },
    {
      id: 3,
      name: 'Lemari Pakaian 4 Pintu',
      category: 'bedroom',
      price: 'Rp 6.500.000',
      description: 'Lemari pakaian 4 pintu dengan cermin, dilengkapi laci dan gantungan baju.',
      image: 'https://d2xjmi1k71iy2m.cloudfront.net/dairyfarm/id/images/988/0898845_PE782660_S4.webp'
    },
    {
      id: 4,
      name: 'Kursi Kantor Ergonomis',
      category: 'office',
      price: 'Rp 2.800.000',
      description: 'Kursi kantor dengan desain ergonomis, dilengkapi penyangga lumbar dan armrest adjustable.',
      image: 'https://images.steelcase.com/image/upload/c_fill,q_auto,f_auto,h_656,w_1166/v1726162162/23-0213314_16x9.jpg'
    },
    {
      id: 5,
      name: 'Rak Buku Minimalis',
      category: 'storage',
      price: 'Rp 3.200.000',
      description: 'Rak buku 5 tingkat dengan desain minimalis, cocok untuk ruang kerja atau perpustakaan.',
      image: 'https://uwitan.id/wp-content/uploads/2020/10/1.-Furniture-Rak-Book-Case-4-Tingkat.jpeg'
    },
    {
      id: 6,
      name: 'Tempat Tidur Queen Size',
      category: 'bedroom',
      price: 'Rp 9.500.000',
      description: 'Tempat tidur queen size dengan headboard berlapis, termasuk kasur spring bed.',
      image: 'https://d2xjmi1k71iy2m.cloudfront.net/dairyfarm/id/images/510/1151050_PE884752_S4.webp'
    },
    {
      id: 7,
      name: 'Meja Kerja L-Shape',
      category: 'office',
      price: 'Rp 4.500.000',
      description: 'Meja kerja bentuk L dengan laci dan space untuk CPU, ideal untuk home office.',
      image: 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/11/9/4572d6b8-77cd-451c-96d1-30cd7d84b58c.png'
    },
    {
      id: 8,
      name: 'Buffet TV Modern',
      category: 'living',
      price: 'Rp 5.800.000',
      description: 'Buffet TV dengan desain modern, dilengkapi storage untuk peralatan elektronik.',
      image: 'https://d2xjmi1k71iy2m.cloudfront.net/dairyfarm/id/images/733/0473390_PE614545_S4.webp'
    }
  ];

  const categories = [
    { id: 'all', name: 'Semua Produk' },
    { id: 'sofa', name: 'Sofa' },
    { id: 'dining', name: 'Ruang Makan' },
    { id: 'bedroom', name: 'Kamar Tidur' },
    { id: 'office', name: 'Kantor' },
    { id: 'storage', name: 'Penyimpanan' },
    { id: 'living', name: 'Ruang Tamu' }
  ];
  const filteredProducts = selectedCategory === 'all' 
    ? furnitureProducts 
    : furnitureProducts.filter(product => product.category === selectedCategory);

  // Render content without sidebar and header when not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        background: 'linear-gradient(to right, #8B4513, #D2691E)'
      }}>
        <div style={{ 
          padding: '20px 30px', 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(6px)',
          minHeight: '100vh'
        }}>
          {/* Header for non-authenticated users */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            padding: '15px 0',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#8B4513',
              margin: 0 
            }}>
              🪑 Mebel Premium
            </h1>            <div style={{ display: 'flex', gap: '12px' }}>
              <a 
                href="/admin/login" 
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#8B4513',
                  border: '2px solid #8B4513',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </a>
              <a 
                href="/admin/signup" 
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#8B4513',
                  color: 'white',
                  border: '2px solid #8B4513',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                Sign Up
              </a>
            </div>
          </div>

          <main>
            {showProductDetail && selectedProduct ? (
              // Product Detail View for non-authenticated users
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Back Button */}
                <button
                  onClick={handleBackToProducts}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#8B4513',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginBottom: '32px',
                    fontSize: '16px'
                  }}
                >
                  ← Kembali ke Produk
                </button>

                {/* Product Detail Content */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', 
                  gap: '48px', 
                  marginBottom: '48px',
                  alignItems: 'start'
                }}>
                  {/* Product Image */}
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}>
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      style={{ 
                        width: '100%', 
                        height: '400px', 
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '32px', 
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      backgroundColor: '#8B4513',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '16px'
                    }}>
                      {categories.find(cat => cat.id === selectedProduct.category)?.name || 'Furniture'}
                    </div>
                    
                    <h1 style={{ 
                      fontSize: '32px', 
                      fontWeight: '700', 
                      color: '#2d1810', 
                      marginBottom: '16px',
                      lineHeight: '1.2'
                    }}>
                      {selectedProduct.name}
                    </h1>
                    
                    <p style={{ 
                      color: '#6b5b47', 
                      fontSize: '16px', 
                      lineHeight: '1.6',
                      marginBottom: '24px'
                    }}>
                      {selectedProduct.description}
                    </p>

                    <div style={{ 
                      borderTop: '2px solid #f1f1f1',
                      paddingTop: '24px',
                      marginBottom: '24px'
                    }}>
                      <span style={{ 
                        fontSize: '36px', 
                        fontWeight: '700', 
                        color: '#8B4513',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {selectedProduct.price}
                      </span>
                      <p style={{ color: '#6b5b47', fontSize: '14px' }}>
                        *Harga dapat berubah sewaktu-waktu
                      </p>
                    </div>

                    {/* Product Features */}
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: '#2d1810', 
                        marginBottom: '12px' 
                      }}>
                        ✨ Keunggulan Produk
                      </h3>
                      <ul style={{ 
                        color: '#6b5b47', 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        paddingLeft: '20px'
                      }}>
                        <li>Bahan berkualitas tinggi dan tahan lama</li>
                        <li>Desain modern dan elegan</li>
                        <li>Mudah perawatan dan maintenance</li>
                        <li>Garansi resmi dari manufacturer</li>
                        <li>Free konsultasi desain interior</li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      flexWrap: 'wrap'
                    }}>
                      <button style={{
                        backgroundColor: '#D2691E',
                        color: 'white',
                        border: 'none',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px',
                        flex: '1',
                        minWidth: '150px'
                      }}>
                        💬 Hubungi Sales
                      </button>
                      <button style={{
                        backgroundColor: 'transparent',
                        color: '#8B4513',
                        border: '2px solid #8B4513',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px',
                        flex: '1',
                        minWidth: '150px'
                      }}>
                        📋 Request Katalog
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Product Information */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr 1fr' : '1fr', 
                  gap: '24px',
                  marginBottom: '48px'
                }}>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '24px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚚</div>
                    <h4 style={{ color: '#2d1810', fontWeight: '600', marginBottom: '8px' }}>Free Delivery</h4>
                    <p style={{ color: '#6b5b47', fontSize: '14px' }}>Gratis ongkir untuk area Jakarta & sekitarnya</p>
                  </div>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '24px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔧</div>
                    <h4 style={{ color: '#2d1810', fontWeight: '600', marginBottom: '8px' }}>Assembly Service</h4>
                    <p style={{ color: '#6b5b47', fontSize: '14px' }}>Jasa pemasangan gratis oleh teknisi berpengalaman</p>
                  </div>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '24px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
                    <h4 style={{ color: '#2d1810', fontWeight: '600', marginBottom: '8px' }}>Warranty</h4>
                    <p style={{ color: '#6b5b47', fontSize: '14px' }}>Garansi hingga 2 tahun untuk kerusakan manufaktur</p>
                  </div>
                </div>

                {/* Contact Section for Product */}
                <div style={{ 
                  textAlign: 'center', 
                  backgroundColor: '#FFF8DC', 
                  padding: '40px', 
                  borderRadius: '16px',
                  border: '2px solid #D2691E'
                }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
                    Tertarik dengan {selectedProduct.name}?
                  </h2>
                  <p style={{ color: '#654321', fontSize: '16px', marginBottom: '20px' }}>
                    Hubungi tim sales kami untuk informasi lebih lanjut dan penawaran terbaik
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
                      <span style={{ color: '#654321' }}>+62 812-3456-7890</span>
                    </div>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
                      <span style={{ color: '#654321' }}>furniture@mebelkita.com</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Products List for non-authenticated users
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                  <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
                    🪑 Koleksi Mebel Premium
                  </h1>
                  <p style={{ fontSize: '20px', color: '#654321', marginBottom: '32px', maxWidth: '800px', margin: '0 auto' }}>
                    Temukan furniture berkualitas tinggi untuk melengkapi hunian dan kantor Anda. 
                    Dibuat dengan bahan pilihan dan craftsmanship terbaik.
                  </p>
                </div>

                {/* Category Filter */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '25px',
                          border: 'none',
                          backgroundColor: selectedCategory === category.id ? '#8B4513' : '#ffffff',
                          color: selectedCategory === category.id ? '#ffffff' : '#8B4513',
                          cursor: 'pointer',
                          fontWeight: '600',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                  gap: '32px', 
                  marginBottom: '48px' 
                }}>
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      style={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '16px', 
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                        <div style={{ 
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: '#8B4513',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {categories.find(cat => cat.id === product.category)?.name || 'Furniture'}
                        </div>
                      </div>
                      <div style={{ padding: '24px' }}>
                        <h3 style={{ 
                          fontSize: '22px', 
                          fontWeight: '700', 
                          color: '#2d1810', 
                          marginBottom: '8px',
                          lineHeight: '1.3'
                        }}>
                          {product.name}
                        </h3>
                        <p style={{ 
                          color: '#6b5b47', 
                          fontSize: '14px', 
                          lineHeight: '1.5',
                          marginBottom: '16px',
                          height: '42px',
                          overflow: 'hidden'
                        }}>
                          {product.description}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          borderTop: '1px solid #f1f1f1',
                          paddingTop: '16px'
                        }}>
                          <span style={{ 
                            fontSize: '20px', 
                            fontWeight: '700', 
                            color: '#8B4513' 
                          }}>
                            {product.price}
                          </span>
                          <button 
                            onClick={() => handleProductDetail(product)}
                            style={{
                            backgroundColor: '#D2691E',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}>
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Section */}
                <div style={{ 
                  textAlign: 'center', 
                  backgroundColor: '#FFF8DC', 
                  padding: '40px', 
                  borderRadius: '16px',
                  border: '2px solid #D2691E'
                }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
                    📞 Hubungi Kami untuk Konsultasi
                  </h2>
                  <p style={{ color: '#654321', fontSize: '16px', marginBottom: '20px' }}>
                    Dapatkan penawaran terbaik dan konsultasi gratis untuk kebutuhan furniture Anda
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
                      <span style={{ color: '#654321' }}>furniture@mebelkita.com</span>
                    </div>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
                      <span style={{ color: '#654321' }}>+62 812-3456-7890</span>
                    </div>
                    <div>
                      <strong style={{ color: '#8B4513' }}>🏪 Showroom:</strong><br />
                      <span style={{ color: '#654321' }}>Jl. Mebel Raya No. 123, Jakarta</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Render with sidebar and header when authenticated
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(to right, #8B4513, #D2691E)' }}>
        <div style={{ padding: '20px 30px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(6px)' }}>          <Header onAddNewClick={() => {}} onCustomerCreated={() => {}} />
          <main>
            {showProductDetail && selectedProduct ? (
              // Product Detail View
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Back Button */}
                <button
                  onClick={handleBackToProducts}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#8B4513',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginBottom: '32px',
                    fontSize: '16px'
                  }}
                >
                  ← Kembali ke Produk
                </button>                {/* Product Detail Content */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', 
                  gap: '48px', 
                  marginBottom: '48px',
                  alignItems: 'start'
                }}>
                  {/* Product Image */}
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}>
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      style={{ 
                        width: '100%', 
                        height: '400px', 
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '32px', 
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      backgroundColor: '#8B4513',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '16px'
                    }}>
                      {categories.find(cat => cat.id === selectedProduct.category)?.name || 'Furniture'}
                    </div>
                    
                    <h1 style={{ 
                      fontSize: '32px', 
                      fontWeight: '700', 
                      color: '#2d1810', 
                      marginBottom: '16px',
                      lineHeight: '1.2'
                    }}>
                      {selectedProduct.name}
                    </h1>
                    
                    <p style={{ 
                      color: '#6b5b47', 
                      fontSize: '16px', 
                      lineHeight: '1.6',
                      marginBottom: '24px'
                    }}>
                      {selectedProduct.description}
                    </p>

                    <div style={{ 
                      borderTop: '2px solid #f1f1f1',
                      paddingTop: '24px',
                      marginBottom: '24px'
                    }}>
                      <span style={{ 
                        fontSize: '36px', 
                        fontWeight: '700', 
                        color: '#8B4513',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {selectedProduct.price}
                      </span>
                      <p style={{ color: '#6b5b47', fontSize: '14px' }}>
                        *Harga dapat berubah sewaktu-waktu
                      </p>
                    </div>

                    {/* Product Features */}
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: '#2d1810', 
                        marginBottom: '12px' 
                      }}>
                        ✨ Keunggulan Produk
                      </h3>
                      <ul style={{ 
                        color: '#6b5b47', 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        paddingLeft: '20px'
                      }}>
                        <li>Bahan berkualitas tinggi dan tahan lama</li>
                        <li>Desain modern dan elegan</li>
                        <li>Mudah perawatan dan maintenance</li>
                        <li>Garansi resmi dari manufacturer</li>
                        <li>Free konsultasi desain interior</li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      flexWrap: 'wrap'
                    }}>
                      <button style={{
                        backgroundColor: '#D2691E',
                        color: 'white',
                        border: 'none',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px',
                        flex: '1',
                        minWidth: '150px'
                      }}>
                        💬 Hubungi Sales
                      </button>
                      <button style={{
                        backgroundColor: 'transparent',
                        color: '#8B4513',
                        border: '2px solid #8B4513',
                        padding: '16px 32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px',
                        flex: '1',
                        minWidth: '150px'
                      }}>
                        📋 Request Katalog
                      </button>
                    </div>
                  </div>
                </div>                {/* Additional Product Information */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr 1fr' : '1fr', 
                  gap: '24px',
                  marginBottom: '48px'
                }}>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '24px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚚</div>
                    <h4 style={{ color: '#2d1810', fontWeight: '600', marginBottom: '8px' }}>Free Delivery</h4>
                    <p style={{ color: '#6b5b47', fontSize: '14px' }}>Gratis ongkir untuk area Jakarta & sekitarnya</p>
                  </div>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '24px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔧</div>
                    <h4 style={{ color: '#2d1810', fontWeight: '600', marginBottom: '8px' }}>Assembly Service</h4>
                    <p style={{ color: '#6b5b47', fontSize: '14px' }}>Jasa pemasangan gratis oleh teknisi berpengalaman</p>
                  </div>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    padding: '24px', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
                    <h4 style={{ color: '#2d1810', fontWeight: '600', marginBottom: '8px' }}>Warranty</h4>
                    <p style={{ color: '#6b5b47', fontSize: '14px' }}>Garansi hingga 2 tahun untuk kerusakan manufaktur</p>
                  </div>
                </div>

                {/* Contact Section for Product */}
                <div style={{ 
                  textAlign: 'center', 
                  backgroundColor: '#FFF8DC', 
                  padding: '40px', 
                  borderRadius: '16px',
                  border: '2px solid #D2691E'
                }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
                    Tertarik dengan {selectedProduct.name}?
                  </h2>
                  <p style={{ color: '#654321', fontSize: '16px', marginBottom: '20px' }}>
                    Hubungi tim sales kami untuk informasi lebih lanjut dan penawaran terbaik
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
                      <span style={{ color: '#654321' }}>+62 812-3456-7890</span>
                    </div>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
                      <span style={{ color: '#654321' }}>furniture@mebelkita.com</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {/* Header Section */}
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
                  🪑 Koleksi Mebel Premium
                </h1>
                <p style={{ fontSize: '20px', color: '#654321', marginBottom: '32px', maxWidth: '800px', margin: '0 auto' }}>
                  Temukan furniture berkualitas tinggi untuk melengkapi hunian dan kantor Anda. 
                  Dibuat dengan bahan pilihan dan craftsmanship terbaik.
                </p>
              </div>

              {/* Category Filter */}
              <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '25px',
                        border: 'none',
                        backgroundColor: selectedCategory === category.id ? '#8B4513' : '#ffffff',
                        color: selectedCategory === category.id ? '#ffffff' : '#8B4513',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                gap: '32px', 
                marginBottom: '48px' 
              }}>
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '16px', 
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      <div style={{ 
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#8B4513',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {categories.find(cat => cat.id === product.category)?.name || 'Furniture'}
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ 
                        fontSize: '22px', 
                        fontWeight: '700', 
                        color: '#2d1810', 
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        {product.name}
                      </h3>
                      <p style={{ 
                        color: '#6b5b47', 
                        fontSize: '14px', 
                        lineHeight: '1.5',
                        marginBottom: '16px',
                        height: '42px',
                        overflow: 'hidden'
                      }}>
                        {product.description}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderTop: '1px solid #f1f1f1',
                        paddingTop: '16px'
                      }}>
                        <span style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#8B4513' 
                        }}>
                          {product.price}
                        </span>                        <button 
                          onClick={() => handleProductDetail(product)}
                          style={{
                          backgroundColor: '#D2691E',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Section */}
              <div style={{ 
                textAlign: 'center', 
                backgroundColor: '#FFF8DC', 
                padding: '40px', 
                borderRadius: '16px',
                border: '2px solid #D2691E'
              }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
                  📞 Hubungi Kami untuk Konsultasi
                </h2>
                <p style={{ color: '#654321', fontSize: '16px', marginBottom: '20px' }}>
                  Dapatkan penawaran terbaik dan konsultasi gratis untuk kebutuhan furniture Anda
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
                    <span style={{ color: '#654321' }}>furniture@mebelkita.com</span>
                  </div>
                  <div>
                    <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
                    <span style={{ color: '#654321' }}>+62 812-3456-7890</span>
                  </div>
                  <div>
                    <strong style={{ color: '#8B4513' }}>🏪 Showroom:</strong><br />
                    <span style={{ color: '#654321' }}>Jl. Mebel Raya No. 123, Jakarta</span>
                  </div>                </div>
              </div>
            </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;

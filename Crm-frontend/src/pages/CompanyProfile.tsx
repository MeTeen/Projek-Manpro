import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompanyProfile: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated admins to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleProductDetail = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleBackToProducts = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };
  // Update categories to be more general and combine related ones
  const furnitureProducts = [
    {
      id: 1,
      name: 'Sofa Modern Minimalis',
      category: 'living-room',
      price: 'Rp 8.500.000',
      description: 'Sofa 3 dudukan dengan desain modern minimalis, bahan kulit sintetis berkualitas tinggi.',
      image: 'https://www.pojahome.co.id/wp-content/uploads/2024/08/Sofa-Kulit-Minimalis-2-Seater-untuk-Ruang-Tamu.jpg'
    },
    {
      id: 2,
      name: 'Meja Makan Kayu Jati',
      category: 'dining-room',
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
      name: 'Sofa Sectional Corner',
      category: 'living-room',
      price: 'Rp 15.000.000',
      description: 'Sofa sectional corner untuk ruang tamu besar, bahan fabric premium dengan bantal ekstra.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc7nvQK_Kh_jsDjfn9GubkLeKWzqdEb-J-Mw&s'
    }
  ];

  const categories = [
    { id: 'all', name: 'Semua Produk' },
    { id: 'living-room', name: 'Ruang Tamu' },
    { id: 'dining-room', name: 'Ruang Makan' },
    { id: 'bedroom', name: 'Kamar Tidur' },
    { id: 'office', name: 'Kantor' },
    { id: 'storage', name: 'Penyimpanan' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? furnitureProducts 
    : furnitureProducts.filter(product => product.category === selectedCategory);

  // Early return for authenticated users - will be redirected by useEffect
  if (isAuthenticated) {
    return null;
  }

  // Render customer-facing company profile for non-authenticated users
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
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
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
              Admin Login
            </a>
            <a 
              href="/customer/login" 
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
              Customer Portal
            </a>
          </div>
        </div>

        <main>
          {showProductDetail && selectedProduct ? (
            // Product Detail View
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <button
                onClick={handleBackToProducts}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '24px',
                  fontSize: '14px'
                }}
              >
                ← Kembali ke Produk
              </button>
              
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
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
                <div style={{ padding: '32px' }}>
                  <h1 style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: '#8B4513', 
                    marginBottom: '16px' 
                  }}>
                    {selectedProduct.name}
                  </h1>
                  <p style={{ 
                    fontSize: '18px', 
                    color: '#654321', 
                    lineHeight: '1.6', 
                    marginBottom: '24px' 
                  }}>
                    {selectedProduct.description}
                  </p>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#8B4513', 
                    marginBottom: '32px' 
                  }}>
                    {selectedProduct.price}
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
              </div>
            </div>
          ) : (
            // Products List
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
                  🪑 Koleksi Mebel Premium
                </h1>
                <p style={{ fontSize: '20px', color: '#654321', marginBottom: '32px', maxWidth: '800px', margin: '0 auto' }}>
                  Temukan furniture berkualitas tinggi untuk rumah dan kantor Anda. 
                  Desain modern dengan material terbaik dan harga terjangkau.
                </p>
              </div>

              {/* Category Filter */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '40px'
              }}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: selectedCategory === category.id ? '#8B4513' : 'transparent',
                      color: selectedCategory === category.id ? 'white' : '#8B4513',
                      border: '2px solid #8B4513',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px',
                marginBottom: '64px'
              }}>
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    style={{ 
                      backgroundColor: 'white', 
                      borderRadius: '16px', 
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleProductDetail(product)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        objectFit: 'cover' 
                      }}
                    />
                    <div style={{ padding: '24px' }}>
                      <h3 style={{ 
                        color: '#2d1810', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        fontSize: '18px'
                      }}>
                        {product.name}
                      </h3>
                      <p style={{ 
                        color: '#6b5b47', 
                        fontSize: '14px', 
                        marginBottom: '16px',
                        lineHeight: '1.4'
                      }}>
                        {product.description.substring(0, 80)}...
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}>
                        <span style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#8B4513' 
                        }}>
                          {product.price}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductDetail(product);
                          }}
                          style={{
                            backgroundColor: '#D2691E',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                        >
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
};

export default CompanyProfile;

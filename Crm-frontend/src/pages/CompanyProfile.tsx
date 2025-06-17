import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import furnitureProducts from '../data/furnitureProducts.json';
import companyData from '../data/companyData.json';
import { FurnitureProduct, Category } from '../types/furniture';

const CompanyProfile: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<FurnitureProduct | null>(null);
  const [showProductDetail, setShowProductDetail] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleProductDetail = (product: FurnitureProduct) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };
  const handleBackToProducts = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const categories: Category[] = companyData.categories;

  const filteredProducts = selectedCategory === 'all'
    ? furnitureProducts
    : furnitureProducts.filter(product => product.category === selectedCategory);

  if (isAuthenticated) return null;

  return (  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%)',
    position: 'relative'
  }}>
    {/* Background Pattern Overlay */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                       radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
      pointerEvents: 'none'
    }}></div>    {/* Enhanced Navbar */}
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        background: 'rgba(255, 248, 220, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 69, 19, 0.2)',
        boxShadow: '0 8px 32px rgba(139, 69, 19, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderRadius: '0 0 24px 24px'
      }}>
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>          <div style={{
            background: 'linear-gradient(135deg, #8B4513, #D2691E)',
            borderRadius: '16px',
            padding: '12px 16px',
            fontSize: '24px',
            boxShadow: '0 8px 24px rgba(139, 69, 19, 0.4)',
            border: '3px solid rgba(255, 248, 220, 0.5)',
            transform: 'rotate(-2deg)'
          }}>
            🐝
          </div>
          <div>            <h1 style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#8B4513',
              margin: 0,
              fontFamily: '"Segoe UI", system-ui, sans-serif',
              letterSpacing: '-1px',
              textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)'
            }}>
              {companyData.contactInfo.companyName}
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#A0522D',
              margin: 0,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #8B4513, #D2691E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ✨ Premium Furniture Collection ✨
            </p>
          </div>
        </div>        {/* Navigation Menu */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          background: 'rgba(139, 69, 19, 0.1)',
          borderRadius: '16px',
          padding: '8px',
          border: '2px solid rgba(139, 69, 19, 0.2)',
          boxShadow: 'inset 0 2px 8px rgba(139, 69, 19, 0.1)'
        }}>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: showProductDetail ? 'transparent' : '#8B4513',
              color: showProductDetail ? '#8B4513' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: showProductDetail ? 'none' : '0 2px 8px rgba(139, 69, 19, 0.3)'
            }}
            onClick={() => {
              if (showProductDetail) {
                handleBackToProducts();
              } else {
                const el = document.getElementById('home');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onMouseEnter={(e) => {
              if (showProductDetail) {
                e.currentTarget.style.backgroundColor = 'rgba(139, 69, 19, 0.1)';
              } else {
                e.currentTarget.style.backgroundColor = '#654321';
              }
            }}
            onMouseLeave={(e) => {
              if (showProductDetail) {
                e.currentTarget.style.backgroundColor = 'transparent';
              } else {
                e.currentTarget.style.backgroundColor = '#8B4513';
              }
            }}
          >
            🏠 Home
          </button>
          
          {!showProductDetail && (
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#8B4513',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                const el = document.getElementById('about');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 69, 19, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ℹ️ Tentang Kami
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center' 
        }}>
          <a
            href="/admin/login"
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #8B4513, #A0522D)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 12px rgba(139, 69, 19, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 69, 19, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(139, 69, 19, 0.3)';
            }}
          >
            🔐 Admin
          </a>
          <a
            href="/customer/login"
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #D2691E, #CD853F)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 12px rgba(210, 105, 30, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(210, 105, 30, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(210, 105, 30, 0.3)';
            }}
          >
            👤 Customer Portal
          </a>
        </div>
      </div>    {/* Produk Section */}
    <div style={{
        padding: '60px 40px 40px 40px',
        background: 'linear-gradient(to bottom, rgba(255, 248, 220, 0.98), rgba(250, 235, 215, 0.95))',
        backdropFilter: 'blur(20px)',
        minHeight: '100vh',
        borderRadius: '30px 30px 0 0',
        marginTop: '-30px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 -8px 32px rgba(139, 69, 19, 0.15)',
        border: '2px solid rgba(139, 69, 19, 0.1)'
      }}>
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {showProductDetail && selectedProduct ? (
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
                 {/* Contact Product */}
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
                  </p>                  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
                      <span style={{ color: '#654321' }}>{companyData.contactInfo.whatsapp}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
                      <span style={{ color: '#654321' }}>{companyData.contactInfo.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (          <div id="home" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Enhanced Hero Section */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '60px',
              padding: '60px 20px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '150px',
                height: '150px',
                background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.2), rgba(102, 126, 234, 0.2))',
                borderRadius: '50%',
                filter: 'blur(30px)',
                zIndex: 0
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{ 
                  fontSize: '48px', 
                  fontWeight: '800', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '20px',
                  letterSpacing: '-1px'
                }}>
                  🪑 Koleksi Mebel Premium
                </h1>
                <p style={{ 
                  fontSize: '22px', 
                  color: '#64748b', 
                  marginBottom: '32px', 
                  maxWidth: '800px', 
                  margin: '0 auto 32px auto',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Temukan furniture berkualitas tinggi untuk rumah dan kantor Anda.
                  Desain modern dengan material terbaik dan harga terjangkau.
                </p>
                <div style={{
                  display: 'inline-flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    color: '#667eea',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                  }}>
                    ✨ 30+ Produk Premium
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    color: '#764ba2',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(118, 75, 162, 0.2)'
                  }}>
                    🚚 Pengiriman Gratis
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    color: '#667eea',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                  }}>
                    💎 Garansi Kualitas
                  </div>
                </div>
              </div>
            </div>            {/* Enhanced Category Filter */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '50px',
              padding: '0 20px'
            }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    padding: '14px 28px',
                    background: selectedCategory === category.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'rgba(255, 255, 255, 0.9)',
                    color: selectedCategory === category.id ? 'white' : '#64748b',
                    border: selectedCategory === category.id 
                      ? 'none' 
                      : '2px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedCategory === category.id 
                      ? '0 8px 25px rgba(102, 126, 234, 0.4)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transform: selectedCategory === category.id ? 'translateY(-2px)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>            {/* Enhanced Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px',
              marginBottom: '80px',
              padding: '0 20px'
            }}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative'
                  }}
                  onClick={() => handleProductDetail(product)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Product Image */}
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '220px',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '50px',
                      background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.1))'
                    }}></div>
                  </div>
                  
                  {/* Product Info */}
                  <div style={{ padding: '28px' }}>
                    <h3 style={{
                      color: '#1e293b',
                      fontWeight: '700',
                      marginBottom: '12px',
                      fontSize: '20px',
                      lineHeight: '1.3'
                    }}>
                      {product.name}
                    </h3>
                    <p style={{
                      color: '#64748b',
                      fontSize: '14px',
                      marginBottom: '20px',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>
                    
                    {/* Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto'
                    }}>
                      <span style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {product.price}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductDetail(product);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '50px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    {/* === Bagian bawah ini, tetap DI DALAM div utama === */}
    {!showProductDetail && (
      <>
        {/* Tentang Kami */}
        <div id="about" style={{
        padding: "60px 15px 20px 15px",
        background: "#fff",
        textAlign: "center"
      }}>
        <h2 style={{
          fontWeight: "bold",
          fontSize: 30,
          marginBottom: 18,
          color: "#212529"
        }}>Tentang Kami</h2>
        <div style={{
          maxWidth: 800,
          margin: "0 auto",
          color: "#222",
          fontSize: 20,
          lineHeight: "1.6"
        }}>
          {companyData.contactInfo.companyName} adalah brand furnitur modern yang berkomitmen menghadirkan produk berkualitas tinggi dengan harga terjangkau. Kami menggabungkan keindahan desain, kekuatan material, dan kenyamanan dalam setiap produk yang kami hadirkan. Didirikan oleh tim desainer interior dan pengrajin berpengalaman, kami telah dipercaya oleh ratusan pelanggan di seluruh Indonesia.
        </div>
      </div>

        {/* Fitur Unggulan */}
        <div style={{
        background: "#f7fafd",
        padding: "40px 0 60px 0",
      }}>
        <h2 style={{
          fontWeight: "bold",
          fontSize: 30,
          marginBottom: 34,
          color: "#212529",
          textAlign: "center"
        }}>Fitur Unggulan</h2>        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto"
        }}>
          {companyData.features.map((feature) => (
            <div key={feature.id} style={{
              background: "#fff", 
              borderRadius: 18, 
              padding: "32px 28px", 
              minWidth: 300, 
              maxWidth: 400, 
              flex: 1, 
              margin: 10, 
              boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
            }}>
              <div style={{ 
                fontWeight: "bold", 
                color: "#A0522D", 
                fontSize: 22, 
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>{feature.icon}</span>
                {feature.title}
              </div>
              <div>{feature.description}</div>
            </div>
          ))}
        </div>
      </div>

        {/* Apa Kata Mereka */}
        {/* ======= Apa Kata Mereka ======= */}
      <div style={{
        background: "#fdf6db",
        padding: "60px 0"
      }}>
        <h2 style={{
          fontWeight: "bold",
          fontSize: 30,
          marginBottom: 38,
          color: "#232832",
          textAlign: "center"
        }}>Apa Kata Mereka</h2>        <div style={{
          display: "flex",
          gap: 28,
          maxWidth: 1200,
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {companyData.testimonials.map((testimonial) => (
            <div key={testimonial.id} style={{
              background: "#fff",
              borderRadius: 18,
              padding: "38px 32px",
              minWidth: 380,
              maxWidth: 500,
              margin: 10,
              boxShadow: "0 3px 16px rgba(200, 185, 110, 0.08)",
              fontSize: 18,
              color: "#232832"
            }}>
              "{testimonial.review}"
              <div style={{ fontWeight: 600, marginTop: 18 }}>
                — {testimonial.name}, {testimonial.location}
              </div>
            </div>
          ))}
        </div>
      </div>
        {/* Hubungi Kami */}
<div style={{
  textAlign: 'center',
  backgroundColor: '#FFF8DC',
  padding: '40px',
  borderRadius: '16px',
  border: '2px solid #D2691E'
}}>  <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
    📞 Hubungi Kami untuk Konsultasi
  </h2>
  <p style={{ color: '#654321', fontSize: '16px', marginBottom: '20px' }}>
    Dapatkan konsultasi gratis dan penawaran terbaik dari {companyData.contactInfo.companyName} untuk menciptakan ruangan impian yang penuh kenyamanan dan modern yang sesuai kebutuhan Anda
  </p>
  <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
    <div>
      <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
      <span style={{ color: '#654321' }}>{companyData.contactInfo.email}</span>
    </div>
    <div>
      <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
      <span style={{ color: '#654321' }}>{companyData.contactInfo.whatsapp}</span>
    </div>
    <div>
      <strong style={{ color: '#8B4513' }}>🏪 Showroom:</strong><br />
      <span style={{ color: '#654321' }}>{companyData.contactInfo.showroom}</span>
    </div>
  </div>
</div>
      </>
    )}
  </div>
);
};

export default CompanyProfile;

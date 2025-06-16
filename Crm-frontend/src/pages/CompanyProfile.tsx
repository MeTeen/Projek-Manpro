import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CompanyProfile: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      name: 'Sofa Sectional Corner',
      category: 'living-room',
      price: 'Rp 15.000.000',
      description: 'Sofa sectional corner untuk ruang tamu besar, bahan fabric premium dengan bantal ekstra.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc7nvQK_Kh_jsDjfn9GubkLeKWzqdEb-J-Mw&s'
    },
    {
      id: 3,
      name: 'Meja Tamu Minimalis',
      category: 'living-room',
      price: 'Rp 200.609',
      description: 'Meja tamu berbahan kayu dengan desain modern minimalis. Dilengkapi rak bawah untuk penyimpanan buku atau dekorasi. Cocok untuk ruang tamu bergaya simpel dan elegan.',
      image: 'https://www.orangejkt.com/media/catalog/product/cache/407fef2ff3bc56fe9177307fde992276/image/4976411d/orange-meja-kopi-meja-tamu-meja-minimalis-meja.jpg'
    },
    {
      id: 4,
      name: 'Lemari Pakaian 4 Pintu',
      category: 'bedroom',
      price: 'Rp 6.500.000',
      description: 'Lemari pakaian 4 pintu dengan cermin, dilengkapi laci dan gantungan baju.',
      image: 'https://d2xjmi1k71iy2m.cloudfront.net/dairyfarm/id/images/988/0898845_PE782660_S4.webp'
    },
    {
       id: 5,
      name: 'Tempat Tidur Queen Size',
      category: 'bedroom',
      price: 'Rp 9.500.000',
      description: 'Tempat tidur queen size dengan headboard berlapis, termasuk kasur spring bed.',
      image: 'https://d2xjmi1k71iy2m.cloudfront.net/dairyfarm/id/images/510/1151050_PE884752_S4.webp'
    },
    {
      id: 6,
      name: 'Meja Rias Kamar Tidur',
      category: 'bedroom',
      price: 'Rp 4.000.000',
      description: 'Set meja rias lengkap dengan laci dan cermin besar. Finishing elegan dan mewah, ideal untuk mempercantik kamar tidur sekaligus menyimpan kosmetik dan perhiasan.',
      image: 'https://www.jeparaheritage.id/wp-content/uploads/2019/01/Meja-Rias-Kamar-Tidur-510x540.jpg.webp'
    },
    {
      id: 7,
      name: 'Rak Buku Minimalis',
      category: 'storage',
      price: 'Rp 3.200.000',
      description: 'Rak buku 5 tingkat dengan desain minimalis, cocok untuk ruang kerja atau perpustakaan.',
      image: 'https://uwitan.id/wp-content/uploads/2020/10/1.-Furniture-Rak-Book-Case-4-Tingkat.jpeg'
    },
    {
     id: 8,
      name: 'Rak Sepatu Susun Klasik Modern Kayu Jati',
      category: 'storage',
      price: 'Rp 1.750.000',
      description: 'Rak sepatu serbaguna dengan material kayu jati dan dudukan empuk. Desain klasik modern, cocok untuk foyer atau area masuk rumah.',
      image: 'https://down-id.img.susercontent.com/file/ba817949b151c71850a4c9613d9a62d1'
    },
    {
      id: 9,
      name: 'Lemari Bawah Tangga',
      category: 'storage',
      price: 'Rp 1.999.000',
      description: 'Solusi cerdas untuk ruang terbatas. Lemari custom untuk area bawah tangga dengan kombinasi rak anggur, penyimpanan tertutup, dan pencahayaan elegan.',
      image: 'https://events.rumah123.com/wp-content/uploads/sites/38/2022/11/15123351/lemari-bawah-tangga-1-1024x696.jpg'
    },
    {
      id: 10,
      name: 'Meja Kerja L-Shape',
      category: 'office',
      price: 'Rp 4.500.000',
      description: 'Meja kerja bentuk L dengan laci dan space untuk CPU, ideal untuk home office.',
      image: 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/11/9/4572d6b8-77cd-451c-96d1-30cd7d84b58c.png'
    },
    {
      id: 11,
      name: 'Kursi Kantor Ergonomis',
      category: 'office',
      price: 'Rp 2.800.000',
      description: 'Kursi kantor dengan desain ergonomis, dilengkapi penyangga lumbar dan armrest adjustable.',
      image: 'https://images.steelcase.com/image/upload/c_fill,q_auto,f_auto,h_656,w_1166/v1726162162/23-0213314_16x9.jpg'
    },
    {
      id: 12, 
      name: 'Meja Komputer (1 set)',
      category: 'office',
      price: 'Rp 7.098.000',
      description: 'Paket lengkap meja komputer dengan desain ergonomis dan luas. Cocok untuk kerja remote atau setup gaming. Dilengkapi rak dan ruang kabel tersembunyi.',
      image: 'https://d2xjmi1k71iy2m.cloudfront.net/dairyfarm/id/images/282/1128212_PE876481_S5.jpg'
    },
    {
      id: 13,
      name: 'Cabinet Makan (Credenza)',
      category: 'dining-room',
      price: 'Rp 15.000.000',
      description: 'Cabinet minimalis multifungsi untuk ruang makan atau dapur. Dilengkapi ruang penyimpanan tertutup dan rak terbuka, cocok untuk menyimpan alat makan.',
      image: 'https://images.tokopedia.net/img/cache/500-square/aphluv/1997/1/1/aec8f944becc4873a359d32f8e0f9c63~.jpeg'
    },
    {
      id: 14,
      name: 'Meja Makan Kayu Jati',
      category: 'dining-room',
      price: 'Rp 12.000.000',
      description: 'Meja makan kayu jati solid untuk 6 orang, finishing natural dengan proteksi anti rayap.',
      image: 'https://sfd-craft.com/wp-content/uploads/2018/10/black-forest-table-from-forest'
    },
    {
      id: 15,
      name: 'Mini Bar',
      category: 'dining-room',
      price: 'Rp 58.135.000',
      description: 'Mini bar premium dengan lemari pendingin dan rak gelas gantung. Terbuat dari kayu solid dengan sentuhan klasik. Cocok untuk lounge pribadi ataupun ruang makan.',
      image: 'https://www.sierralivingconcepts.com/images/thumbs/0423504_nahant-traditional-home-bar-hutch-with-mini-fridge-space.jpeg'
    },
    {
      id: 16,
      name: 'Wastafel Kabinet Kamar Mandi Kayu Jati',
      category: 'bathroom',
      price: 'Rp 989.000',
      description: 'Wastafel elegan dengan kabinet kayu jati. Tahan lembap dan tahan lama, memberikan sentuhan alami di kamar mandi Anda.',
      image: 'https://down-id.img.susercontent.com/file/id-11134207-7r98o-ll27ke4vgyd44a'
    },
    {
      id: 17,
      name: 'Rak Handuk Kamar Mandi Stainless',
      category: 'bathroom',
      price: 'Rp 379.000',
      description: 'Rak multifungsi berbahan stainless anti karat, cocok untuk handuk, sabun, dan perlengkapan mandi. Hemat ruang dan stylish.',
      image: 'https://images.renos.id/assets/portal-assets/1185/product/images/aDoOqLgzFn.jpeg'
    },
    {
      id: 18,
      name: 'Kursi Mandi (untuk lansia)',
      category: 'bathroom',
      price: 'Rp 395.000',
      description: 'Kursi mandi anti-slip yang aman dan nyaman untuk lansia. Material kuat dan tahan air, dilengkapi lubang drainase dan pegangan kokoh di kedua sisi. Cocok digunakan untuk lansia.',
      image: 'https://filebroker-cdn.lazada.co.id/kf/S7aebf5805692444a845cce0767434004b.jpg'
    },
    {
      id: 19,
      name: 'Kursi Tamu Outdoor Besi Kayu (1 set)',
      category: 'outdoor',
      price: 'Rp 6.800.000',
      description: 'Satu set kursi outdoor dengan rangka besi dan permukaan kayu. Tahan cuaca dan nyaman untuk bersantai di taman atau teras.',
      image: 'https://sudutkursi.com/wp-content/uploads/2021/07/210-Kursi-Tamu-Outdoor-R42-Besi-Kayu.jpg'
    },
    {
      id: 20,
      name: 'Kursi Balkon Rotan (1 set)',
      category: 'outdoor',
      price: 'Rp 16.500.000',
      description: 'Satu set kursi outdoor dengan rangka besi dan permukaan kayu. Tahan cuaca dan nyaman untuk bersantai di taman atau teras.',
      image: 'https://img.lazcdn.com/g/p/ed9241c9d6b9e24c0be077ad72e11a32.jpg_720x720q80.jpg'
    },
    {
      id: 21,
      name: 'Kursi Ayunan Gantung Rotan Sintetis',
      category: 'outdoor',
      price: 'Rp 5.455.395',
      description: 'Kursi gantung dari rotan sintetis, ideal untuk relaksasi di taman atau ruang terbuka. Dilengkapi bantal duduk yang empuk.',
      image: 'https://down-id.img.susercontent.com/file/id-11134207-7qul8-li9k42fwmowp3f'
    },
    {
      id: 22,
      name: 'Meja TV Minimalis',
      category: 'home-theater',
      price: 'Rp 954.000',
      description: 'Meja TV dengan desain modern minimalis. Dilengkapi rak terbuka dan laci penyimpanan untuk media, buku, dan dekorasi.',
      image: 'https://homedoki.id/cdn/shop/products/5_700x700.jpg?v=1658109318'
    },
    {
      id: 23,
      name: 'Kursi Duduk Teater',
      category: 'home-theater',
      price: 'Rp 77.495.854',
      description: 'Kursi bioskop rumahan dengan fitur reclining, cup holder, dan sandaran empuk. Memberi kenyamanan premium untuk pengalaman menonton terbaik.',
      image: 'https://images-cdn.ubuy.co.in/66925df69178b362b71431c2-sofa-recliner-home-theater-seating.jpg'
    },
    {
      id: 24, 
      name: 'Sofa Teater Diamante',
      category: 'home-theater',
      price: 'Rp 41.985.000',
      description: 'Sofa mewah untuk ruang teater rumah dengan desain elegan dan bantalan tebal. Terdiri dari beberapa seat dan sandaran nyaman.',
      image: 'https://d2sibwvd4p8ypi.cloudfront.net/catalog/product/cache/2/image/9df78eab33525d08d6e5fb8d27136e95/s/e/seatcraft-diamante-sofa-sectional-gallery-05-800x800_6.jpg'
    },
    {
      id: 25,
      name: 'Island Table Top Marmer Carrara Italy',
      category: 'kitchen',
      price: 'Rp 6.771.070',
      description: 'Meja island dapur dengan top marmer Carrara asli dari Italia, memberikan kesan mewah dan elegan untuk dapur modern Anda.',
      image: 'https://down-id.img.susercontent.com/file/id-11134211-7rasj-m1raxte4oit731'
    },
    {
      id: 26,
      name: 'Rak Bumbu Serbaguna Stainless',
      category: 'kitchen',
      price: 'Rp 97.000',
      description: 'Rak serbaguna dari stainless steel yang kokoh dan tahan lama, cocok untuk menyimpan bumbu dan perlengkapan dapur dengan rapi.',
      image: 'https://down-id.img.susercontent.com/file/sg-11134201-23010-q58krlqcsymvde'
    },
    {
      id: 27,
      name: 'Troli Dapur 4 Tingkat-Hitam',
      category: 'kitchen',
      price: 'Rp 1.439.550',
      description: 'Troli dapur praktis dengan empat tingkat penyimpanan dan roda yang memudahkan mobilitas. Tersedia laci dan kabinet untuk peralatan dapur.',
      image: 'https://cdn.ruparupa.io/fit-in/400x400/filters:format(webp)/filters:quality(90)/ruparupa-com/image/upload/Products/10140624_4.jpg'
    },
    {
      id: 28,
      name: 'Meja Konsol Minimalis Marmer',
      category: 'foyer',
      price: 'Rp 6.500.000',
      description: 'Meja konsol elegan dengan desain minimalis dan top marmer, cocok untuk mempercantik foyer, ruang tamu, atau lorong rumah.',
      image: 'https://www.homarindo.com/wp-content/uploads/2024/11/Meja-Konsol-Minimalis-Marmer-Mewah-1.jpg'
    },
    {
      id: 29,
      name: 'Bangku Foyer (1 set)',
      category: 'foyer',
      price: 'Rp 3.799.000',
      description: 'Satu set bangku empuk dengan desain kontemporer, ideal untuk area foyer atau ruang tunggu tamu agar tampil hangat dan profesional.',
      image: 'https://www.emporioarchitect.com/upload/portofolio/1280/desain-rumah-klasik-4-lantai-3251023-4763564251023075722-7.jpg'
    },
    {
      id: 30,
      name: 'Lampu Gantung Kaca 4 Cincin',
      category: 'foyer',
      price: 'Rp 9.889.000',
      description: 'Lampu gantung kristal mewah dengan 4 cincin kaca berlapis, memberikan kesan dramatis dan elegan untuk ruang foyer atau ruang utama.',
      image: 'https://cdnus.globalso.com/showsunlighting/SSC19229.jpg'
    }
  ];


  const categories = [
    { id: 'all', name: 'Semua Produk' },
    { id: 'living-room', name: 'Ruang Tamu' },
    { id: 'dining-room', name: 'Ruang Makan' },
    { id: 'bedroom', name: 'Kamar Tidur' },
    { id: 'bathroom', name: 'Kamar Mandi'},
    { id: 'office', name: 'Kantor' },
    { id: 'storage', name: 'Penyimpanan' },
    { id: 'outdoor', name: 'Luar Ruangan' },
    { id: 'home-theater', name: 'Teater Rumah' },
    { id: 'kitchen', name: 'Dapur'},
    { id: 'foyer', name: 'Foyer'}
  ];

  const filteredProducts = selectedCategory === 'all'
    ? furnitureProducts
    : furnitureProducts.filter(product => product.category === selectedCategory);

  if (isAuthenticated) return null;

  return (
  <div style={{
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    background: 'linear-gradient(to right, #8B4513, #D2691E)'
  }}>
    {/* Navbar */}
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '22px 36px 0 36px',
        borderBottom: '1px solid #e5e7eb',
        background: 'rgba(255,255,255,0.97)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#8B4513',
          margin: 0
        }}>
          🐝 Bee Furniture
        </h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
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
            onClick={() => {
              const el = document.getElementById('home');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >Home</button>
          <button
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
            onClick={() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >About</button>
          <a
            href="/admin/login"
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


    {/* Produk Section */}
    <div style={{
        padding: '20px 30px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(6px)',
        minHeight: '100vh'
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
          <div id="home" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          Mebel Premium adalah brand furnitur modern yang berkomitmen menghadirkan produk berkualitas tinggi dengan harga terjangkau. Kami menggabungkan keindahan desain, kekuatan material, dan kenyamanan dalam setiap produk yang kami hadirkan. Didirikan oleh tim desainer interior dan pengrajin berpengalaman, kami telah dipercaya oleh ratusan pelanggan di seluruh Indonesia.
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
        }}>Fitur Unggulan</h2>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          maxWidth: 1200,
          margin: "0 auto"
        }}>
          <div style={{
            background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
          }}>
            <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Desain Elegan & Modern</div>
            <div>Tiap produk dirancang dengan estetika tinggi yang menyatu dengan berbagai tema interior rumah atau kantor.</div>
          </div>
          <div style={{
            background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
          }}>
            <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Material Berkualitas</div>
            <div>Kami menggunakan kayu solid, kulit sintetis premium, dan bahan ramah lingkungan dalam setiap produk.</div>
          </div>
          <div style={{
            background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
          }}>
            <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Kustomisasi Produk</div>
            <div>Anda bisa menyesuaikan warna, ukuran, atau material produk sesuai kebutuhan dan konsep ruangan Anda.</div>
          </div>
          <div style={{
            background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
          }}>
            <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Pengiriman Aman & Cepat</div>
            <div>Didukung oleh tim logistik terpercaya, produk dikirim dengan packaging aman dan tepat waktu.</div>
          </div>
          <div style={{
            background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
          }}>
            <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Harga Terjangkau</div>
            <div>Kualitas tinggi tidak selalu mahal—kami menawarkan harga kompetitif tanpa kompromi kualitas.</div>
          </div>
          <div style={{
            background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
          }}>
            <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Layanan Pelanggan Ramah</div>
            <div>Tim support kami siap membantu via chat, WhatsApp, atau telepon.</div>
          </div>
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
        }}>Apa Kata Mereka</h2>
        <div style={{
          display: "flex",
          gap: 28,
          maxWidth: 1200,
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <div style={{
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
            "Mebel Premium benar-benar beda! Sofanya empuk dan mewah, cocok banget buat ruang tamu minimalis saya. Pelayanannya juga cepat dan ramah."
            <div style={{ fontWeight: 600, marginTop: 18 }}>— Dilan, Bandung</div>
          </div>
          <div style={{
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
            "Sudah dua kali beli di sini. Meja makan kayu jatinya kokoh dan tampilannya classy. Saya sangat puas!"
            <div style={{ fontWeight: 600, marginTop: 18 }}>— Ezra, Surabaya</div>
          </div>
        </div>
      </div>
        {/* Hubungi Kami */}
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
    Dapatkan konsultasi gratis dan penawaran terbaik dari Bee Furniture untuk menciptakan ruangan impian yang penuh kenyamanan dan modern yang sesuai kebutuhan Anda
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
      </>
    )}
  </div>
);
};

export default CompanyProfile;

// return (
//     <div style={{
//       minHeight: '100vh',
//       backgroundColor: '#f9fafb',
//       background: 'linear-gradient(to right, #8B4513, #D2691E)'
//     }}>
//       {/* Navbar */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '20px',
//         padding: '22px 36px 0 36px',
//         borderBottom: '1px solid #e5e7eb',
//         background: 'rgba(255,255,255,0.97)',
//         position: 'sticky',
//         top: 0,
//         zIndex: 10,
//       }}>
//         <h1 style={{
//           fontSize: '24px',
//           fontWeight: 'bold',
//           color: '#8B4513',
//           margin: 0
//         }}>
//           🐝 Bee Furniture
//         </h1>
//         <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
//           <a
//             href="/admin/login"
//             style={{
//               padding: '8px 16px',
//               backgroundColor: 'transparent',
//               color: '#8B4513',
//               border: '2px solid #8B4513',
//               borderRadius: '6px',
//               textDecoration: 'none',
//               fontWeight: '600',
//               fontSize: '14px',
//               transition: 'all 0.3s ease'
//             }}
//           >
//             Admin Login
//           </a>
//           <a
//             href="/customer/login"
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#8B4513',
//               color: 'white',
//               border: '2px solid #8B4513',
//               borderRadius: '6px',
//               textDecoration: 'none',
//               fontWeight: '600',
//               fontSize: '14px',
//               transition: 'all 0.3s ease'
//             }}
//           >
//             Customer Portal
//           </a>
//         </div>
//       </div>

//       {/* ======= Produk Section ======= */}
//       <div style={{
//         padding: '20px 30px',
//         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//         backdropFilter: 'blur(6px)',
//         minHeight: '100vh'
//       }}>
//         {showProductDetail && selectedProduct ? (
//           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//             <button
//               onClick={handleBackToProducts}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 padding: '12px 20px',
//                 backgroundColor: '#8B4513',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '8px',
//                 fontWeight: '600',
//                 cursor: 'pointer',
//                 marginBottom: '24px',
//                 fontSize: '14px'
//               }}
//             >
//               ← Kembali ke Produk
//             </button>
//             <div style={{
//               backgroundColor: 'white',
//               borderRadius: '16px',
//               overflow: 'hidden',
//               boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
//             }}>
//               <img
//                 src={selectedProduct.image}
//                 alt={selectedProduct.name}
//                 style={{
//                   width: '100%',
//                   height: '400px',
//                   objectFit: 'cover'
//                 }}
//               />
//               <div style={{ padding: '32px' }}>
//                 <h1 style={{
//                   fontSize: '32px',
//                   fontWeight: 'bold',
//                   color: '#8B4513',
//                   marginBottom: '16px'
//                 }}>
//                   {selectedProduct.name}
//                 </h1>
//                 <p style={{
//                   fontSize: '18px',
//                   color: '#654321',
//                   lineHeight: '1.6',
//                   marginBottom: '24px'
//                 }}>
//                   {selectedProduct.description}
//                 </p>
//                 <div style={{
//                   fontSize: '28px',
//                   fontWeight: 'bold',
//                   color: '#8B4513',
//                   marginBottom: '32px'
//                 }}>
//                   {selectedProduct.price}
//                 </div>
//                 {/* Contact Product */}
//                 <div style={{
//                   textAlign: 'center',
//                   backgroundColor: '#FFF8DC',
//                   padding: '40px',
//                   borderRadius: '16px',
//                   border: '2px solid #D2691E'
//                 }}>
//                   <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
//                     Tertarik dengan {selectedProduct.name}?
//                   </h2>
//                   <p style={{ color: '#654321', fontSize: '16px', marginBottom: '20px' }}>
//                     Hubungi tim sales kami untuk informasi lebih lanjut dan penawaran terbaik
//                   </p>
//                   <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
//                     <div>
//                       <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
//                       <span style={{ color: '#654321' }}>+62 812-3456-7890</span>
//                     </div>
//                     <div>
//                       <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
//                       <span style={{ color: '#654321' }}>furniture@mebelkita.com</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//             <div style={{ textAlign: 'center', marginBottom: '48px' }}>
//               <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
//                 🪑 Koleksi Mebel Premium
//               </h1>
//               <p style={{ fontSize: '20px', color: '#654321', marginBottom: '32px', maxWidth: '800px', margin: '0 auto' }}>
//                 Temukan furniture berkualitas tinggi untuk rumah dan kantor Anda.
//                 Desain modern dengan material terbaik dan harga terjangkau.
//               </p>
//             </div>
//             {/* Category Filter */}
//             <div style={{
//               display: 'flex',
//               justifyContent: 'center',
//               flexWrap: 'wrap',
//               gap: '12px',
//               marginBottom: '40px'
//             }}>
//               {categories.map(category => (
//                 <button
//                   key={category.id}
//                   onClick={() => setSelectedCategory(category.id)}
//                   style={{
//                     padding: '12px 24px',
//                     backgroundColor: selectedCategory === category.id ? '#8B4513' : 'transparent',
//                     color: selectedCategory === category.id ? 'white' : '#8B4513',
//                     border: '2px solid #8B4513',
//                     borderRadius: '25px',
//                     cursor: 'pointer',
//                     fontWeight: '600',
//                     fontSize: '14px',
//                     transition: 'all 0.3s ease'
//                   }}
//                 >
//                   {category.name}
//                 </button>
//               ))}
//             </div>
//             {/* Products Grid */}
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//               gap: '24px',
//               marginBottom: '64px'
//             }}>
//               {filteredProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   style={{
//                     backgroundColor: 'white',
//                     borderRadius: '16px',
//                     overflow: 'hidden',
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                     transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//                     cursor: 'pointer'
//                   }}
//                   onClick={() => handleProductDetail(product)}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = 'translateY(-4px)';
//                     e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = 'translateY(0)';
//                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
//                   }}
//                 >
//                   <img
//                     src={product.image}
//                     alt={product.name}
//                     style={{
//                       width: '100%',
//                       height: '200px',
//                       objectFit: 'cover'
//                     }}
//                   />
//                   <div style={{ padding: '24px' }}>
//                     <h3 style={{
//                       color: '#2d1810',
//                       fontWeight: '600',
//                       marginBottom: '8px',
//                       fontSize: '18px'
//                     }}>
//                       {product.name}
//                     </h3>
//                     <p style={{
//                       color: '#6b5b47',
//                       fontSize: '14px',
//                       marginBottom: '16px',
//                       lineHeight: '1.4'
//                     }}>
//                       {product.description.substring(0, 80)}...
//                     </p>
//                     <div style={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'center'
//                     }}>
//                       <span style={{
//                         fontSize: '20px',
//                         fontWeight: '700',
//                         color: '#8B4513'
//                       }}>
//                         {product.price}
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleProductDetail(product);
//                         }}
//                         style={{
//                           backgroundColor: '#D2691E',
//                           color: 'white',
//                           border: 'none',
//                           padding: '10px 20px',
//                           borderRadius: '8px',
//                           cursor: 'pointer',
//                           fontWeight: '600',
//                           fontSize: '14px'
//                         }}
//                       >
//                         Lihat Detail
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {!showProductDetail && (
//       <>
//       {/* ======= Tentang Kami ======= */}
//       <div style={{
//         padding: "60px 15px 20px 15px",
//         background: "#fff",
//         textAlign: "center"
//       }}>
//         <h2 style={{
//           fontWeight: "bold",
//           fontSize: 30,
//           marginBottom: 18,
//           color: "#212529"
//         }}>Tentang Kami</h2>
//         <div style={{
//           maxWidth: 800,
//           margin: "0 auto",
//           color: "#222",
//           fontSize: 20,
//           lineHeight: "1.6"
//         }}>
//           Mebel Premium adalah brand furnitur modern yang berkomitmen menghadirkan produk berkualitas tinggi dengan harga terjangkau. Kami menggabungkan keindahan desain, kekuatan material, dan kenyamanan dalam setiap produk yang kami hadirkan. Didirikan oleh tim desainer interior dan pengrajin berpengalaman, kami telah dipercaya oleh ratusan pelanggan di seluruh Indonesia.
//         </div>
//       </div>

//       {/* ======= Fitur Unggulan ======= */}
//       <div style={{
//         background: "#f7fafd",
//         padding: "40px 0 60px 0",
//       }}>
//         <h2 style={{
//           fontWeight: "bold",
//           fontSize: 30,
//           marginBottom: 34,
//           color: "#212529",
//           textAlign: "center"
//         }}>Fitur Unggulan</h2>
//         <div style={{
//           display: "flex",
//           flexWrap: "wrap",
//           justifyContent: "center",
//           gap: 24,
//           maxWidth: 1200,
//           margin: "0 auto"
//         }}>
//           <div style={{
//             background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
//           }}>
//             <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Desain Elegan & Modern</div>
//             <div>Tiap produk dirancang dengan estetika tinggi yang menyatu dengan berbagai tema interior rumah atau kantor.</div>
//           </div>
//           <div style={{
//             background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
//           }}>
//             <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Material Berkualitas</div>
//             <div>Kami menggunakan kayu solid, kulit sintetis premium, dan bahan ramah lingkungan dalam setiap produk.</div>
//           </div>
//           <div style={{
//             background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
//           }}>
//             <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Kustomisasi Produk</div>
//             <div>Anda bisa menyesuaikan warna, ukuran, atau material produk sesuai kebutuhan dan konsep ruangan Anda.</div>
//           </div>
//           <div style={{
//             background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
//           }}>
//             <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Pengiriman Aman & Cepat</div>
//             <div>Didukung oleh tim logistik terpercaya, produk dikirim dengan packaging aman dan tepat waktu.</div>
//           </div>
//           <div style={{
//             background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
//           }}>
//             <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Harga Terjangkau</div>
//             <div>Kualitas tinggi tidak selalu mahal—kami menawarkan harga kompetitif tanpa kompromi kualitas.</div>
//           </div>
//           <div style={{
//             background: "#fff", borderRadius: 18, padding: "32px 28px", minWidth: 300, maxWidth: 400, flex: 1, margin: 10, boxShadow: "0 3px 12px rgba(160, 150, 120, 0.08)"
//           }}>
//             <div style={{ fontWeight: "bold", color: "#A0522D", fontSize: 22, marginBottom: 10 }}>Layanan Pelanggan Ramah</div>
//             <div>Tim support kami siap membantu via chat, WhatsApp, atau telepon.</div>
//           </div>
//         </div>
//       </div>

//       {/* ======= Apa Kata Mereka ======= */}
//       <div style={{
//         background: "#fdf6db",
//         padding: "60px 0"
//       }}>
//         <h2 style={{
//           fontWeight: "bold",
//           fontSize: 30,
//           marginBottom: 38,
//           color: "#232832",
//           textAlign: "center"
//         }}>Apa Kata Mereka</h2>
//         <div style={{
//           display: "flex",
//           gap: 28,
//           maxWidth: 1200,
//           margin: "0 auto",
//           flexWrap: "wrap",
//           justifyContent: "center"
//         }}>
//           <div style={{
//             background: "#fff",
//             borderRadius: 18,
//             padding: "38px 32px",
//             minWidth: 380,
//             maxWidth: 500,
//             margin: 10,
//             boxShadow: "0 3px 16px rgba(200, 185, 110, 0.08)",
//             fontSize: 18,
//             color: "#232832"
//           }}>
//             "Mebel Premium benar-benar beda! Sofanya empuk dan mewah, cocok banget buat ruang tamu minimalis saya. Pelayanannya juga cepat dan ramah."
//             <div style={{ fontWeight: 600, marginTop: 18 }}>— Dilan, Bandung</div>
//           </div>
//           <div style={{
//             background: "#fff",
//             borderRadius: 18,
//             padding: "38px 32px",
//             minWidth: 380,
//             maxWidth: 500,
//             margin: 10,
//             boxShadow: "0 3px 16px rgba(200, 185, 110, 0.08)",
//             fontSize: 18,
//             color: "#232832"
//           }}>
//             "Sudah dua kali beli di sini. Meja makan kayu jatinya kokoh dan tampilannya classy. Saya sangat puas!"
//             <div style={{ fontWeight: 600, marginTop: 18 }}>— Ezra, Surabaya</div>
//           </div>
//         </div>
//       </div>

//       {/* ======= Hubungi Kami ======= */}
//       <div style={{
//         textAlign: 'center',
//         backgroundColor: '#FFF8DC',
//         padding: '40px',
//         borderRadius: '16px',
//         border: '2px solid #D2691E'
//       }}>
//         <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B4513', marginBottom: '16px' }}>
//           📞 Hubungi Kami untuk Konsultasi
//         </h2>
//         <p style={{ color: '#654321', fontSize: '16px', marginBottom: '20px' }}>
//           Dapatkan konsultasi gratis dan penawaran terbaik dari Bee Furniture untuk menciptakan ruangan impian yang penuh kenyamanan dan modern yang sesuai kebutuhan Anda
//         </p>
//         <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
//           <div>
//             <strong style={{ color: '#8B4513' }}>📧 Email:</strong><br />
//             <span style={{ color: '#654321' }}>furniture@mebelkita.com</span>
//           </div>
//           <div>
//             <strong style={{ color: '#8B4513' }}>📱 WhatsApp:</strong><br />
//             <span style={{ color: '#654321' }}>+62 812-3456-7890</span>
//           </div>
//           <div>
//             <strong style={{ color: '#8B4513' }}>🏪 Showroom:</strong><br />
//             <span style={{ color: '#654321' }}>Jl. Mebel Raya No. 123, Jakarta</span>
//           </div>
//         </div>
//       </div>
//     </div>
//     </>
//   )}
//   );
// };

// export default CompanyProfile;
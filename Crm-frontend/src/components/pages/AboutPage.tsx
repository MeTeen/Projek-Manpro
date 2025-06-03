// pages/AboutPage.tsx
import { useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import { Button } from '../ui';

export default function AboutPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    const teamMembers = [
        { name: 'Tim Developer', role: 'Full Stack Development', avatar: '👨‍💻' },
        { name: 'Tim UI/UX', role: 'Design & User Experience', avatar: '🎨' },
        { name: 'Tim Project Manager', role: 'Project Management', avatar: '📋' },
    ];

    const features = [
        { icon: '👥', title: 'Manajemen Pelanggan', description: 'Kelola data pelanggan dengan mudah dan efisien' },
        { icon: '📦', title: 'Manajemen Produk', description: 'Atur inventori dan katalog produk secara terpusat' },
        { icon: '💰', title: 'Transaction', description: 'Proses dan monitor semua transaksi penjualan' },
        { icon: '📊', title: 'Analytics', description: 'Analisis mendalam terhadap performa bisnis' },
        { icon: '🎯', title: 'Promosi', description: 'Kelola kampanye dan promosi produk' },
        { icon: '✅', title: 'Task Management', description: 'Organisasi tugas dan follow-up pelanggan' },
    ];    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <Header 
                    onAddNewClick={() => {}} 
                    onCustomerCreated={() => {}}
                />
                <main style={{ padding: '24px' }}>
                    <div style={{ maxWidth: '896px', margin: '0 auto' }}>
                        {/* Hero Section */}
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <h1 style={{ 
                                fontSize: '36px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '16px' 
                            }}>
                                Tentang CRM Dashboard
                            </h1>
                            <p style={{ 
                                fontSize: '20px', 
                                color: '#4b5563', 
                                marginBottom: '32px' 
                            }}>
                                Solusi manajemen hubungan pelanggan yang komprehensif untuk bisnis modern
                            </p>
                            <div style={{ 
                                background: 'linear-gradient(to right, #3b82f6, #9333ea)', 
                                color: 'white', 
                                padding: '32px', 
                                borderRadius: '8px', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                            }}>
                                <h2 style={{ 
                                    fontSize: '24px', 
                                    fontWeight: 'bold', 
                                    marginBottom: '16px' 
                                }}>
                                    Dibuat dengan ❤️ untuk Manajemen Proyek
                                </h2>
                                <p style={{ 
                                    fontSize: '18px', 
                                    opacity: 0.9 
                                }}>
                                    Aplikasi ini dikembangkan sebagai bagian dari mata kuliah Manajemen Proyek, 
                                    menggabungkan teori dan praktik dalam pengembangan sistem informasi bisnis.
                                </p>
                            </div>
                        </div>                        {/* Features Section */}
                        <div style={{ marginBottom: '48px' }}>
                            <h2 style={{ 
                                fontSize: '30px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '32px', 
                                textAlign: 'center' 
                            }}>
                                Fitur Utama
                            </h2>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                gap: '24px' 
                            }}>
                                {features.map((feature, index) => (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            backgroundColor: 'white', 
                                            padding: '24px', 
                                            borderRadius: '8px', 
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
                                            border: '1px solid #e5e7eb',
                                            transition: 'box-shadow 0.2s',
                                            cursor: 'default'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        <div style={{ fontSize: '30px', marginBottom: '16px' }}>
                                            {feature.icon}
                                        </div>
                                        <h3 style={{ 
                                            fontSize: '20px', 
                                            fontWeight: '600', 
                                            color: '#111827', 
                                            marginBottom: '8px' 
                                        }}>
                                            {feature.title}
                                        </h3>
                                        <p style={{ color: '#4b5563' }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>                        {/* Team Section */}
                        <div style={{ marginBottom: '48px' }}>
                            <h2 style={{ 
                                fontSize: '30px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '32px', 
                                textAlign: 'center' 
                            }}>
                                Tim Pengembang
                            </h2>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                                gap: '24px' 
                            }}>
                                {teamMembers.map((member, index) => (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            backgroundColor: 'white', 
                                            padding: '24px', 
                                            borderRadius: '8px', 
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
                                            border: '1px solid #e5e7eb', 
                                            textAlign: 'center' 
                                        }}
                                    >
                                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>
                                            {member.avatar}
                                        </div>
                                        <h3 style={{ 
                                            fontSize: '20px', 
                                            fontWeight: '600', 
                                            color: '#111827', 
                                            marginBottom: '8px' 
                                        }}>
                                            {member.name}
                                        </h3>
                                        <p style={{ color: '#4b5563' }}>
                                            {member.role}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>                        {/* Technology Stack */}
                        <div style={{ marginBottom: '48px' }}>
                            <h2 style={{ 
                                fontSize: '30px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '32px', 
                                textAlign: 'center' 
                            }}>
                                Teknologi yang Digunakan
                            </h2>
                            <div style={{ 
                                backgroundColor: 'white', 
                                padding: '32px', 
                                borderRadius: '8px', 
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
                                border: '1px solid #e5e7eb' 
                            }}>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                                    gap: '24px', 
                                    textAlign: 'center' 
                                }}>
                                    <div>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚛️</div>
                                        <h4 style={{ fontWeight: '600' }}>React</h4>
                                        <p style={{ fontSize: '14px', color: '#4b5563' }}>Frontend Framework</p>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📘</div>
                                        <h4 style={{ fontWeight: '600' }}>TypeScript</h4>
                                        <p style={{ fontSize: '14px', color: '#4b5563' }}>Type Safety</p>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
                                        <h4 style={{ fontWeight: '600' }}>Inline Styles</h4>
                                        <p style={{ fontSize: '14px', color: '#4b5563' }}>Styling</p>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                                        <h4 style={{ fontWeight: '600' }}>Recharts</h4>
                                        <p style={{ fontSize: '14px', color: '#4b5563' }}>Data Visualization</p>
                                    </div>
                                </div>
                            </div>
                        </div>                        {/* Contact Section */}
                        <div style={{ 
                            textAlign: 'center', 
                            backgroundColor: '#f3f4f6', 
                            padding: '32px', 
                            borderRadius: '8px' 
                        }}>
                            <h2 style={{ 
                                fontSize: '24px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '16px' 
                            }}>
                                Butuh Bantuan?
                            </h2>
                            <p style={{ 
                                color: '#4b5563', 
                                marginBottom: '24px' 
                            }}>
                                Jika Anda memiliki pertanyaan atau saran mengenai aplikasi ini, 
                                jangan ragu untuk menghubungi tim pengembang.
                            </p>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <Button variant="primary">
                                    📧 Hubungi Tim
                                </Button>
                                <Button variant="outline">
                                    📚 Dokumentasi
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
  
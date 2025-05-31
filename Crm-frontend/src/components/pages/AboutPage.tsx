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
        { icon: '💰', title: 'Transaksi', description: 'Proses dan monitor semua transaksi penjualan' },
        { icon: '📊', title: 'Analytics', description: 'Analisis mendalam terhadap performa bisnis' },
        { icon: '🎯', title: 'Promosi', description: 'Kelola kampanye dan promosi produk' },
        { icon: '✅', title: 'Task Management', description: 'Organisasi tugas dan follow-up pelanggan' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div className="flex-1 overflow-y-auto">
                <Header 
                    onAddNewClick={() => {}} 
                    onCustomerCreated={() => {}}
                />
                <main className="p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Hero Section */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Tentang CRM Dashboard
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Solusi manajemen hubungan pelanggan yang komprehensif untuk bisnis modern
                            </p>
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-bold mb-4">Dibuat dengan ❤️ untuk Manajemen Proyek</h2>
                                <p className="text-lg opacity-90">
                                    Aplikasi ini dikembangkan sebagai bagian dari mata kuliah Manajemen Proyek, 
                                    menggabungkan teori dan praktik dalam pengembangan sistem informasi bisnis.
                                </p>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Fitur Utama</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {features.map((feature, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                        <div className="text-3xl mb-4">{feature.icon}</div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team Section */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tim Pengembang</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {teamMembers.map((member, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                                        <div className="text-4xl mb-4">{member.avatar}</div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                                        <p className="text-gray-600">{member.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Technology Stack */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Teknologi yang Digunakan</h2>
                            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                                    <div>
                                        <div className="text-2xl mb-2">⚛️</div>
                                        <h4 className="font-semibold">React</h4>
                                        <p className="text-sm text-gray-600">Frontend Framework</p>
                                    </div>
                                    <div>
                                        <div className="text-2xl mb-2">📘</div>
                                        <h4 className="font-semibold">TypeScript</h4>
                                        <p className="text-sm text-gray-600">Type Safety</p>
                                    </div>
                                    <div>
                                        <div className="text-2xl mb-2">🎨</div>
                                        <h4 className="font-semibold">Tailwind CSS</h4>
                                        <p className="text-sm text-gray-600">Styling</p>
                                    </div>
                                    <div>
                                        <div className="text-2xl mb-2">📊</div>
                                        <h4 className="font-semibold">Recharts</h4>
                                        <p className="text-sm text-gray-600">Data Visualization</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="text-center bg-gray-100 p-8 rounded-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Butuh Bantuan?</h2>
                            <p className="text-gray-600 mb-6">
                                Jika Anda memiliki pertanyaan atau saran mengenai aplikasi ini, 
                                jangan ragu untuk menghubungi tim pengembang.
                            </p>
                            <div className="space-x-4">
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
  
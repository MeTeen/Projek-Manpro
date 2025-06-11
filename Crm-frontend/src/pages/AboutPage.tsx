// pages/AboutPage.tsx
import { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import { Button, NeedHelp } from '../components/ui';

export default function AboutPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);    const teamMembers = [
        { name: 'Development Team', role: 'Full Stack Development', avatar: '👨‍💻' },
        { name: 'UI/UX Team', role: 'Design & User Experience', avatar: '🎨' },
        { name: 'Project Manager Team', role: 'Project Management', avatar: '📋' },
    ];const features = [
        { icon: '👥', title: 'Customer Management', description: 'Manage customer data easily and efficiently' },
        { icon: '📦', title: 'Product Management', description: 'Centrally organize inventory and product catalog' },
        { icon: '💰', title: 'Transaction', description: 'Process and monitor all sales transactions' },
        { icon: '📊', title: 'Analytics', description: 'Deep analysis of business performance' },
        { icon: '🎯', title: 'Promotion', description: 'Manage campaigns and product promotions' },
        { icon: '✅', title: 'Task Management', description: 'Organize tasks and customer follow-ups' },
    ];    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '20px 30px' }}>
                    <Header 
                        onAddNewClick={() => {}} 
                        onCustomerCreated={() => {}}
                    />
                    <main>
                        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
                        {/* Hero Section */}
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <h1 style={{ 
                                fontSize: '36px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '16px'                            }}>
                                About CRM Dashboard
                            </h1>
                            <p style={{ 
                                fontSize: '20px', 
                                color: '#4b5563', 
                                marginBottom: '32px' 
                            }}>
                                A comprehensive customer relationship management solution for modern businesses
                            </p>
                            <div style={{ 
                                background: 'linear-gradient(to right, #3b82f6, #9333ea)', 
                                color: 'white', 
                                padding: '32px', 
                                borderRadius: '8px', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                            }}>                                <h2 style={{ 
                                    fontSize: '24px', 
                                    fontWeight: 'bold', 
                                    marginBottom: '16px' 
                                }}>
                                    Made with ❤️ for Project Management
                                </h2>
                                <p style={{ 
                                    fontSize: '18px', 
                                    opacity: 0.9 
                                }}>
                                    This application was developed as part of the Project Management course, 
                                    combining theory and practice in business information system development.
                                </p>
                            </div>
                        </div>                        {/* Features Section */}
                        <div style={{ marginBottom: '48px' }}>                            <h2 style={{ 
                                fontSize: '30px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '32px', 
                                textAlign: 'center' 
                            }}>
                                Main Features
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
                        <div style={{ marginBottom: '48px' }}>                            <h2 style={{ 
                                fontSize: '30px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '32px', 
                                textAlign: 'center' 
                            }}>
                                Development Team
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
                        <div style={{ marginBottom: '48px' }}>                            <h2 style={{ 
                                fontSize: '30px', 
                                fontWeight: 'bold', 
                                color: '#111827', 
                                marginBottom: '32px', 
                                textAlign: 'center' 
                            }}>
                                Technologies Used
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
                        <NeedHelp 
                          variant="admin"
                          title="Need Help?"
                          description="If you have any questions or suggestions about this application, feel free to contact the development team."
                          buttons={
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                              <Button variant="primary">
                                📧 Contact Team
                              </Button>
                              <Button variant="outline">
                                📚 Documentation
                              </Button>
                            </div>
                          }
                          containerStyle={{
                            padding: '32px',
                            borderRadius: '8px'
                          }}
                        />
                    </div>
                </main>
                </div>
            </div>
        </div>
    );
}
  
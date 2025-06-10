import React, { useState } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';

const CompanyProfile: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(to right, #1e3a8a, #3b82f6)' }}>
        <div style={{ padding: '20px 30px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(6px)' }}>
          <Header onAddNewClick={() => {}} onCustomerCreated={() => {}} />
          <main>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '16px' }}>
                  About Our Company
                </h1>
                <p style={{ fontSize: '20px', color: '#334155', marginBottom: '32px' }}>
                  We build smart CRM systems that help businesses manage customers efficiently, streamline operations, and improve service satisfaction.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '12px' }}>Our Mission</h2>
                  <p style={{ color: '#475569' }}>
                    To provide powerful, efficient, and user-friendly digital solutions that help businesses build strong, long-lasting customer relationships.
                  </p>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '12px' }}>Our Vision</h2>
                  <p style={{ color: '#475569' }}>
                    To be the most trusted CRM platform in Indonesia, delivering speed, innovation, and seamless integrations to our clients.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center', color: '#1e293b', marginBottom: '32px' }}>
                  🌟 Our Achievements
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', textAlign: 'center' }}>
                  {[
                    ['50+', 'Corporate Clients'],
                    ['99%', 'Satisfaction Rate'],
                    ['24/7', 'Support Availability'],
                    ['10+', 'Years Experience']
                  ].map(([value, label], i) => (
                    <div key={i} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#0ea5e9' }}>{value}</span>
                      <p style={{ marginTop: '8px', color: '#475569' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center', backgroundColor: '#dbeafe', padding: '32px', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af', marginBottom: '16px' }}>
                  Get in Touch
                </h2>
                <p style={{ color: '#334155', fontSize: '16px' }}>
                  Email: <strong>contact@crmcompany.com</strong><br />
                  Phone: <strong>+62 812-3456-7890</strong>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;

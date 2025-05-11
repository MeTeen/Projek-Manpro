import React from "react";

interface PromoSectionProps {
  title?: string;
}

const PromoSection: React.FC<PromoSectionProps> = ({ title = "Recent Promo" }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <a href="#" className="view-all">View All</a>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '24px' }}>
        {/* Left Column - Next Promo Card */}
        <div style={{ gridColumn: 'span 4 / span 4' }}>
          <div className="next-promo-card">
            {/* Blue dot in the top right */}
            <div className="status-dot"></div>
            
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontWeight: '500' }}>Next Promo</h3>
            </div>
            
            {/* Customer avatar */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div className="customer-avatar">
                D
              </div>
              <div>
                <h3 className="customer-name">Customer D</h3>
                <p className="customer-location">Surabaya, Jawa Timur</p>
              </div>
            </div>
            
            {/* Expiry */}
            <div className="expiry-info">
              <p className="info-label">Expired on</p>
              <p style={{ fontSize: '14px' }}>Mar 23 2023, 23:59</p>
            </div>
            
            {/* Metrics */}
            <div className="promo-metrics">
              <div>
                <p className="info-label">Total Spend</p>
                <p style={{ fontWeight: '500' }}>300 $</p>
              </div>
              <div>
                <p className="info-label">Total Purchase</p>
                <p style={{ fontWeight: '500' }}>8x</p>
              </div>
            </div>
            
            {/* Discount */}
            <div style={{ marginBottom: '20px' }}>
              <p className="info-label">Discount</p>
              <p style={{ fontWeight: '500' }}>10%</p>
            </div>
            
            {/* Accept button */}
            <button className="accept-button">
              Accept Promo
            </button>
          </div>
        </div>
        
        {/* Middle Column - Customer Cards */}
        <div style={{ gridColumn: 'span 8 / span 8' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Customer A */}
            <div className="customer-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div className="customer-letter letter-a">
                  A
                </div>
                <div className="customer-details">
                  <h3 style={{ fontWeight: '500' }}>Customer A</h3>
                  <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                    Total Spend: 339$ | Total Purchase: 8x
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Jan 14, 07:00 AM</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '44px' }}>
                <span className="discount-badge">
                  Discount 10%
                </span>
              </div>
            </div>
            
            {/* Customer B */}
            <div className="customer-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div className="customer-letter letter-b">
                  B
                </div>
                <div className="customer-details">
                  <h3 style={{ fontWeight: '500' }}>Customer B</h3>
                  <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                    Total Spend: 429$ | Total Purchase: 3x
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Nov 17, 10:00 AM</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '44px' }}>
                <span className="discount-badge">
                  Discount 10%
                </span>
              </div>
            </div>
            
            {/* Customer A with Purchased */}
            <div className="customer-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div className="customer-letter letter-a">
                  A
                </div>
                <div className="customer-details">
                  <h3 style={{ fontWeight: '500' }}>Customer A</h3>
                  <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                    Total Spend: 339$ | Total Purchase: 8x
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="purchased-badge">
                    PURCHASED
                  </span>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="order-date">12 September 2024</div>
            <div className="order-item">
              <div className="order-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              1 pcs | Order Meja Kayu | 25 cm x 16 cm x 10 cm
            </div>
            
            <div className="order-date">5 September 2024</div>
            <div className="order-item">
              <div className="order-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              4 pcs | Order Kursi Kayu | 47 cm x 37 cm x 27 cm
            </div>
            
            <button className="load-more">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoSection; 
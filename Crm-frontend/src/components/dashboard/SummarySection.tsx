import React from 'react';

interface SummarySectionProps {
  customerCount?: number;
  promoCount?: number;
}

const SummarySection: React.FC<SummarySectionProps> = ({ 
  customerCount = 5, 
  promoCount = 9 
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '24px' }}>
      <div style={{ gridColumn: 'span 6 / span 6' }}>
        <div className="summary-card">
          <div className="summary-info">
            <h3 className="summary-label">Customers</h3>
            <p className="summary-value">{customerCount}</p>
          </div>
          <div className="summary-icon icon-customers">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>
      </div>
      <div style={{ gridColumn: 'span 6 / span 6' }}>
        <div className="summary-card">
          <div className="summary-info">
            <h3 className="summary-label">Promo</h3>
            <p className="summary-value">{promoCount}</p>
          </div>
          <div className="summary-icon icon-promo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection; 
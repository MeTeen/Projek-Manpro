import React from 'react';

const PromoCard: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#4f46e5',
      color: 'white',
      borderRadius: '8px',
      padding: '10px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Blue dot in the top right */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        height: '8px',
        width: '8px',
        backgroundColor: 'white',
        borderRadius: '50%'
      }}></div>
      
      {/* Customer avatar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          height: '40px',
          width: '40px',
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          marginRight: '12px'
        }}>
          D
        </div>
        <div>
          <h3 style={{ fontWeight: '500', margin: '0' }}>Customer D</h3>
          <p style={{ fontSize: '14px', color: '#c7d2fe', margin: '0' }}>Surabaya, Jawa Timur</p>
        </div>
      </div>
      
      {/* Expiry */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', color: '#c7d2fe', margin: '0' }}>Expired on</p>
        <p style={{ fontSize: '14px', margin: '0' }}>Mar 23 2023, 23:59</p>
      </div>
      {/* Metrics */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', color: '#C7D2FE', marginBottom: '4px' }}>Total Spend</p>
          <p style={{ fontWeight: 500 }}>300 $</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', color: '#C7D2FE', marginBottom: '4px' }}>Total Purchase</p>
          <p style={{ fontWeight: 500 }}>8x</p>
        </div>
      </div>
        {/* Discount */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: '#c7d2fe', margin: '0' }}>Discount</p>
        <p style={{ fontWeight: '500', margin: '0' }}>10%</p>
      </div>
      
      {/* Accept button */}
      <button style={{
        backgroundColor: 'white',
        color: '#4f46e5',
        borderRadius: '6px',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: '16px',
        paddingRight: '16px',
        width: '100%',
        fontSize: '14px',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer'
      }}>
        Accept Promo
      </button>
    </div>
  );
};

export default PromoCard;

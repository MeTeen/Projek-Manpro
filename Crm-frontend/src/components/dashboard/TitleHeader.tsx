import React from 'react';

interface TitleHeaderProps {
  title: string;
  subtitle: string;
}

const TitleHeader: React.FC<TitleHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="title-header" style={{ marginBottom: '24px' }}>
      <h1 style={{ 
        fontSize: '22px', 
        fontWeight: '600', 
        margin: '0 0 8px 0', 
        color: '#1f2937' 
      }}>
        {title}
      </h1>
      <p style={{ 
        fontSize: '14px', 
        margin: 0, 
        color: '#64748b' 
      }}>
        {subtitle}
      </p>
    </div>
  );
};

export default TitleHeader; 
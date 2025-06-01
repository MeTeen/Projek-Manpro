import React from 'react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color?: string;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  color = '#4F46E5', 
  isLoading = false,
  trend 
}) => {
  const getColorStyles = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      '#10B981': { bg: '#ecfdf5', text: '#059669' },
      '#3B82F6': { bg: '#dbeafe', text: '#2563eb' },
      '#F59E0B': { bg: '#fef3c7', text: '#d97706' },
      '#8B5CF6': { bg: '#f3e8ff', text: '#7c3aed' },
      '#EF4444': { bg: '#fee2e2', text: '#dc2626' },
      '#EC4899': { bg: '#fce7f3', text: '#db2777' },
      '#4F46E5': { bg: '#eef2ff', text: '#4f46e5' },
    };
    return colorMap[color] || { bg: '#eef2ff', text: '#4f46e5' };
  };

  const colorStyles = getColorStyles(color);
    return (
    <Card hover>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{title}</h3>
        <div style={{ 
          backgroundColor: colorStyles.bg,
          color: colorStyles.text,
          borderRadius: '50%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          flexShrink: 0
        }}>
          {icon}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', lineHeight: '1' }}>
            {isLoading ? (
              <div style={{ backgroundColor: '#e5e7eb', height: '32px', width: '64px', borderRadius: '4px' }}></div>
            ) : (
              value
            )}
          </span>
          {trend && (
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '500', 
              padding: '4px 8px', 
              borderRadius: '50px',
              backgroundColor: trend.isPositive ? '#dcfce7' : '#fee2e2',
              color: trend.isPositive ? '#166534' : '#991b1b'
            }}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        
        {description && (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, marginTop: '8px', lineHeight: '1.5' }}>{description}</p>
        )}
      </div>
    </Card>
  );
};

export default StatCard;

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
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      '#10B981': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
      '#3B82F6': { bg: 'bg-blue-50', text: 'text-blue-600' },
      '#F59E0B': { bg: 'bg-amber-50', text: 'text-amber-600' },
      '#8B5CF6': { bg: 'bg-purple-50', text: 'text-purple-600' },
      '#EF4444': { bg: 'bg-red-50', text: 'text-red-600' },
      '#EC4899': { bg: 'bg-pink-50', text: 'text-pink-600' },
      '#4F46E5': { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    };
    return colorMap[color] || { bg: 'bg-indigo-50', text: 'text-indigo-600' };
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg" hover>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-gray-600 truncate">{title}</h3>
        <div className={`${colorClasses.bg} ${colorClasses.text} rounded-full p-2 flex items-center justify-center w-10 h-10 flex-shrink-0`}>
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 leading-none">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              value
            )}
          </span>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
        )}
      </div>
    </Card>
  );
};

export default StatCard;

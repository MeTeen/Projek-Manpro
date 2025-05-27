// src/components/charts/ReusablePieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartDataItem {
  name: string;
  value: number;
  fill: string; // Warna untuk setiap slice
}

interface ReusablePieChartProps {
  data: PieChartDataItem[];
  title?: string;
}

const ReusablePieChart: React.FC<ReusablePieChartProps> = ({ data, title }) => {
  return (
    <div style={{ width: '100%', height: 350, marginBottom: '30px' }}>
      {title && <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>}
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString('id-ID')} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReusablePieChart;
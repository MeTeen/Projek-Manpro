// src/components/charts/ReusableLineChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface LineChartDataItem {
  name: string; // Label untuk sumbu X (misal: tanggal, bulan)
  value: number; // Nilai untuk sumbu Y
  // Anda bisa memiliki beberapa line, misal: { name: 'Jan', sales: 400, transactions: 20 }
  [key: string]: any; // Untuk mendukung beberapa line
}

interface LineConfig {
    key: string; // key dari data untuk line ini
    color: string;
    name?: string; // nama yang tampil di legend
}

interface ReusableLineChartProps {
  data: LineChartDataItem[];
  xAxisKey: string;
  lines: LineConfig[]; // Array konfigurasi untuk setiap line
  title?: string;
}

const ReusableLineChart: React.FC<ReusableLineChartProps> = ({
  data,
  xAxisKey,
  lines,
  title
}) => {
  return (
    <div style={{ width: '100%', height: 300, marginBottom: '30px' }}>
      {title && <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>}
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => {
                if (name.toLowerCase().includes('pendapatan') || name.toLowerCase().includes('sales')) {
                    return [`Rp ${value.toLocaleString('id-ID')}`, name];
                }
                return [value.toLocaleString('id-ID'), name];
            }}
          />
          <Legend />
          {lines.map(line => (
            <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} name={line.name || line.key} activeDot={{ r: 8 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReusableLineChart;
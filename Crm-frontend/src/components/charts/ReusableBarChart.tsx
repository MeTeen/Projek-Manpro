// src/components/charts/ReusableBarChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell // Untuk warna kustom per bar jika perlu
} from 'recharts';

interface BarChartDataItem {
  name: string; // Label untuk sumbu X
  value: number; // Nilai untuk sumbu Y
  // Bisa tambahkan properti lain jika diperlukan, misal untuk warna
  fill?: string;
}

interface ReusableBarChartProps {
  data: BarChartDataItem[];
  xAxisKey: string; // 'name' dari BarChartDataItem
  dataKey: string;  // 'value' dari BarChartDataItem
  barColor?: string; // Warna default untuk bar, bisa juga array warna
  title?: string;
  // Tambahkan props lain untuk kustomisasi (layout, custom tooltip, dll.)
}

const ReusableBarChart: React.FC<ReusableBarChartProps> = ({
  data,
  xAxisKey,
  dataKey,
  barColor = "#8884d8", // Warna default
  title
}) => {
  return (
    <div style={{ width: '100%', height: 300, marginBottom: '30px' }}>
      {title && <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>}
      <ResponsiveContainer>
        <BarChart
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
            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Jumlah']} // Contoh formatter
          />
          <Legend />
          <Bar dataKey={dataKey} fill={barColor}>
            {/* Jika ingin warna berbeda per bar berdasarkan data */}
            {/* {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || barColor} />
            ))} */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReusableBarChart;
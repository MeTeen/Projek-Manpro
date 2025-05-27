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
  // value: number; // Tidak lagi diperlukan jika ada beberapa lines dengan key berbeda
  [key: string]: any; // Untuk mendukung beberapa line
}

interface LineConfig {
    key: string; // key dari data untuk line ini
    color: string;
    name?: string; // nama yang tampil di legend
    yAxisId?: string; // ID sumbu Y yang akan digunakan ('left' atau 'right')
}

interface ReusableLineChartProps {
  data: LineChartDataItem[];
  xAxisKey: string;
  lines: LineConfig[];
  title?: string;
  // Opsional: label untuk sumbu Y kiri dan kanan
  yAxisLeftLabel?: string;
  yAxisRightLabel?: string;
}

const ReusableLineChart: React.FC<ReusableLineChartProps> = ({
  data,
  xAxisKey,
  lines,
  title,
  yAxisLeftLabel,
  yAxisRightLabel
}) => {
  // Tentukan apakah ada line yang menggunakan sumbu Y kanan
  const hasRightYAxis = lines.some(line => line.yAxisId === 'right');

  return (
    <div style={{ width: '100%', height: 350, marginBottom: '30px' }}> {/* Tambah tinggi chart */}
      {title && <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{title}</h3>}
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: hasRightYAxis ? 30 : 20, // Beri ruang lebih jika ada sumbu Y kanan
            left: 20,
            bottom: 20, // Beri ruang lebih untuk label sumbu X jika panjang
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          
          {/* Sumbu Y Kiri (Default) */}
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} // Asumsi ini untuk Rupiah
            tick={{ fontSize: 12 }}
            label={yAxisLeftLabel ? { value: yAxisLeftLabel, angle: -90, position: 'insideLeft', dy: 70, fontSize: 14 } : undefined}
          />

          {/* Sumbu Y Kanan (Jika ada line yang membutuhkannya) */}
          {hasRightYAxis && (
            <YAxis
              yAxisId="right"
              orientation="right" // Posisikan di kanan
              tickFormatter={(value) => value.toLocaleString('id-ID')} // Format angka biasa
              tick={{ fontSize: 12 }}
              label={yAxisRightLabel ? { value: yAxisRightLabel, angle: 90, position: 'insideRight', dy: -70, fontSize: 14 } : undefined}
            />
          )}

          <Tooltip
            formatter={(value: number, name: string, props: any) => {
                // Cek yAxisId dari props.payload (jika ada) atau dari konfigurasi line
                const lineConfig = lines.find(l => l.name === name || l.key === props.dataKey);
                if (lineConfig?.yAxisId === 'right') { // Atau jika nama mengandung "Transaksi"
                    return [value.toLocaleString('id-ID'), name];
                }
                return [`Rp ${value.toLocaleString('id-ID')}`, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {lines.map(line => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name || line.key}
              yAxisId={line.yAxisId || "left"} // Tentukan sumbu Y yang digunakan
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReusableLineChart;
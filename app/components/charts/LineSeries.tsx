'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type LineSeriesProps = {
  data: Array<{ date: string; [key: string]: any }>;
  lines: Array<{ dataKey: string; name: string; color?: string }>;
  height?: number;
};

export const LineSeries = ({ data, lines, height = 300 }: LineSeriesProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-color)', fontSize: 12 }}
          stroke="var(--muted)"
        />
        <YAxis
          tick={{ fill: 'var(--text-color)', fontSize: 12 }}
          stroke="var(--muted)"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-color)',
          }}
        />
        <Legend
          wrapperStyle={{
            color: 'var(--text-color)',
          }}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color || 'var(--foreground)'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};


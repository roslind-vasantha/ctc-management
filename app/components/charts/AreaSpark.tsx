'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

type AreaSparkProps = {
  data: Array<{ value: number }>;
  showTrend?: boolean;
  height?: number;
};

export const AreaSpark = ({ data, showTrend = true, height = 60 }: AreaSparkProps) => {
  const trend = data.length > 1 ? data[data.length - 1].value - data[0].value : 0;
  const trendPercent = data[0]?.value ? ((trend / data[0].value) * 100).toFixed(1) : '0';
  const isPositive = trend >= 0;
  
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--foreground)"
            strokeWidth={2}
            fill="url(#sparkGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {showTrend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-[var(--success-text)]' : 'text-[var(--danger-text)]'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(Number(trendPercent))}%</span>
        </div>
      )}
    </div>
  );
};


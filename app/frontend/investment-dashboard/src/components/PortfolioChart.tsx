// src/components/PortfolioChart.tsx
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Label
} from 'recharts';
import { parseISO, format } from 'date-fns';

type ChartPoint = { date: string; value: number };

type PortfolioChartProps = {
  history: ChartPoint[];
  periodDays?: number;
};

export default function PortfolioChart({
  history,
  periodDays = 90,
}: PortfolioChartProps) {
  const maxPt = history.reduce((m, pt) => (pt.value > m.value ? pt : m), history[0]);

  const formatTick = (dateStr: string) => {
    const dt = parseISO(dateStr);
    return periodDays <= 30 ? format(dt, 'MMM d') : format(dt, 'MMM yyyy');
  };

  const formatLabel = (dateStr: string) => {
    const dt = parseISO(dateStr);
    return periodDays <= 30
      ? format(dt, 'MMM d, yyyy')
      : format(dt, 'MMM yyyy');
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={history} margin={{ top: 40, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4caf50" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666', fontSize: 12 }}
        />

        <YAxis
          tickFormatter={(v) => `$${v}`}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666', fontSize: 12 }}
        />

        <CartesianGrid stroke="#eee" strokeDasharray="3 3" vertical={false} />

        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} labelFormatter={formatLabel} />

        <Area type="monotone" dataKey="value" stroke="#4caf50" strokeWidth={2} fill="url(#colorValue)" dot={false} />

        <ReferenceDot
          x={maxPt.date}
          y={maxPt.value}
          r={5}
          fill="#4caf50"
          stroke="#fff"
          strokeWidth={2}
          isFront
        >
          <Label
            content={(props: any) => {
              const x = Number(props.x);
              const y = Number(props.y);
              if (isNaN(x) || isNaN(y)) return null;

              const text = maxPt.value.toFixed(2);
              const padding = 6;
              const textWidth = text.length * 7;
              const boxWidth = textWidth + padding * 2;
              const boxHeight = 20;
              const extraLift = 16;

              return (
                <g>
                  <rect
                    x={x - boxWidth / 2}
                    y={y - boxHeight - 8 - extraLift}
                    width={boxWidth}
                    height={boxHeight}
                    fill="#fff"
                    rx={4}
                  />
                  <text
                    x={x}
                    y={y - boxHeight / 2 - 8 - extraLift}
                    textAnchor="middle"
                    fill="#4caf50"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {text}
                  </text>
                </g>
              );
            }}
          />
        </ReferenceDot>
      </AreaChart>
    </ResponsiveContainer>
  );
}
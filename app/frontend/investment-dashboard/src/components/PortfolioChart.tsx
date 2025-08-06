// src/components/PortfolioChart.tsx
import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceDot, Label
} from 'recharts';
import { parseISO, format, addDays } from 'date-fns';

type ChartPoint = { date: string; value: number };

type PortfolioChartProps = {
  history: ChartPoint[];
  periodDays?: number;
};

export default function PortfolioChart({ history, periodDays = 90 }: PortfolioChartProps) {
  if (!history.length) return null;

  const maxPt = history.reduce((m, pt) => (pt.value > m.value ? pt : m), history[0]);

  const ticks = useMemo(() => {
    if (periodDays !== 90) return undefined;
    const start = parseISO(history[0].date);
    const dates: string[] = [];
    for (let i = 0; i <= 90; i += 10) {
      const d = addDays(start, i);
      dates.push(format(d, 'yyyy-MM-dd'));
    }
    const last = history[history.length - 1].date;
    if (!dates.includes(last)) dates.push(last);
    return dates;
  }, [history, periodDays]);

  const formatTick = (date: string) => {
    const dt = parseISO(date);
    return format(dt, 'MMM d');
  };

  const formatLabel = (date: string) => format(parseISO(date), 'MMM d, yyyy');

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
          {...(ticks ? { ticks } : {})}
          tickFormatter={formatTick}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666', fontSize: 12 }}
        />

        <YAxis
          tickFormatter={v => `$${v}`}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#666', fontSize: 12 }}
        />

        <CartesianGrid stroke="#eee" strokeDasharray="3 3" vertical={false} />
        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} labelFormatter={formatLabel} />
        <Area type="monotone" dataKey="value" stroke="#4caf50" strokeWidth={2} fill="url(#colorValue)" dot={false} />

        <ReferenceDot x={maxPt.date} y={maxPt.value} r={5} fill="#4caf50" stroke="#fff" strokeWidth={2} isFront>
          <Label content={(props: any) => {
            const x = Number(props.x), y = Number(props.y);
            if (isNaN(x)||isNaN(y)) return null;
            const text = maxPt.value.toFixed(2);
            const padding=6, textWidth=text.length*7;
            return (
              <g>
                <rect
                  x={x-textWidth/2-padding} y={y-28}
                  width={textWidth+padding*2} height={20}
                  fill="#fff" rx={4}
                />
                <text x={x} y={y-18} textAnchor="middle" fill="#4caf50" fontSize={12}>{text}</text>
              </g>
            );
          }} />
        </ReferenceDot>
      </AreaChart>
    </ResponsiveContainer>
  );
}
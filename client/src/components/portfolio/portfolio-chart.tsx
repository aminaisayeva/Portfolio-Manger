import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";

type TimePeriod = '7D' | '30D' | '90D' | 'ALL';

export function PortfolioChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30D');

  // Fetch portfolio data from   MySQL Flask backend
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    refetchInterval: 30000
  });

  // Transform   MySQL backend history data to chart format
  const rawHistory = (portfolioData as any)?.history || [];
  
  // Filter data based on selected period
  const filterDataByPeriod = (data: any[], period: TimePeriod) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (period) {
      case '7D':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30D':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90D':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'ALL':
        return data;
    }
    
    return data.filter((item: any) => new Date(item.date) >= cutoffDate);
  };

  const filteredData = filterDataByPeriod(rawHistory, selectedPeriod);
  
  const chartData = filteredData.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.value
  }));

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 card-glow-blue border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-80 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 card-glow-blue border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Portfolio Performance</h2>
        <div className="flex items-center space-x-2">
          {(['7D', '30D', '90D', 'ALL'] as TimePeriod[]).map((period) => (
            <Button 
              key={period}
              size="sm" 
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period 
                ? "gradient-purple text-white" 
                : "text-muted-foreground hover:text-foreground"
              }
              variant={selectedPeriod === period ? "default" : "ghost"}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              labelStyle={{
                color: '#e2e8f0',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="url(#gradient)" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#8b5cf6' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

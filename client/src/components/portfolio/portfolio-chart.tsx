import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

type TimePeriod = '7D' | '30D' | '90D' | 'ALL';

export function PortfolioChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('ALL');

  // Fetch portfolio data from MySQL Flask backend
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    refetchInterval: 30000
  });

  // Transform MySQL backend history data to chart format
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

  // Calculate dynamic y-axis formatting based on data range
  const yAxisFormatter = useMemo(() => {
    if (chartData.length === 0) return (value: number) => `$${value.toLocaleString()}`;
    
    const values = chartData.map(item => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    
    if (range >= 100000) {
      return (value: number) => `$${(value / 1000).toFixed(0)}k`;
    } else if (range >= 10000) {
      return (value: number) => `$${(value / 1000).toFixed(1)}k`;
    } else {
      return (value: number) => `$${value.toLocaleString()}`;
    }
  }, [chartData]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (chartData.length < 2) return { change: 0, changePercent: 0, isPositive: true };
    
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;
    
    return {
      change,
      changePercent,
      isPositive: change >= 0
    };
  }, [chartData]);

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
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Portfolio Performance</h2>
          {chartData.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {performanceMetrics.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${performanceMetrics.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {performanceMetrics.isPositive ? '+' : ''}{performanceMetrics.changePercent.toFixed(2)}%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {performanceMetrics.isPositive ? '+' : ''}${performanceMetrics.change.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {(['7D', '30D', '90D', 'ALL'] as TimePeriod[]).map((period) => (
            <Button 
              key={period}
              size="sm" 
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period 
                ? "gradient-purple text-white shadow-lg" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={yAxisFormatter}
              width={60}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #374151',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                padding: '12px 16px'
              }}
              labelStyle={{
                color: '#e2e8f0',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '8px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              cursor={{
                stroke: '#8b5cf6',
                strokeWidth: 2,
                strokeDasharray: '5 5'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="url(#gradient)" 
              strokeWidth={3}
              dot={{ 
                fill: '#8b5cf6', 
                strokeWidth: 2, 
                r: 3,
                stroke: '#ffffff'
              }}
              activeDot={{ 
                r: 5, 
                fill: '#8b5cf6',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
              connectNulls={true}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#6366f1" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
      {chartData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No portfolio data available for the selected period.</p>
        </div>
      )}
    </div>
  );
}

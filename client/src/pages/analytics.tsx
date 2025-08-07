import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, PieChart as PieChartIcon, BarChart3, Activity, AlertTriangle, Star, Calendar, DollarSign } from "lucide-react";

// Mock analytics data
const sectorAllocation = [
  { name: 'Technology', value: 45, amount: 112125, color: '#8b5cf6' },
  { name: 'Healthcare', value: 20, amount: 49771, color: '#06b6d4' },
  { name: 'Finance', value: 15, amount: 37328, color: '#10b981' },
  { name: 'Consumer', value: 12, amount: 29862, color: '#f59e0b' },
  { name: 'Energy', value: 8, amount: 19906, color: '#ef4444' }
];

const performanceMetrics = [
  { metric: 'Total Return', value: '+12.3%', change: '+2.1%', status: 'positive' },
  { metric: 'Annualized Return', value: '+18.7%', change: '+1.8%', status: 'positive' },
  { metric: 'Sharpe Ratio', value: '1.24', change: '+0.08', status: 'positive' },
  { metric: 'Max Drawdown', value: '-8.2%', change: '-1.1%', status: 'negative' },
  { metric: 'Volatility', value: '15.4%', change: '-0.5%', status: 'positive' },
  { metric: 'Alpha', value: '2.8%', change: '+0.3%', status: 'positive' }
];

const monthlyReturns = [
  { month: 'Jul', returns: 2.3, benchmark: 1.8 },
  { month: 'Aug', returns: 1.7, benchmark: 2.1 },
  { month: 'Sep', returns: 3.2, benchmark: 2.4 },
  { month: 'Oct', returns: -1.1, benchmark: -0.8 },
  { month: 'Nov', returns: 4.1, benchmark: 3.2 },
  { month: 'Dec', returns: 2.8, benchmark: 2.5 }
];

const riskMetrics = [
  { category: 'Portfolio Risk', score: 6.2, maxScore: 10, color: '#f59e0b' },
  { category: 'Sector Concentration', score: 7.1, maxScore: 10, color: '#ef4444' },
  { category: 'Geographic Diversification', score: 4.8, maxScore: 10, color: '#10b981' },
  { category: 'Market Cap Distribution', score: 8.3, maxScore: 10, color: '#06b6d4' }
];



const correlationData = [
  { asset: 'Portfolio', portfolio: 1.0, sp500: 0.82, nasdaq: 0.89, bonds: -0.15 },
  { asset: 'S&P 500', portfolio: 0.82, sp500: 1.0, nasdaq: 0.94, bonds: -0.22 },
  { asset: 'NASDAQ', portfolio: 0.89, sp500: 0.94, nasdaq: 1.0, bonds: -0.18 },
  { asset: 'Bonds', portfolio: -0.15, sp500: -0.22, nasdaq: -0.18, bonds: 1.0 }
];

export function Analytics() {
  const [timeframe, setTimeframe] = useState("6M");
  
  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    refetchInterval: 30000
  });

  // Calculate top performers and underperformers from MySQL portfolio data
  const portfolioSummary = {
    totalValue: (portfolioData as any)?.totalValue || 0,
    totalGain: (portfolioData as any)?.profitLoss || 0,
    totalGainPercent: (portfolioData as any)?.monthlyGrowth || 0,
  };
  const holdings = (portfolioData as any)?.assets || [];
  const chartData = (portfolioData as any)?.history || [];
  
  const sortedByPerformance = holdings
    .filter((holding: any) => holding.change !== undefined && holding.change !== null)
    .sort((a: any, b: any) => (b.change || 0) - (a.change || 0));
  
  const topPerformers = sortedByPerformance
    .filter((holding: any) => (holding.change || 0) > 0)
    .slice(0, 3)
    .map((holding: any) => ({
      symbol: holding.symbol,
      name: holding.company_name || holding.name,
      return: `+${holding.change ? holding.change.toFixed(1) : '0.0'}%`,
      amount: `+$${((holding.price || 0) * (holding.volume || 0) * (holding.change || 0) / 100).toFixed(0)}`
    }));
  
  const underPerformers = sortedByPerformance
    .filter((holding: any) => (holding.change || 0) < 0)
    .slice(-3)
    .reverse()
    .map((holding: any) => ({
      symbol: holding.symbol,
      name: holding.company_name || holding.name,
      return: `${holding.change ? holding.change.toFixed(1) : '0.0'}%`,
      amount: `-$${Math.abs((holding.price || 0) * (holding.volume || 0) * (holding.change || 0) / 100).toFixed(0)}`
    }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Portfolio Analytics</h1>
              <p className="text-xl text-muted-foreground mt-2">Deep insights into your investment performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="6M">6 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                  <SelectItem value="ALL">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="bg-card border-border hover:border-blue-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{metric.metric}</h3>
                    {metric.status === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                  <div className={`text-sm flex items-center ${
                    metric.status === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change} vs last period
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sector Allocation */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5" />
                  <span>Sector Allocation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {sectorAllocation.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={entry.color}
                            strokeWidth={0}
                            style={{ 
                              filter: 'brightness(1)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.filter = 'brightness(1.1)';
                              e.target.style.strokeWidth = '2';
                              e.target.style.stroke = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.filter = 'brightness(1)';
                              e.target.style.strokeWidth = '0';
                              e.target.style.stroke = entry.color;
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `$${props.payload.amount.toLocaleString()}`,
                          props.payload.name
                        ]}
                        contentStyle={{
                          backgroundColor: '#475569',
                          border: '1px solid #64748b',
                          borderRadius: '8px',
                          color: '#ffffff',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        labelStyle={{
                          color: '#ffffff',
                          fontSize: '12px'
                        }}
                        itemStyle={{
                          color: '#ffffff'
                        }}
                        cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {sectorAllocation.map((sector, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: sector.color }}
                      ></div>
                      <span className="text-sm text-muted-foreground">{sector.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Returns vs Benchmark */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Returns vs S&P 500</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyReturns}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, value > 0 ? 'Return' : 'Loss']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="returns" fill="#8b5cf6" name="Portfolio" />
                      <Bar dataKey="benchmark" fill="#06b6d4" name="S&P 500" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Risk Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {riskMetrics.map((risk, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{risk.category}</span>
                      <span className="text-sm text-muted-foreground">{risk.score}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(risk.score / risk.maxScore) * 100}%`,
                          backgroundColor: risk.color
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {risk.score >= 7 ? 'High Risk' : risk.score >= 4 ? 'Medium Risk' : 'Low Risk'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top & Bottom Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-green-400" />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.length > 0 ? topPerformers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <div>
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">{stock.return}</div>
                        <div className="text-sm text-green-400">{stock.amount}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No profitable holdings yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span>Underperformers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {underPerformers.length > 0 ? underPerformers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <div>
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-semibold">{stock.return}</div>
                        <div className="text-sm text-red-400">{stock.amount}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">All holdings performing well!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Correlation Matrix */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Asset Correlation Matrix</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">Asset</th>
                      <th className="text-center p-2 text-sm font-medium text-muted-foreground">Portfolio</th>
                      <th className="text-center p-2 text-sm font-medium text-muted-foreground">S&P 500</th>
                      <th className="text-center p-2 text-sm font-medium text-muted-foreground">NASDAQ</th>
                      <th className="text-center p-2 text-sm font-medium text-muted-foreground">Bonds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {correlationData.map((row, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="p-2 font-medium text-foreground">{row.asset}</td>
                        <td className="p-2 text-center">
                          <span className={`inline-flex items-center justify-center w-12 h-6 rounded text-xs font-medium ${
                            Math.abs(row.portfolio) > 0.7 ? 'bg-red-500/20 text-red-400' :
                            Math.abs(row.portfolio) > 0.3 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {row.portfolio.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-flex items-center justify-center w-12 h-6 rounded text-xs font-medium ${
                            Math.abs(row.sp500) > 0.7 ? 'bg-red-500/20 text-red-400' :
                            Math.abs(row.sp500) > 0.3 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {row.sp500.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-flex items-center justify-center w-12 h-6 rounded text-xs font-medium ${
                            Math.abs(row.nasdaq) > 0.7 ? 'bg-red-500/20 text-red-400' :
                            Math.abs(row.nasdaq) > 0.3 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {row.nasdaq.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-flex items-center justify-center w-12 h-6 rounded text-xs font-medium ${
                            Math.abs(row.bonds) > 0.7 ? 'bg-red-500/20 text-red-400' :
                            Math.abs(row.bonds) > 0.3 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {row.bonds.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                High correlation (|r| &gt; 0.7) indicates assets move together. Low correlation provides better diversification.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <FloatingAIChat />
    </div>
  );
}
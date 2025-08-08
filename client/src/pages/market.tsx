import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { MarketClock } from "@/components/ui/market-clock";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Search, Globe, DollarSign, Activity, Calendar, Clock, AlertCircle, Eye, BarChart3 } from "lucide-react";



// Most active stocks
const mostActiveStocks = [
  { symbol: 'TSLA', name: 'Tesla Inc', price: 245.67, change: 8.34, changePercent: 3.52, volume: '89.2M' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 182.45, change: -2.11, changePercent: -1.14, volume: '67.8M' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 456.78, change: 15.67, changePercent: 3.56, volume: '78.9M' },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 378.92, change: 4.23, changePercent: 1.13, volume: '45.6M' },
  { symbol: 'AMZN', name: 'Amazon Inc', price: 142.56, change: -1.87, changePercent: -1.29, volume: '52.3M' }
];

// Top gainers
const topGainers = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 456.78, changePercent: 8.45 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 156.32, changePercent: 6.78 },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 245.67, changePercent: 5.23 },
  { symbol: 'SHOP', name: 'Shopify Inc', price: 89.45, changePercent: 4.91 },
  { symbol: 'CRM', name: 'Salesforce Inc', price: 234.12, changePercent: 4.56 }
];

// Top losers
const topLosers = [
  { symbol: 'META', name: 'Meta Platforms', price: 324.56, changePercent: -4.23 },
  { symbol: 'NFLX', name: 'Netflix Inc', price: 445.78, changePercent: -3.89 },
  { symbol: 'PYPL', name: 'PayPal Holdings', price: 67.89, changePercent: -3.45 },
  { symbol: 'UBER', name: 'Uber Technologies', price: 54.32, changePercent: -2.98 },
  { symbol: 'SNAP', name: 'Snap Inc', price: 12.45, changePercent: -2.76 }
];

// Market news (mock data)
const marketNews = [
  {
    id: 1,
    title: "Fed Signals Potential Rate Cut as Inflation Cools",
    source: "MarketWatch",
    time: "2 hours ago",
    impact: "high"
  },
  {
    id: 2,
    title: "Tech Earnings Season Kicks Off with Strong Results",
    source: "CNBC",
    time: "4 hours ago",
    impact: "medium"
  },
  {
    id: 3,
    title: "Oil Prices Surge on Middle East Tensions",
    source: "Bloomberg",
    time: "6 hours ago",
    impact: "high"
  },
  {
    id: 4,
    title: "Consumer Confidence Index Beats Expectations",
    source: "Reuters",
    time: "1 day ago",
    impact: "medium"
  }
];

// Economic indicators - now fetched from API

// Chart data for market overview
const marketChartData = [
  { time: '9:30', spy: 456.2, qqq: 378.5 },
  { time: '10:00', spy: 457.1, qqq: 379.2 },
  { time: '10:30', spy: 456.8, qqq: 378.9 },
  { time: '11:00', spy: 458.3, qqq: 380.1 },
  { time: '11:30', spy: 457.9, qqq: 379.7 },
  { time: '12:00', spy: 459.1, qqq: 381.2 },
  { time: '12:30', spy: 458.7, qqq: 380.8 },
  { time: '1:00', spy: 460.2, qqq: 382.4 },
  { time: '1:30', spy: 459.8, qqq: 382.1 },
  { time: '2:00', spy: 461.3, qqq: 383.6 },
];

export function Market() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['/api/market'],
    refetchInterval: 30000
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/market-performance'],
    refetchInterval: 60000 // Refresh every minute for intraday data
  });

  const { data: economicData, isLoading: economicLoading } = useQuery({
    queryKey: ['/api/economic-indicators'],
    refetchInterval: 300000 // Refresh every 5 minutes for economic data
  });

  const { data: sectorData, isLoading: sectorLoading } = useQuery({
    queryKey: ['/api/sector-performance'],
    refetchInterval: 120000 // Refresh every 2 minutes for sector data
  });

  // Get market indices from API data
  const marketIndices = (marketData as any)?.marketIndices || [];

  // Get economic indicators from API data
  const economicIndicators = economicData ? Object.entries(economicData).map(([name, data]: [string, any]) => ({
    name,
    value: data.value,
    change: data.change,
    trend: data.trend
  })) : [];

  // Process performance data for chart
  const getChartData = () => {
    if (!performanceData) return [];
    
    const indices = ["S&P 500", "NASDAQ", "Dow Jones", "Russell 2000"];
    const chartData: any[] = [];
    
    // Find the index with the most data points to use as our time reference
    let referenceIndex = null;
    let maxDataPoints = 0;
    
    indices.forEach(indexName => {
      const indexData = (performanceData as any)[indexName];
      if (indexData?.data && indexData.data.length > maxDataPoints) {
        maxDataPoints = indexData.data.length;
        referenceIndex = indexName;
      }
    });
    
    if (!referenceIndex) return [];
    
    // Use the reference index's time points
    const referenceData = (performanceData as any)[referenceIndex];
    const timePoints = referenceData.data.map((point: any) => point.time).sort();
    
    // Create chart data points with percentage changes
    timePoints.forEach((time: string) => {
      const dataPoint: any = { 
        time,
        baseline: 0 // Add baseline at 0% for opening level
      };
      
      indices.forEach(indexName => {
        const indexData = (performanceData as any)[indexName];
        if (indexData?.data && indexData.open_value > 0) {
          const point = indexData.data.find((p: any) => p.time === time);
          if (point) {
            // Calculate percentage change from opening price
            const percentageChange = ((point.value - indexData.open_value) / indexData.open_value) * 100;
            dataPoint[indexName] = percentageChange;
          }
        }
      });
      
      chartData.push(dataPoint);
    });
    
    return chartData;
  };

  const filteredStocks = mostActiveStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading market data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const colors = {
    "S&P 500": "#8b5cf6",
    "NASDAQ": "#06b6d4", 
    "Dow Jones": "#10b981",
    "Russell 2000": "#f59e0b"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Market Overview</h1>
              <p className="text-xl text-muted-foreground mt-2">Real-time market data and insights</p>
            </div>
          </div>

          {/* Market Clock */}
          <MarketClock />

          {/* Market Indices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketIndices.map((index: any, i: number) => (
              <Card key={i} className="bg-card border-border hover:border-blue-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{index.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {index.symbol}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {index.value.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center text-sm ${
                      index.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {index.change >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {index.change >= 0 ? '+' : ''}{index.change} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent}%)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vol: {index.volume ? (index.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Performance Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Market Performance Today (% Change)</span>
                {performanceLoading && (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis 
                        dataKey="time"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value.toFixed(2)}%`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any, name: string) => [
                          `${value.toFixed(2)}%`,
                          name
                        ]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      {/* Baseline at 0% */}
                      <Line
                        type="monotone"
                        dataKey="baseline"
                        stroke="rgba(148, 163, 184, 0.3)"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                        name="Opening Level"
                      />
                      <Legend />
                      {Object.keys(colors).map((indexName) => (
                        <Line
                          key={indexName}
                          type="monotone"
                          dataKey={indexName}
                          stroke={colors[indexName as keyof typeof colors]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, strokeWidth: 0 }}
                          connectNulls={true}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading performance data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Economic Indicators */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Economic Indicators</span>
                {economicLoading && (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {economicIndicators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {economicIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background">
                      <div>
                        <div className="font-medium text-foreground">{indicator.name}</div>
                        <div className="text-2xl font-bold text-foreground">{indicator.value}</div>
                      </div>
                      <div className={`flex items-center text-sm ${
                        indicator.trend === 'up' ? 'text-green-400' :
                        indicator.trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
                      }`}>
                        {indicator.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : indicator.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        ) : (
                          <div className="w-4 h-4 mr-1"></div>
                        )}
                        {indicator.change !== 0 && (
                          <span>{indicator.change > 0 ? '+' : ''}{indicator.change}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading economic indicators...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sector Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Sector Performance</span>
                {sectorLoading && (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(sectorData as any[]) && (sectorData as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(sectorData as any[]).map((sector: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{sector.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Volume: {sector.volume} • {sector.top} ({sector.topChange > 0 ? '+' : ''}{sector.topChange}%)
                        </div>
                      </div>
                      <div className={`text-right ${sector.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <div className="flex items-center">
                          {sector.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          <span className="font-semibold">{sector.change > 0 ? '+' : ''}{sector.change}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {sector.symbol || 'ETF'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sectorLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading sector performance data...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Unable to load sector performance data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market Movers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Most Active */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Most Active</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostActiveStocks.slice(0, 5).map((stock, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">Vol: {stock.volume}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">${stock.price}</div>
                        <div className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.change > 0 ? '+' : ''}{stock.changePercent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Gainers */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Top Gainers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topGainers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">${stock.price}</div>
                        <div className="text-sm text-green-400">+{stock.changePercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span>Top Losers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLosers.map((stock, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">${stock.price}</div>
                        <div className="text-sm text-red-400">{stock.changePercent}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market News */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Market News</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketNews.map((news) => (
                  <div key={news.id} className="flex items-start space-x-4 p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      news.impact === 'high' ? 'bg-red-400' : 
                      news.impact === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{news.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            news.impact === 'high' ? 'border-red-400 text-red-400' :
                            news.impact === 'medium' ? 'border-yellow-400 text-yellow-400' :
                            'border-green-400 text-green-400'
                          }`}
                        >
                          {news.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FloatingAIChat />
    </div>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Search, Globe, DollarSign, Activity, Calendar, Clock, AlertCircle, Eye, BarChart3 } from "lucide-react";

// Market indices data
const marketIndices = [
  {
    name: 'S&P 500',
    symbol: 'SPX',
    value: 4567.89,
    change: 23.45,
    changePercent: 0.52,
    volume: '3.2B'
  },
  {
    name: 'NASDAQ',
    symbol: 'IXIC',
    value: 14234.56,
    change: -45.67,
    changePercent: -0.32,
    volume: '4.1B'
  },
  {
    name: 'Dow Jones',
    symbol: 'DJI',
    value: 34567.12,
    change: 156.78,
    changePercent: 0.45,
    volume: '2.8B'
  },
  {
    name: 'Russell 2000',
    symbol: 'RUT',
    value: 1987.45,
    change: -12.34,
    changePercent: -0.62,
    volume: '1.5B'
  }
];

// Market sectors performance
const sectorPerformance = [
  { name: 'Technology', change: 2.1, volume: '12.5B', top: 'NVDA', topChange: 3.4 },
  { name: 'Healthcare', change: 1.3, volume: '8.2B', top: 'JNJ', topChange: 2.1 },
  { name: 'Finance', change: -0.8, volume: '15.3B', top: 'JPM', topChange: -0.5 },
  { name: 'Energy', change: 3.2, volume: '9.7B', top: 'XOM', topChange: 4.1 },
  { name: 'Consumer Discretionary', change: 0.5, volume: '11.1B', top: 'AMZN', topChange: 1.2 },
  { name: 'Consumer Staples', change: -0.2, volume: '6.8B', top: 'PG', topChange: 0.1 },
  { name: 'Industrials', change: 1.7, volume: '7.9B', top: 'BA', topChange: 2.8 },
  { name: 'Materials', change: 2.4, volume: '5.5B', top: 'FCX', topChange: 3.6 }
];

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

// Economic indicators
const economicIndicators = [
  { name: 'Fed Funds Rate', value: '5.25%', change: 0, trend: 'neutral' },
  { name: '10-Year Treasury', value: '4.32%', change: -0.05, trend: 'down' },
  { name: 'VIX (Volatility)', value: '18.45', change: 1.23, trend: 'up' },
  { name: 'USD Index', value: '103.45', change: 0.34, trend: 'up' },
  { name: 'Gold', value: '$2,034', change: -12.45, trend: 'down' },
  { name: 'Oil (WTI)', value: '$82.34', change: 2.67, trend: 'up' }
];

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
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Market Open
              </Badge>
            </div>
          </div>

          {/* Market Indices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketIndices.map((index, i) => (
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
                      Vol: {index.volume}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Market Performance Today</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketChartData}>
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
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="spy" 
                      stroke="#8b5cf6" 
                      fill="rgba(139, 92, 246, 0.1)"
                      name="SPY ETF"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="qqq" 
                      stroke="#06b6d4" 
                      fill="rgba(6, 182, 212, 0.1)"
                      name="QQQ ETF"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Economic Indicators */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Economic Indicators</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Sector Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Sector Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorPerformance.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{sector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Volume: {sector.volume} • Top: {sector.top} ({sector.topChange > 0 ? '+' : ''}{sector.topChange}%)
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
                    </div>
                  </div>
                ))}
              </div>
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
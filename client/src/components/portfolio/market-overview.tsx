import { useQuery } from "@tanstack/react-query";
import { MarketIndex, StockData } from "@shared/schema";

export function MarketOverview() {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['/api/market'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-navy-800 rounded-xl p-6 card-glow-orange">
        <div className="animate-pulse">
          <div className="h-6 bg-navy-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-navy-700 rounded"></div>
            <div className="h-4 bg-navy-700 rounded"></div>
            <div className="h-4 bg-navy-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { trendingStocks = [], marketIndices = [] } = marketData || {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGradientClass = (symbol: string) => {
    const gradients = ['gradient-blue', 'gradient-green', 'gradient-purple', 'gradient-orange'];
    const index = symbol.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="bg-card rounded-xl p-6 card-glow-orange border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Market Overview</h2>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-green-400">Live</span>
        </div>
      </div>

      {/* Market Indices */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {marketIndices.map((index: MarketIndex) => (
          <div key={index.name} className="text-center">
            <div className="text-sm text-muted-foreground mb-1">{index.name}</div>
            <div className="font-semibold text-foreground">{index.value.toLocaleString()}</div>
            <div className={`text-sm ${index.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Trending Stocks */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Trending Stocks</h3>
        <div className="space-y-3">
          {trendingStocks.slice(0, 3).map((stock: StockData) => (
            <div key={stock.symbol} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getGradientClass(stock.symbol)} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-xs">{stock.symbol}</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{stock.companyName}</div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(stock.price)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
                <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

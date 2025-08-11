import { Card, CardContent } from "@/components/ui/card";


export function PortfolioAnalytics() {
  // Mock analytics data
  const analytics = {
    sharpeRatio: 1.47,
    beta: 1.23,
    ytdReturn: 23.64,
    maxDrawdown: -8.73
  };

  const allocations = [
    { name: 'Technology', percentage: 65, color: 'gradient-blue' },
    { name: 'Growth', percentage: 20, color: 'gradient-green' },
    { name: 'Cash', percentage: 15, color: 'gradient-orange' }
  ];

  return (
    <div className="bg-card rounded-xl p-6 card-glow-blue border border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">Portfolio Analytics</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Sharpe Ratio</span>
          <span className="text-foreground font-semibold">{analytics.sharpeRatio}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Beta</span>
          <span className="text-foreground font-semibold">{analytics.beta}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">YTD Return</span>
          <span className="font-semibold text-green-400">
            +{analytics.ytdReturn.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Max Drawdown</span>
          <span className="font-semibold text-red-400">
            {analytics.maxDrawdown.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Asset Allocation */}
      <div>
        <h4 className="text-foreground font-semibold mb-3">Asset Allocation</h4>
        <div className="space-y-3">
          {allocations.map((allocation) => (
            <div key={allocation.name} className="flex items-center justify-between">
              <span className="text-muted-foreground">{allocation.name}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${allocation.color}`}
                    style={{ width: `${allocation.percentage}%` }}
                  ></div>
                </div>
                <span className="text-foreground text-sm">{allocation.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

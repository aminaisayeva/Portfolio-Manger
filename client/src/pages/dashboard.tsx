import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PortfolioChart } from "@/components/portfolio/portfolio-chart";
import { BuySellModal } from "@/components/portfolio/buy-sell-modal";
import { AddFundsModal } from "@/components/portfolio/add-funds-modal";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity,
  BarChart3,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from "lucide-react";
import { Link } from "wouter";


export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState<{symbol: string, price: number, companyName: string} | null>(null);
  const [modalType, setModalType] = useState<"buy" | "sell" | null>(null);
  const [showAddFunds, setShowAddFunds] = useState(false);

  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    refetchInterval: 30000,
    staleTime: 0, // Consider data stale immediately for instant updates
    refetchOnWindowFocus: true // Refetch when window gains focus
  });

  const { data: marketData } = useQuery({
    queryKey: ['/api/market'],
    refetchInterval: 30000
  });

  const openBuyModal = (stock: {symbol: string, price: number, companyName: string}) => {
    setSelectedStock(stock);
    setModalType("buy");
  };

  const openSellModal = (stock: {symbol: string, price: number, companyName: string}) => {
    setSelectedStock(stock);
    setModalType("sell");
  };

  const closeModal = () => {
    setSelectedStock(null);
    setModalType(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Adapt to your MySQL Flask backend structure
  const portfolioSummary = {
    totalValue: (portfolioData as any)?.totalValue || 0,
    totalGain: (portfolioData as any)?.profitLoss || 0,
    totalGainPercent: (portfolioData as any)?.totalReturnPercent || 0,
    dayGain: (portfolioData as any)?.summary?.dayGain || 0,
    dayGainPercent: (portfolioData as any)?.summary?.dayGainPercent || 0,
    cashBalance: (portfolioData as any)?.cashBalance || 0,
    realizedGains: (portfolioData as any)?.realizedGains || 0,
    unrealizedGains: (portfolioData as any)?.unrealizedGains || 0
  };
  const holdings = (portfolioData as any)?.positions || (portfolioData as any)?.assets || [];
  const bestToken = (portfolioData as any)?.bestToken;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-xl text-muted-foreground mt-2">Your investment overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowAddFunds(true)}
                className="gradient-green text-white"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </div>
          </div>

          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card className="bg-card rounded-xl card-glow-blue border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${(portfolioSummary.totalValue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Holdings + Cash</p>
                  </div>
                </div>
              </CardContent>
            </Card>



            <Card className="bg-card rounded-xl card-glow-purple border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${(portfolioSummary.totalGainPercent || 0) >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {(portfolioSummary.totalGainPercent || 0) >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p className={`text-2xl font-bold ${(portfolioSummary.totalGainPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(portfolioSummary.totalGainPercent || 0).toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Since Inception</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card rounded-xl card-glow-orange border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Target className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cash Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${(portfolioSummary.cashBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Realized Gains Card */}
            <Card className="bg-card rounded-xl card-glow-emerald border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${(portfolioSummary.realizedGains || 0) >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {(portfolioSummary.realizedGains || 0) >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">Realized Gains</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 hover:bg-muted/50 relative z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Realized Gains tooltip clicked');
                            }}
                          >
                            <Info className="h-3 w-3 text-blue-400 hover:text-blue-300" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} className="max-w-xs bg-background border-2 border-emerald-200 shadow-lg" style={{ transform: 'translateX(-20px)' }}>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">Realized Gains</h4>
                            <p className="text-sm text-muted-foreground">Profits (or losses) from completed trades where you've actually sold your investments. These are the gains you've locked in and can spend.</p>
                            <p className="text-sm font-medium text-emerald-600">Good: Positive realized gains mean your trading strategy is working. Bad: Negative realized gains mean you're selling at a loss.</p>
                            <p className="text-sm text-muted-foreground">💡 For first-time investors: Realized gains are your actual profits from completed trades. Unlike unrealized gains, these are real money you can use. Focus on building a track record of positive realized gains over time.</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={`text-2xl font-bold ${(portfolioSummary.realizedGains || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${(portfolioSummary.realizedGains || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unrealized Gains Card */}
            <Card className="bg-card rounded-xl card-glow-cyan border border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${(portfolioSummary.unrealizedGains || 0) >= 0 ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
                    {(portfolioSummary.unrealizedGains || 0) >= 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                      )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">Unrealized Gains</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-4 w-4 p-0 hover:bg-muted/50 relative z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Unrealized Gains tooltip clicked');
                            }}
                          >
                            <Info className="h-3 w-3 text-blue-400 hover:text-blue-300" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5} className="max-w-xs bg-background border-2 border-blue-200 shadow-lg" style={{ transform: 'translateX(-20px)' }}>
                          <div className="space-y-2">
                            <h4 className="font-semibold text-foreground">Unrealized Gains</h4>
                            <p className="text-sm text-muted-foreground">Potential profits (or losses) from investments you still own. These gains aren't real until you sell - they can go up or down with market changes.</p>
                            <p className="text-sm font-medium text-blue-600">Good: Growing unrealized gains show your investments are performing. Bad: Large unrealized losses may need attention.</p>
                            <p className="text-sm text-muted-foreground">💡 For first-time investors: Unrealized gains are 'paper profits' - they look good but aren't guaranteed. Don't get too excited about gains until you sell. Focus on long-term trends rather than daily fluctuations.</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className={`text-2xl font-bold ${(portfolioSummary.unrealizedGains || 0) >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                      ${(portfolioSummary.unrealizedGains || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <PortfolioChart />

          {/* Holdings */}
          <Card className="bg-card rounded-xl card-glow-blue border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground">Your Holdings</CardTitle>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                  <Globe className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.slice(0, 3).map((holding: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm
                        ${holding.symbol === 'AAPL' ? 'bg-gray-600' : 
                          holding.symbol === 'TSLA' ? 'bg-red-600' :
                          holding.symbol === 'GOOGL' ? 'bg-blue-600' :
                          holding.symbol === 'AMZN' ? 'bg-orange-600' :
                          holding.symbol === 'MSFT' ? 'bg-blue-500' :
                          'bg-purple-600'}`}>
                        {holding.symbol}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{holding.company_name || holding.name}</h3>
                        <p className="text-sm text-muted-foreground">{holding.volume} shares</p>
                      </div>
                    </div>
                    <div className="text-right mr-6">
                      <p className="text-lg font-semibold text-foreground">${((holding.price || 0) * (holding.volume || 0)).toLocaleString()}</p>
                      <p className={`text-sm flex items-center ${(holding.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(holding.change || 0) >= 0 ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        {Math.abs(holding.change || 0).toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => openSellModal({
                          symbol: holding.symbol,
                          price: holding.price || 0,
                          companyName: holding.company_name || holding.name
                        })}
                      >
                        Sell
                      </Button>
                      <Button 
                        size="sm" 
                        className="gradient-green text-white"
                        onClick={() => openBuyModal({
                          symbol: holding.symbol,
                          price: holding.price || 0,
                          companyName: holding.company_name || holding.name
                        })}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                ))}
                {holdings.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No holdings yet. Start investing to see your portfolio here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>

      {/* Modals */}
      {selectedStock && modalType && (
        <BuySellModal
          isOpen={!!selectedStock}
          onClose={closeModal}
          selectedStock={selectedStock}
          modalType={modalType}
        />
      )}

      <AddFundsModal 
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
      />

      <FloatingAIChat />
        </div>
      </TooltipProvider>
  );
}
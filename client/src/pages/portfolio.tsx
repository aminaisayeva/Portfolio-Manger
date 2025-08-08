import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { BuySellModal } from "@/components/portfolio/buy-sell-modal";
import { TrendingUp, TrendingDown, Search, Filter, ArrowUpDown, DollarSign, Percent, Calendar, Target } from "lucide-react";

export function Portfolio() {
  const [selectedStock, setSelectedStock] = useState<{symbol: string, price: number, companyName: string} | null>(null);
  const [modalType, setModalType] = useState<"buy" | "sell" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalValue");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
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
              <p className="text-muted-foreground">Loading portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Adapt to MySQL Flask backend structure  
  const portfolioSummary = {
    totalValue: (portfolioData as any)?.totalValue || 0,
    totalGain: ((portfolioData as any)?.realizedGains || 0) + ((portfolioData as any)?.unrealizedGains || 0),
    totalGainPercent: (portfolioData as any)?.totalReturnPercent || 0,
    dayGain: 0,
    dayGainPercent: 0
  };
  const holdings = (portfolioData as any)?.assets || [];

  // Filter and sort holdings - adapted for Flask backend
  const filteredHoldings = holdings
    .filter((holding: any) =>
      holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (holding.company_name || holding.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      let aValue, bValue;
      
      // Map sort fields to Flask backend structure
      switch(sortBy) {
        case 'totalValue':
          aValue = (a.price || 0) * (a.volume || 0);
          bValue = (b.price || 0) * (b.volume || 0);
          break;
        case 'companyName':
          aValue = a.company_name || a.name || '';
          bValue = b.company_name || b.name || '';
          break;
        case 'shares':
          aValue = a.volume || 0;
          bValue = b.volume || 0;
          break;
        default:
          aValue = a[sortBy] || 0;
          bValue = b[sortBy] || 0;
      }
      
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Portfolio</h1>
              <p className="text-xl text-muted-foreground mt-2">Detailed view of all   holdings</p>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${portfolioSummary.totalValue ? portfolioSummary.totalValue.toLocaleString() : "0.00"}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                    <p className={`text-2xl font-bold ${(portfolioSummary.totalGain || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(portfolioSummary.totalGain || 0) >= 0 ? '+' : ''}${portfolioSummary.totalGain ? portfolioSummary.totalGain.toFixed(2) : "0.00"}
                    </p>
                  </div>
                  {(portfolioSummary.totalGain || 0) >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p className={`text-2xl font-bold ${(portfolioSummary.totalGainPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(portfolioSummary.totalGainPercent || 0) >= 0 ? '+' : ''}{portfolioSummary.totalGainPercent ? portfolioSummary.totalGainPercent.toFixed(2) : "0.00"}%
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Holdings Count</p>
                    <p className="text-2xl font-bold text-foreground">{holdings.length}</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search holdings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="totalValue">Sort by Value</SelectItem>
                    <SelectItem value="gainPercent">Sort by Return %</SelectItem>
                    <SelectItem value="gain">Sort by Gain/Loss</SelectItem>
                    <SelectItem value="shares">Sort by Shares</SelectItem>
                    <SelectItem value="symbol">Sort by Symbol</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="border-border text-foreground hover:bg-muted"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Holdings Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">All Holdings ({filteredHoldings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredHoldings.length > 0 ? (
                <div className="space-y-4">
                  {filteredHoldings.map((holding: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-6 rounded-lg bg-background border border-border hover:border-blue-500/30 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm
                          ${holding.symbol === 'AAPL' ? 'bg-gray-600' : 
                            holding.symbol === 'TSLA' ? 'bg-red-600' :
                            holding.symbol === 'GOOGL' ? 'bg-blue-600' :
                            holding.symbol === 'AMZN' ? 'bg-orange-600' :
                            holding.symbol === 'MSFT' ? 'bg-blue-500' :
                            'bg-purple-600'}`}>
                          {holding.symbol}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{holding.company_name || holding.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {holding.volume} shares at ${holding.price ? holding.price.toFixed(2) : "0.00"} each
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Avg Cost: ${holding.weighted_buy_price ? holding.weighted_buy_price.toFixed(2) : "0.00"} • 
                            Total Cost: ${holding.weighted_buy_price && holding.volume ? (holding.weighted_buy_price * holding.volume).toFixed(2) : "0.00"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Market Value</p>
                          <p className="text-xl font-bold text-foreground">
                            ${((holding.price || 0) * (holding.volume || 0)).toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Gain/Loss</p>
                          <p className={`text-xl font-bold ${(holding.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(holding.change || 0) >= 0 ? '+' : ''}{holding.change ? holding.change.toFixed(2) : "0.00"}%
                          </p>
                        </div>

                        <div>
                          <div className="flex space-x-2 justify-end">
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No holdings match   search." : "No holdings yet. Start investing to see   portfolio here."}
                  </p>
                </div>
              )}
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

      <FloatingAIChat />
    </div>
  );
}
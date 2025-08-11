import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { BuySellModal } from "@/components/portfolio/buy-sell-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Search, Filter, ArrowUpDown, DollarSign, Percent, Calendar, Target, Info } from "lucide-react";

export function Portfolio() {
  const [selectedStock, setSelectedStock] = useState<{symbol: string, price: number, companyName: string} | null>(null);
  const [modalType, setModalType] = useState<"buy" | "sell" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalValue");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const holdingsPerPage = 10;

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

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
        case 'change':
          aValue = a.change || 0;
          bValue = b.change || 0;
          break;
        case 'shares':
          aValue = a.volume || 0;
          bValue = b.volume || 0;
          break;
        case 'symbol':
          aValue = a.symbol || '';
          bValue = b.symbol || '';
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
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredHoldings.length / holdingsPerPage);
  const startIndex = (currentPage - 1) * holdingsPerPage;
  const endIndex = startIndex + holdingsPerPage;
  const currentHoldings = filteredHoldings.slice(startIndex, endIndex);

  return (
    <TooltipProvider>
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
                      ${Math.abs(portfolioSummary.totalGain || 0).toLocaleString()}
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
                      {(portfolioSummary.totalGainPercent || 0).toFixed(2)}%
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
                    <SelectItem value="change">Sort by Gain/Loss</SelectItem>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">
                  All Holdings ({filteredHoldings.length})
                  {totalPages > 1 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-muted/50 relative z-10"
                    >
                      <Info className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={5} className="max-w-md bg-background border-2 border-blue-200 shadow-lg">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground text-lg">Portfolio Holdings Guide</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-foreground">📊 Share Details</h5>
                          <p className="text-sm text-muted-foreground">The number of shares you own and the current market price per share. This shows your ownership stake in the company.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-foreground">💰 Cost Information</h5>
                          <p className="text-sm text-muted-foreground"><strong>Average Cost:</strong> The weighted average price you paid for all shares. <strong>Total Cost:</strong> The total amount you've invested in this position.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-foreground">📈 Market Value</h5>
                          <p className="text-sm text-muted-foreground">The current total value of your position based on the current market price and number of shares you own. Formula: Current Price × Number of Shares</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-foreground">📊 Gain/Loss</h5>
                          <p className="text-sm text-muted-foreground">The percentage change in value from your average cost to the current market price. <span className="text-green-400">Green</span> means you're making money, <span className="text-red-400">red</span> means you're losing money. This is unrealized until you sell.</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-foreground">🔄 Actions</h5>
                          <p className="text-sm text-muted-foreground"><strong>Buy:</strong> Purchase more shares. <strong>Sell:</strong> Sell your existing shares to realize gains or cut losses.</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">💡 <strong>Tip:</strong> Hover over any holding to see real-time updates. Use the search and sort features to organize your portfolio effectively.</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              {currentHoldings.length > 0 ? (
                <div className="space-y-4">
                  {currentHoldings.map((holding: any, index: number) => (
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
                            {(holding.change || 0).toFixed(2)}%
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
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredHoldings.length)} of {filteredHoldings.length} holdings
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchTerm ? "No holdings match your search." : "No holdings yet. Start investing to see your portfolio here."}
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
      </TooltipProvider>
  );
}
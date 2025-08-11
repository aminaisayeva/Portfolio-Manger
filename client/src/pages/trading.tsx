import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { TrendingUp, TrendingDown, Search, Filter, Calendar, DollarSign, BarChart3, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { BuySellModal } from "@/components/portfolio/buy-sell-modal";

interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}
interface Transaction {
  id: number;
  symbol: string;
  companyName: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  totalAmount: number;
  timestamp: string;
  date: string;
  sector?: string;
  industry?: string;
}

export function Trading() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [stockSearchResults, setStockSearchResults] = useState<any[]>([]);
  const [isSearchingStock, setIsSearchingStock] = useState(false);
  const [selectedStockForBuy, setSelectedStockForBuy] = useState<any>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [stockDataFinal, setStockDataFinal] = useState<StockData | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      return response.json();
    }
  });
  const closeModal = () => {
    setSelectedStock(null);
    setModalType(null);
  };

  const { data: portfolio } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio');
      return response.json();
    }
  });

 
  
  let stockDataFinalTrial = {}
  
  // Stock search function
  const searchStocks = async (symbol: string) => {
    if (!symbol.trim()) {
      setStockSearchResults([]);
      return;
    }

    setIsSearchingStock(true);
    try {
      const response = await fetch(`/api/stocks/${symbol.trim().toUpperCase()}`);
      if (response.ok) {
        const stockData = await response.json();
        console.log("Stock data:", stockData);
        setStockDataFinal(stockData);
        stockDataFinalTrial = stockData;
        console.log("Stock Data Final:", stockDataFinal)
        console.log("Stock Data Final Trial:", stockDataFinalTrial)
        setStockSearchResults([stockData]);
      } else {
        setStockSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
      setStockSearchResults([]);
    } finally {
      setIsSearchingStock(false);
    }
  };


  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    const matchesSearch = transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const transactionDate = new Date(transaction.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Calculate better metrics
  const totalBuyValue = transactions
    .filter((t: Transaction) => t.type === 'buy')
    .reduce((sum: number, t: Transaction) => sum + t.totalAmount, 0);

  const totalSellValue = transactions
    .filter((t: Transaction) => t.type === 'sell')
    .reduce((sum: number, t: Transaction) => sum + t.totalAmount, 0);

  const totalTransactions = transactions.length;
  const buyTransactions = transactions.filter((t: Transaction) => t.type === 'buy').length;
  const sellTransactions = transactions.filter((t: Transaction) => t.type === 'sell').length;

  // Calculate realized gains (simplified - actual calculation would need buy/sell matching)
  const realizedGains = portfolio?.realizedGains || 0;

  // Calculate most traded stock
  const stockTradeCounts = transactions.reduce((acc: { [key: string]: number }, t: Transaction) => {
    acc[t.symbol] = (acc[t.symbol] || 0) + 1;
    return acc;
  }, {});
  const mostTradedStock = Object.entries(stockTradeCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';

  // Calculate average trade size
  const averageTradeSize = totalTransactions > 0 
    ? (totalBuyValue + totalSellValue) / totalTransactions 
    : 0;

  // Calculate active trading days
  const uniqueTradingDays = new Set(transactions.map((t: Transaction) => t.date)).size;

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);


  const [selectedStock, setSelectedStock] = useState<{symbol: string, price: number, companyName: string} | null>(null);
  const [modalType, setModalType] = useState<"buy" | "sell" | null>(null);

  const openBuyModal = (stock: {symbol: string, price: number, companyName: string}) => {
    setSelectedStock(stock);
    setModalType("buy");
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, dateFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading trading data...</p>
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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Trading Center</h1>
          <p className="text-xl text-muted-foreground">Comprehensive transaction history and trading insights</p>
        </div>

        {/* Trading Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border hover:border-green-500/30 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${portfolio?.totalValue?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className={`${((portfolio?.realizedGains || 0) + (portfolio?.unrealizedGains || 0)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {((portfolio?.realizedGains || 0) + (portfolio?.unrealizedGains || 0)) >= 0 ? '+' : ''}${((portfolio?.realizedGains || 0) + (portfolio?.unrealizedGains || 0)).toFixed(2) || '0'}
                </span>
                <span className="text-muted-foreground">total P&L</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-green-500/30 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Realized Gains</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${realizedGains.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Actual profits from sales</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-green-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Traded</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{mostTradedStock}</div>
              <p className="text-xs text-muted-foreground">By transaction count</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-green-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trading Activity</CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalTransactions}</div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-muted-foreground">{uniqueTradingDays} days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Trading Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Buy vs Sell Ratio</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalTransactions > 0 ? Math.round((buyTransactions / totalTransactions) * 100) : 0}% / {totalTransactions > 0 ? Math.round((sellTransactions / totalTransactions) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Buy / Sell transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Capital Deployed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${((portfolio?.totalValue || 0) - (portfolio?.cashBalance || 0)).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Currently in stocks</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash Position</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${portfolio?.cashBalance?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Available for trading</p>
            </CardContent>
          </Card>
        </div>

        {/* Stock Search */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Stocks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Enter stock symbol (e.g., AAPL, TSLA, GOOGL)..."
                    value={stockSearchTerm}
                    onChange={(e) => setStockSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchStocks(stockSearchTerm)}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                </div>
                <Button 
                  onClick={() => searchStocks(stockSearchTerm)}
                  disabled={!stockSearchTerm.trim() || isSearchingStock}
                  className="gradient-green text-white"
                >
                  {isSearchingStock ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>

              {/* Stock Search Results */}
              {stockSearchResults.length > 0 && (
                <div className="space-y-4">
                  {stockSearchResults.map((stock, index) => (
                    <div key={index} className="p-4 rounded-lg bg-background border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm
                            ${stock.symbol === 'AAPL' ? 'bg-gray-600' : 
                              stock.symbol === 'TSLA' ? 'bg-red-600' :
                              stock.symbol === 'GOOGL' ? 'bg-blue-600' :
                              stock.symbol === 'AMZN' ? 'bg-orange-600' :
                              stock.symbol === 'MSFT' ? 'bg-blue-500' :
                              'bg-purple-600'}`}>
                            {stock.symbol}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{stock.companyName}</h3>
                            <p className="text-sm text-muted-foreground">Symbol: {stock.symbol}</p>
                          </div>
                        </div>
                                                 <div className="text-right">
                           <div className="text-2xl font-bold text-foreground">${stock.price?.toFixed(2) || '0.00'}</div>
                           <div className={`flex items-center text-sm ${(stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             {(stock.change || 0) >= 0 ? (
                               <TrendingUp className="w-4 h-4 mr-1" />
                             ) : (
                               <TrendingDown className="w-4 h-4 mr-1" />
                             )}
                             {(stock.change || 0) >= 0 ? '+' : ''}{stock.change?.toFixed(2) || '0.00'} ({stock.changePercent?.toFixed(2) || '0.00'}%)
                           </div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <Button 
                              size="sm" 
                              className="gradient-green text-white"
                              onClick={() => {
                                console.log("Stock Data Final:", stockDataFinal);
                                if (stockDataFinal) {
                                  console.log("Stock Data Final please work:", stockDataFinal);
                                  openBuyModal({
                                    symbol: stockDataFinal.symbol,
                                    price: stockDataFinal.price || 0,
                                    companyName: stockDataFinal.companyName
                                  });
                                }
                                console.log("I did a good job");
                              }}
                            >
                    Buy
                  </Button>
                         </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Volume</p>
                          <p className="font-medium text-foreground">{stock.volume?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Market Cap</p>
                          <p className="font-medium text-foreground">
                            {stock.marketCap ? `$${(stock.marketCap / 1000000000).toFixed(2)}B` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Previous Close</p>
                          <p className="font-medium text-foreground">${stock.previousClose?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Day Range</p>
                          <p className="font-medium text-foreground">
                            ${stock.dayLow?.toFixed(2) || 'N/A'} - ${stock.dayHigh?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {stockSearchTerm && stockSearchResults.length === 0 && !isSearchingStock && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No stock found with symbol "{stockSearchTerm}"</p>
                  <p className="text-sm text-muted-foreground mt-2">Try searching for a valid stock symbol</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by symbol or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="buy">Buy Orders</SelectItem>
                  <SelectItem value="sell">Sell Orders</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Transaction History</span>
              <Badge variant="secondary" className="ml-2">
                {filteredTransactions.length} transactions
              </Badge>
              {totalPages > 1 && (
                <Badge variant="outline" className="ml-2">
                  Page {currentPage} of {totalPages}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground">
                  {transactions.length === 0 
                    ? "Start trading to see your transaction history here."
                    : "Try adjusting your filters to see more results."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentTransactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'buy' ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">{transaction.symbol}</h3>
                          <Badge variant={transaction.type === 'buy' ? 'default' : 'destructive'}>
                            {transaction.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{transaction.companyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            try {
                              // Handle both timestamp and createdAt properties
                              const dateValue = (transaction as any).timestamp || (transaction as any).createdAt;
                              const date = new Date(dateValue);
                              if (isNaN(date.getTime())) {
                                return 'Invalid date';
                              }
                              return format(date, 'MMM dd, yyyy');
                            } catch (error) {
                              return 'Invalid date';
                            }
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Shares</p>
                          <p className="font-medium text-foreground">{transaction.shares}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium text-foreground">${transaction.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className={`font-bold text-lg ${
                            transaction.type === 'buy' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {transaction.type === 'buy' ? '-' : '+'}${transaction.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Buy Stock Modal */}
      {showBuyModal && selectedStockForBuy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Buy {selectedStockForBuy.symbol}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowBuyModal(false);
                  setSelectedStockForBuy(null);
                  setBuyQuantity(1);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{selectedStockForBuy.companyName}</span>
                  <span className="text-sm text-muted-foreground">{selectedStockForBuy.symbol}</span>
                </div>
                <div className="text-2xl font-bold text-foreground">${selectedStockForBuy.price?.toFixed(2) || '0.00'}</div>
                <div className={`flex items-center text-sm ${(selectedStockForBuy.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(selectedStockForBuy.change || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {(selectedStockForBuy.change || 0) >= 0 ? '+' : ''}{selectedStockForBuy.change?.toFixed(2) || '0.00'} ({selectedStockForBuy.changePercent?.toFixed(2) || '0.00'}%)
                </div>
              </div>

              
              

              <div className="p-4 rounded-lg bg-muted/50">
                
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span className="text-foreground">Share price:</span>
                  <span className="text-foreground">${((selectedStockForBuy.price || 0) * buyQuantity).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-black text-white border-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-200 font-semibold"
                  onClick={() => {
                    setShowBuyModal(false);
                    setSelectedStockForBuy(null);
                    setBuyQuantity(1);
                  }}
                >
                  Cancel
                </Button>
                
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedStock && modalType && (
        <BuySellModal
          isOpen={!!selectedStock}
          onClose={closeModal}
          selectedStock={selectedStock}
          modalType={modalType}
        />
      )}

      
    </div>
  );
}
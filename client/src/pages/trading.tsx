import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/ui/navigation";
import { FloatingAIChat } from "@/components/ui/floating-ai-chat";
import { TrendingUp, TrendingDown, Search, Filter, Calendar, DollarSign, BarChart3, Clock } from "lucide-react";
import { format } from "date-fns";

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

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      return response.json();
    }
  });

  const { data: portfolio } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: async () => {
      const response = await fetch('/api/portfolio');
      return response.json();
    }
  });

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
          <Card className="bg-card border-border hover:border-green-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${portfolio?.totalValue?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className={`${(portfolio?.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(portfolio?.profitLoss || 0) >= 0 ? '+' : ''}${portfolio?.profitLoss?.toFixed(2) || '0'}
                </span>
                <span className="text-muted-foreground">total P&L</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-green-500/30 transition-all">
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
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">${averageTradeSize.toFixed(0)} avg</span>
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
              <div className="text-2xl font-bold text-foreground">${totalBuyValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total investment capital</p>
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
                              return format(date, 'MMM dd, yyyy HH:mm');
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

      <FloatingAIChat />
    </div>
  );
}
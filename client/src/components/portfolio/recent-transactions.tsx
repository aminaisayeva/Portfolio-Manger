import { useQuery } from "@tanstack/react-query";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { Transaction } from "@shared/schema";

export function RecentTransactions() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions?limit=5');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="bg-navy-800 rounded-xl p-6 card-glow-green">
        <div className="animate-pulse">
          <div className="h-6 bg-navy-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-navy-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 card-glow-green border border-border">
      <h3 className="text-lg font-bold text-foreground mb-4">Recent Transactions</h3>
      
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          transactions.map((transaction: Transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${transaction.type === 'buy' ? 'gradient-green' : 'gradient-red'} rounded-lg flex items-center justify-center`}>
                  {transaction.type === 'buy' ? 
                    <Plus className="text-white w-4 h-4" /> : 
                    <Minus className="text-white w-4 h-4" />
                  }
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {transaction.type === 'buy' ? 'Bought' : 'Sold'} {transaction.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {transaction.createdAt ? formatDate(transaction.createdAt) : 'Recently'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-foreground">{transaction.shares} shares</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(transaction.totalAmount)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-4 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium flex items-center justify-center">
        View All Transactions <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
}

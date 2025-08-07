import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BuySellModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStock?: {symbol: string, price: number, companyName: string} | null;
  modalType?: 'buy' | 'sell' | null;
  symbol?: string;
  companyName?: string;
  defaultType?: 'buy' | 'sell';
}

export function BuySellModal({ 
  isOpen, 
  onClose, 
  selectedStock, 
  modalType, 
  symbol = selectedStock?.symbol || "", 
  companyName = selectedStock?.companyName || "", 
  defaultType = modalType || 'buy' 
}: BuySellModalProps) {
  const [formData, setFormData] = useState({
    symbol: symbol,
    companyName: companyName,
    shares: '',
    type: defaultType
  });
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get portfolio data for cash balance
  const { data: portfolioData, refetch: refetchPortfolio } = useQuery({
    queryKey: ['/api/portfolio'],
    enabled: isOpen,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true
  });

  // Update form when props change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      symbol,
      companyName,
      type: defaultType
    }));
  }, [symbol, companyName, defaultType]);

  // Fetch stock price when symbol changes
  useEffect(() => {
    if (formData.symbol && formData.symbol.length >= 1) {
      fetch(`/api/stocks/${formData.symbol}`)
        .then(res => res.json())
        .then(data => {
          if (data.price) {
            setStockPrice(data.price);
            if (!formData.companyName) {
              setFormData(prev => ({ ...prev, companyName: data.companyName }));
            }
          }
        })
        .catch(() => setStockPrice(null));
    }
  }, [formData.symbol]);

  const tradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/trade', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch portfolio data immediately
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.refetchQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      toast({
        title: "Success",
        description: `Successfully ${formData.type === 'buy' ? 'bought' : 'sold'} ${formData.shares} shares of ${formData.symbol}`,
      });
      onClose();
      setFormData({ symbol: '', companyName: '', shares: '', type: 'buy' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute trade",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.shares || !formData.companyName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const shares = parseInt(formData.shares);
    if (shares <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of shares",
        variant: "destructive"
      });
      return;
    }

    // Check cash balance for buy orders
    if (formData.type === 'buy' && stockPrice) {
      const totalCost = stockPrice * shares;
      const cashBalance = getCashBalance();
      
      if (totalCost > cashBalance) {
        toast({
          title: "Insufficient Funds",
          description: `You need $${totalCost.toFixed(2)} but only have $${cashBalance.toFixed(2)} available`,
          variant: "destructive"
        });
        return;
      }
    }

    tradeMutation.mutate({
      symbol: formData.symbol.toUpperCase(),
      amount: shares,
      trade_type: formData.type.toUpperCase()
    });
  };

  const estimatedCost = stockPrice && formData.shares ? 
    stockPrice * parseInt(formData.shares || '0') : 0;

  // Helper function to get cash balance from portfolio data
  const getCashBalance = () => {
    if (!portfolioData) return 0;
    
    // Try different possible structures for cash balance
    const cashFromSummary = (portfolioData as any)?.summary?.cashBalance;
    const cashFromRoot = (portfolioData as any)?.cashBalance;
    
    return cashFromSummary || cashFromRoot || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>
            {formData.type === 'buy' ? 'Buy Stock' : 'Sell Stock'}
          </DialogTitle>
          <DialogDescription>
            {formData.type === 'buy' ? 'Purchase shares of a stock' : 'Sell shares from your portfolio'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-muted-foreground mb-3 block">Stock Symbol</Label>
            <Input
              type="text"
              placeholder="e.g., AAPL"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
              required
            />
          </div>

          <div>
            <Label className="text-muted-foreground mb-3 block">Company Name</Label>
            <Input
              type="text"
              placeholder="e.g., Apple Inc."
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
              required
            />
          </div>
          
          <div>
            <Label className="text-muted-foreground mb-3 block">Number of Shares</Label>
            <Input
              type="number"
              placeholder="10"
              min="1"
              value={formData.shares}
              onChange={(e) => setFormData(prev => ({ ...prev, shares: e.target.value }))}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
              required
            />
          </div>
          
          {estimatedCost > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current Price</span>
                <span className="text-foreground font-semibold">
                  ${stockPrice?.toFixed(2) || '---'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">Estimated {formData.type === 'buy' ? 'Cost' : 'Proceeds'}</span>
                <span className="text-foreground font-semibold">
                  ${estimatedCost.toFixed(2)}
                </span>
              </div>
              {formData.type === 'buy' && (
                <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground">Available Cash</span>
                  <span className={`font-semibold ${
                    estimatedCost > getCashBalance() ? 'text-red-400' : 'text-green-400'
                  }`}>
                    ${getCashBalance().toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className={`w-full text-white font-semibold hover-lift ${
              formData.type === 'buy' ? 'gradient-green' : 'gradient-red'
            }`}
            disabled={tradeMutation.isPending}
          >
            {tradeMutation.isPending ? 'Processing...' : `Place ${formData.type === 'buy' ? 'Buy' : 'Sell'} Order`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

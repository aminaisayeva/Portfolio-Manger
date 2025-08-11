import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFundsModal({ isOpen, onClose }: AddFundsModalProps) {
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', '/api/add-funds', { amount });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch portfolio data immediately
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.refetchQueries({ queryKey: ['/api/portfolio'] });
      //console.log(data)
      toast({
        title: "Success",
        description: `Successfully added $${amount} to   account.`,
      });
      onClose();
      setAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add funds",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    if (amountValue > 100000) {
      toast({
        title: "Error", 
        description: "Maximum deposit amount is $100,000",
        variant: "destructive"
      });
      return;
    }

    addFundsMutation.mutate(amountValue);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add Funds to Wallet
          </DialogTitle>
          <DialogDescription>
            Add money to   trading account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-muted-foreground mb-2">Amount (USD)</Label>
            <Input
              type="number"
              placeholder="1000"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-border text-foreground placeholder-muted-foreground"
              required
            />
          </div>

          <div>
            <Label className="text-muted-foreground mb-2">Quick Amounts</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="bg-background border-border text-muted-foreground hover:bg-muted"
                >
                  ${quickAmount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">Payment Method</div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-blue rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">💳</span>
              </div>
              <div>
                <div className="text-foreground text-sm font-medium">Bank Account ****1234</div>
                <div className="text-xs text-muted-foreground">Instant Transfer</div>
              </div>
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount to Add</span>
                <span className="text-foreground font-semibold">
                  ${parseFloat(amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="text-foreground font-semibold">$0.00</span>
              </div>
              <hr className="border-border my-2" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground font-semibold">
                  ${parseFloat(amount).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full gradient-green text-white font-semibold hover-lift"
            disabled={addFundsMutation.isPending}
          >
            {addFundsMutation.isPending ? 'Processing...' : 'Add Funds'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Funds will be available immediately for trading
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Plus, Wallet, DollarSign, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioSummary } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";


interface PortfolioHeaderProps {
  summary: PortfolioSummary;
  onBuyClick: () => void;
  onAddFundsClick: () => void;
}

export function PortfolioHeader({ summary, onBuyClick, onAddFundsClick }: PortfolioHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Overview</h1>
          <p className="text-muted-foreground">Track your investments and manage your wealth</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button onClick={onBuyClick} className="gradient-green text-white font-medium hover-lift">
            <Plus className="w-4 h-4 mr-2" />
            Buy Assets
          </Button>
          <Button 
            onClick={onAddFundsClick}
            variant="outline" 
            className="bg-card border-border text-foreground hover:bg-muted"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>

      {/* Portfolio Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 card-glow-purple hover-lift border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 gradient-purple rounded-lg flex items-center justify-center">
              <DollarSign className="text-white w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${summary.totalGainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary.totalGainPercent >= 0 ? '+' : ''}{summary.totalGainPercent.toFixed(2)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{formatCurrency(summary.totalValue)}</div>
          <div className="text-muted-foreground text-sm">Total Portfolio Value</div>
        </div>

        <div className="bg-card rounded-xl p-6 card-glow-green hover-lift border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 gradient-green rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${summary.dayGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary.dayGain >= 0 ? '+' : ''}${Math.abs(summary.dayGain).toLocaleString()}
            </span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${summary.dayGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.dayGain >= 0 ? '+' : ''}${Math.abs(summary.dayGain).toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm">Today's Gain/Loss</div>
        </div>

        <div className="bg-card rounded-xl p-6 card-glow-blue hover-lift border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 gradient-blue rounded-lg flex items-center justify-center">
              <PieChart className="text-white w-6 h-6" />
            </div>
            <span className="text-blue-400 text-sm font-medium">Assets</span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${summary.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.totalGain >= 0 ? '+' : ''}${Math.abs(summary.totalGain).toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm">Total Gain/Loss</div>
        </div>

        <div className="bg-card rounded-xl p-6 card-glow-orange hover-lift border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 gradient-orange rounded-lg flex items-center justify-center">
              <Wallet className="text-white w-6 h-6" />
            </div>
            <span className="text-orange-400 text-sm font-medium">Available</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{formatCurrency(summary.cashBalance)}</div>
          <div className="text-muted-foreground text-sm">Cash Balance</div>
        </div>
      </div>
    </div>
  );
}

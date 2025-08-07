import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Position {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  currentPrice: number;
  currentValue: number;
  gain: number;
  gainPercent: number;
}

interface HoldingsListProps {
  positions: Position[];
  onBuyClick: (symbol: string, companyName: string) => void;
  onSellClick: (symbol: string, companyName: string) => void;
}

export function HoldingsList({ positions, onBuyClick, onSellClick }: HoldingsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGradientClass = (symbol: string) => {
    const gradients = ['gradient-blue', 'gradient-green', 'gradient-purple', 'gradient-orange'];
    const index = symbol.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="bg-card rounded-xl p-6 card-glow-green border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Your Holdings</h2>
        <button className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium flex items-center">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="space-y-4">
        {positions.map((position) => (
          <div key={position.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${getGradientClass(position.symbol)} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{position.symbol}</span>
              </div>
              <div>
                <div className="font-semibold text-foreground">{position.companyName}</div>
                <div className="text-sm text-muted-foreground">{position.shares} shares</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-foreground">{formatCurrency(position.currentValue)}</div>
              <div className={`text-sm ${position.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {position.gain >= 0 ? '+' : ''}{formatCurrency(position.gain)} ({position.gain >= 0 ? '+' : ''}{position.gainPercent.toFixed(2)}%)
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                className="gradient-red text-white hover-lift"
                onClick={() => onSellClick(position.symbol, position.companyName)}
              >
                Sell
              </Button>
              <Button 
                size="sm" 
                className="gradient-green text-white hover-lift"
                onClick={() => onBuyClick(position.symbol, position.companyName)}
              >
                Buy
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

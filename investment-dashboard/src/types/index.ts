export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}

export interface Portfolio {
  totalValue: number;
  profitLoss: number;
  monthlyGrowth: number;
  bestToken: Asset;
  history: { date: string; value: number }[];
  assets: Asset[];
}

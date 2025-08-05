// src/types.ts

/**
 * A point in time representing portfolio value at a given date
 */
export type ChartPoint = {
  date: string;  // YYYY-MM-DD
  value: number; // total portfolio value at that date
};

/**
 * Represents an individual asset holding
 */
export type Asset = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  weighted_buy_price: number;
  old_price?: number;             // price at period start
  period_days?: number;           // number of days for this change
  period_change_pct?: number;     // change percent over the period
};

/**
 * Portfolio structure returned by the API
 */
export type Portfolio = {
  totalValue: number;
  profitLoss: number;
  monthlyGrowth: number;
  /**
   * Best-performing tokens for each window
   * Keys: '7d', '30d', '90d'
   */
  bestTokens: Record<'7d' | '30d' | '90d', Asset | null>;
  history: ChartPoint[];
  assets: Asset[];
};

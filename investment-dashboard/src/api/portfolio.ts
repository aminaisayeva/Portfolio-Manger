// src/api/portfolio.ts
import { Portfolio } from '../types';

export async function fetchPortfolio(): Promise<Portfolio> {
  // Fake a network delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        totalValue:    12500,
        profitLoss:     850,
        monthlyGrowth:    4.5,
        bestToken:    {
          symbol: 'AAPL',
          name:   'Apple Inc.',
          price:  172.35,
          change:  1.8,
          volume: 1200000
        },
        history: [
          { date: '2025-07-25', value: 11700 },
          { date: '2025-07-26', value: 11950 },
          { date: '2025-07-27', value: 12100 },
          { date: '2025-07-28', value: 12300 },
          { date: '2025-07-29', value: 12500 },
        ],
        assets: [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 172.35, change: 1.8,  volume: 1200000 },
          { symbol: 'GOOG', name: 'Alphabet Inc.', price: 2795.12, change: -0.5, volume:  800000 },
          { symbol: 'TSLA', name: 'Tesla Inc.', price:  709.24, change:  2.1, volume: 1500000 },
        ]
      });
    }, 500);
  });
}

export async function executeTrade(
  symbol: string,
  amount: number,
  type: 'buy' | 'sell'
) {
  // For now, just log and return success
  console.log(`Mock trade ${type} ${amount} of ${symbol}`);
  return { success: true };
}

// src/data/allStocks.ts
import { Asset } from '../types';

export const allStocks: Asset[] = [
  { symbol: 'AAPL', name: 'Apple Inc.',     price: 150.12, change:  1.2, volume: 1_000_000 },
  { symbol: 'GOOGL',name: 'Alphabet Inc.',  price: 2800.50,change: -0.8, volume:   800_000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.',price: 3400.23,change:  2.5, volume: 1_200_000 },
  { symbol: 'TSLA', name: 'Tesla Inc.',     price:  720.15,change: -1.1, volume: 1_500_000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.',price: 299.45, change:  0.3, volume: 1_100_000 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.',   price: 640.00, change:  3.1, volume:   900_000 },
];

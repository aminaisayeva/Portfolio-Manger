import { StockData, MarketIndex } from "@shared/schema";

// Mock stock data with realistic price movements
const mockStocks: Record<string, StockData> = {
  "AAPL": {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    price: 173.15,
    change: 5.12,
    changePercent: 3.04,
    volume: 52746832,
    marketCap: 2675000000000
  },
  "TSLA": {
    symbol: "TSLA",
    companyName: "Tesla Inc.",
    price: 216.52,
    change: -3.01,
    changePercent: -1.37,
    volume: 91256743,
    marketCap: 689000000000
  },
  "AMZN": {
    symbol: "AMZN",
    companyName: "Amazon Inc.",
    price: 158.69,
    change: 4.98,
    changePercent: 3.24,
    volume: 45367821,
    marketCap: 1654000000000
  },
  "GOOGL": {
    symbol: "GOOGL",
    companyName: "Alphabet Inc.",
    price: 145.62,
    change: 2.43,
    changePercent: 1.70,
    volume: 23456789,
    marketCap: 1832000000000
  },
  "MSFT": {
    symbol: "MSFT",
    companyName: "Microsoft Corp.",
    price: 378.91,
    change: 8.67,
    changePercent: 2.34,
    volume: 28945671,
    marketCap: 2816000000000
  },
  "NVDA": {
    symbol: "NVDA",
    companyName: "NVIDIA Corp.",
    price: 487.52,
    change: 26.11,
    changePercent: 5.67,
    volume: 67832451,
    marketCap: 1201000000000
  },
  "META": {
    symbol: "META",
    companyName: "Meta Platforms Inc.",
    price: 324.87,
    change: -4.23,
    changePercent: -1.28,
    volume: 19856743,
    marketCap: 825000000000
  },
  "NFLX": {
    symbol: "NFLX",
    companyName: "Netflix Inc.",
    price: 456.78,
    change: 12.45,
    changePercent: 2.80,
    volume: 8567432,
    marketCap: 203000000000
  }
};

const marketIndices: MarketIndex[] = [
  {
    name: "S&P 500",
    value: 4267.52,
    change: 52.47,
    changePercent: 1.23
  },
  {
    name: "NASDAQ",
    value: 13567.98,
    change: 267.33,
    changePercent: 2.01
  },
  {
    name: "DOW",
    value: 33845.73,
    change: -153.24,
    changePercent: -0.45
  }
];

export class StockService {
  async getStockData(symbol: string): Promise<StockData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stock = mockStocks[symbol.toUpperCase()];
    if (!stock) {
      return null;
    }

    // Add some random price movement
    const priceVariation = (Math.random() - 0.5) * 2; // -1 to 1
    const newPrice = stock.price + priceVariation;
    const change = newPrice - stock.price;
    const changePercent = (change / stock.price) * 100;

    return {
      ...stock,
      price: Number(newPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2))
    };
  }

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map(symbol => this.getStockData(symbol));
    const results = await Promise.all(promises);
    return results.filter(stock => stock !== null) as StockData[];
  }

  async searchStocks(query: string): Promise<StockData[]> {
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const results = Object.values(mockStocks).filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(query.toLowerCase())
    );

    return results.slice(0, 10); // Limit to 10 results
  }

  async getTrendingStocks(): Promise<StockData[]> {
    // Return stocks sorted by volume (trending)
    const trending = Object.values(mockStocks)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    return trending;
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    // Add some random movement to indices
    return marketIndices.map(index => ({
      ...index,
      value: Number((index.value + (Math.random() - 0.5) * 10).toFixed(2)),
      change: Number((index.change + (Math.random() - 0.5) * 5).toFixed(2)),
      changePercent: Number((index.changePercent + (Math.random() - 0.5) * 0.5).toFixed(2))
    }));
  }

  async validateStock(symbol: string): Promise<boolean> {
    const stock = await this.getStockData(symbol);
    return stock !== null;
  }
}

export const stockService = new StockService();

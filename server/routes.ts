import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stockService } from "./services/stock-service";
import { aiService } from "./services/ai-service";
import { 
  tradeSchema, 
  addFundsSchema, 
  chatQuerySchema,
  type StockData,
  type PortfolioSummary 
} from "@shared/schema";
import { z } from "zod";

const DEFAULT_USER_ID = "default-user"; // For demo purposes

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get portfolio summary - integrates with   MySQL Flask backend
  app.get("/api/portfolio", async (req, res) => {
    try {
      // First try to fetch from   Flask backend  
      try {
        const response = await fetch('http://localhost:8000/api/portfolio');
        if (response.ok) {
          const portfolioData = await response.json();
          return res.json(portfolioData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available, using fallback data');
      }

      // Fallback to mock data if Flask backend is not running
      const userId = DEFAULT_USER_ID;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const portfolio = await storage.getUserPortfolio(userId);
      const symbols = portfolio.map(p => p.symbol);
      const stockData = await stockService.getMultipleStocks(symbols);
      
      let totalValue = 0;
      let totalCost = 0;
      
      const portfolioWithCurrentData = portfolio.map(position => {
        const currentStock = stockData.find(s => s.symbol === position.symbol);
        const currentPrice = currentStock?.price || parseFloat(position.averagePrice);
        const positionValue = currentPrice * position.shares;
        const positionCost = parseFloat(position.averagePrice) * position.shares;
        
        totalValue += positionValue;
        totalCost += positionCost;
        
        return {
          ...position,
          currentPrice,
          currentValue: positionValue,
          gain: positionValue - positionCost,
          gainPercent: ((positionValue - positionCost) / positionCost) * 100,
          stockData: currentStock
        };
      });

      const cashBalance = parseFloat(user.cashBalance);
      const totalPortfolioValue = totalValue + cashBalance;
      const totalGain = totalValue - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

      const summary: PortfolioSummary = {
        totalValue: totalPortfolioValue,
        totalGain,
        totalGainPercent,
        dayGain: totalValue * 0.024, // Mock day gain (~2.4%)
        dayGainPercent: 2.43,
        cashBalance
      };

      res.json({
        summary,
        positions: portfolioWithCurrentData
      });
    } catch (error) {
      console.error("Portfolio fetch error:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Get sector performance - integrates with Flask backend
  app.get("/api/sector-performance", async (req, res) => {
    try {
      // First try to fetch from Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/sector_performance');
        if (response.ok) {
          const sectorData = await response.json();
          return res.json(sectorData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available, using fallback sector data');
      }

      // Fallback to mock data if Flask backend is not running
      const mockSectorData = [
        { name: 'Technology', change: 2.1, volume: '12.5B', top: 'NVDA', topChange: 3.4 },
        { name: 'Healthcare', change: 1.3, volume: '8.2B', top: 'JNJ', topChange: 2.1 },
        { name: 'Finance', change: -0.8, volume: '15.3B', top: 'JPM', topChange: -0.5 },
        { name: 'Energy', change: 3.2, volume: '9.7B', top: 'XOM', topChange: 4.1 },
        { name: 'Consumer Discretionary', change: 0.5, volume: '11.1B', top: 'AMZN', topChange: 1.2 },
        { name: 'Consumer Staples', change: -0.2, volume: '6.8B', top: 'PG', topChange: 0.1 },
        { name: 'Industrials', change: 1.7, volume: '7.9B', top: 'BA', topChange: 2.8 },
        { name: 'Materials', change: 2.4, volume: '5.5B', top: 'FCX', topChange: 3.6 }
      ];

      res.json(mockSectorData);
    } catch (error) {
      console.error("Sector performance fetch error:", error);
      res.status(500).json({ message: "Failed to fetch sector performance" });
    }
  });

  // Get market performance - integrates with Flask backend
  app.get("/api/market-performance", async (req, res) => {
    try {
      // First try to fetch from Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/market_performance');
        if (response.ok) {
          const performanceData = await response.json();
          return res.json(performanceData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available, using fallback market performance data');
      }

      // Fallback to mock data if Flask backend is not running
      res.json({});
    } catch (error) {
      console.error("Market performance fetch error:", error);
      res.status(500).json({ message: "Failed to fetch market performance" });
    }
  });

  // Get economic indicators - integrates with Flask backend
  app.get("/api/economic-indicators", async (req, res) => {
    try {
      // First try to fetch from Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/economic_indicators');
        if (response.ok) {
          const economicData = await response.json();
          return res.json(economicData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available, using fallback economic data');
      }

      // Fallback to mock data if Flask backend is not running
      res.json({});
    } catch (error) {
      console.error("Economic indicators fetch error:", error);
      res.status(500).json({ message: "Failed to fetch economic indicators" });
    }
  });

  // Get market news - integrates with Flask backend
  app.get("/api/market-news", async (req, res) => {
    try {
      // First try to fetch from Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/market_news');
        if (response.ok) {
          const newsData = await response.json();
          return res.json(newsData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available, using fallback market news data');
      }

      // Fallback to mock data if Flask backend is not running
      res.json([
        {
          id: 1,
          title: "Fed Signals Potential Rate Cut as Inflation Cools",
          source: "MarketWatch",
          time: "2 hours ago",
          impact: "high"
        },
        {
          id: 2,
          title: "Tech Earnings Season Kicks Off with Strong Results",
          source: "CNBC",
          time: "4 hours ago",
          impact: "medium"
        },
        {
          id: 3,
          title: "Oil Prices Surge on Middle East Tensions",
          source: "Bloomberg",
          time: "6 hours ago",
          impact: "high"
        },
        {
          id: 4,
          title: "Consumer Confidence Index Beats Expectations",
          source: "Reuters",
          time: "1 day ago",
          impact: "medium"
        }
      ]);
    } catch (error) {
      console.error("Market news fetch error:", error);
      res.status(500).json({ message: "Failed to fetch market news" });
    }
  });

  // Execute trade - integrates with   Flask backend handle_trade function  
  app.post("/api/trade", async (req, res) => {
    try {
      const { symbol, amount, trade_type, price } = req.body;
      
      // Validate required fields
      if (!symbol || !amount || !trade_type) {
        return res.status(400).json({ error: 'Missing required fields: symbol, amount, trade_type' });
      }

      // First try to send trade to   Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/trade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol: symbol.toUpperCase(),
            amount: parseFloat(amount),
            trade_type: trade_type.toUpperCase(), // BUY or SELL
            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
          })
        });

        if (response.ok) {
          const result = await response.json();
          return res.json({ 
            success: true, 
            message: `Successfully ${trade_type.toLowerCase()}ed ${amount} shares of ${symbol}`,
            data: result
          });
        } else {
          const errorData = await response.json();
          return res.status(response.status).json({ error: errorData.message || 'Trade failed' });
        }
      } catch (flaskError) {
        console.log('Flask backend not available for trading, using fallback');
      }

      // Fallback to original trade logic if Flask backend not available
      const trade = tradeSchema.parse({ 
        symbol, 
        shares: parseInt(amount), 
        type: trade_type === 'sell' ? 'sell' : 'buy',
        companyName: symbol // Will be filled from stock data
      });
      const userId = DEFAULT_USER_ID;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get current stock price
      const stockData = await stockService.getStockData(trade.symbol);
      if (!stockData) {
        return res.status(400).json({ message: "Invalid stock symbol" });
      }

      const currentPrice = stockData.price;
      const totalAmount = currentPrice * trade.shares;
      const currentCashBalance = parseFloat(user.cashBalance);

      if (trade.type === 'buy') {
        // Check if user has enough cash
        if (currentCashBalance < totalAmount) {
          return res.status(400).json({ message: "Insufficient funds" });
        }

        // Update cash balance
        await storage.updateUserCashBalance(userId, currentCashBalance - totalAmount);

        // Update or create portfolio position
        const existingPosition = await storage.getPortfolioPosition(userId, trade.symbol);
        if (existingPosition) {
          const currentShares = existingPosition.shares;
          const currentAvgPrice = parseFloat(existingPosition.averagePrice);
          const newShares = currentShares + trade.shares;
          const newAvgPrice = ((currentShares * currentAvgPrice) + (trade.shares * currentPrice)) / newShares;
          
          await storage.updatePortfolioPosition(userId, trade.symbol, newShares, newAvgPrice);
        } else {
          await storage.createPortfolioPosition({
            userId,
            symbol: trade.symbol,
            companyName: trade.companyName,
            shares: trade.shares,
            averagePrice: currentPrice.toString()
          });
        }
      } else { // sell
        const existingPosition = await storage.getPortfolioPosition(userId, trade.symbol);
        if (!existingPosition || existingPosition.shares < trade.shares) {
          return res.status(400).json({ message: "Insufficient shares" });
        }

        // Update cash balance
        await storage.updateUserCashBalance(userId, currentCashBalance + totalAmount);

        // Update or delete portfolio position
        const remainingShares = existingPosition.shares - trade.shares;
        if (remainingShares === 0) {
          await storage.deletePortfolioPosition(userId, trade.symbol);
        } else {
          await storage.updatePortfolioPosition(
            userId, 
            trade.symbol, 
            remainingShares, 
            parseFloat(existingPosition.averagePrice)
          );
        }
      }

      // Create transaction record
      await storage.createTransaction({
        userId,
        symbol: trade.symbol,
        companyName: trade.companyName,
        type: trade.type,
        shares: trade.shares,
        price: currentPrice.toString(),
        totalAmount: totalAmount.toString()
      });

      res.json({ 
        message: `Successfully ${trade.type === 'buy' ? 'bought' : 'sold'} ${trade.shares} shares of ${trade.symbol}`,
        price: currentPrice,
        totalAmount
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trade data", errors: error.errors });
      }
      console.error("Trade execution error:", error);
      res.status(500).json({ message: "Failed to execute trade" });
    }
  });

  // Add funds to wallet - integrates with   Flask backend
  app.post("/api/add-funds", async (req, res) => {
    try {
      const { amount } = addFundsSchema.parse(req.body);

      // First try to send add-funds request to   Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/add-funds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(result)
          return res.json({ 
            success: true, 
            message: result.message,
            newBalance: result.new_balance,
            amountAdded: result.amount_added
          });
        } else {
          const errorData = await response.json();
          return res.status(response.status).json({ error: errorData.message || 'Add funds failed' });
        }
      } catch (flaskError) {
        console.log('Flask backend not available for add-funds, using fallback');
      }

      // Fallback to memory storage if Flask backend not available
      const userId = DEFAULT_USER_ID;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid amount", errors: error.errors });
      }
      console.error("Add funds error:", error);
      res.status(500).json({ message: "Failed to add funds" });
    }
  });
  // Get market data
  app.get("/api/market", async (req, res) => {
    try {
      // First try to fetch real market data from Flask backend
      try {
        console.log('🔍 Attempting to fetch real market data from Flask backend...');
        const response = await fetch('http://localhost:8000/api/market_movers');
        
        if (response.ok) {
          const realMarketData = await response.json();
          console.log('✅ Fetched real market data from Flask backend');
          
          // Convert to the format expected by the frontend
          const marketIndices = [
            {
              name: realMarketData["S&P 500"].name,
              symbol: "SPX",
              value: realMarketData["S&P 500"].value,
              change: realMarketData["S&P 500"].change,
              changePercent: realMarketData["S&P 500"].changePercent,
              volume: realMarketData["S&P 500"].volume
            },
            {
              name: realMarketData["NASDAQ"].name,
              symbol: "IXIC",
              value: realMarketData["NASDAQ"].value,
              change: realMarketData["NASDAQ"].change,
              changePercent: realMarketData["NASDAQ"].changePercent,
              volume: realMarketData["NASDAQ"].volume
            },
            {
              name: realMarketData["Dow Jones"].name,
              symbol: "DJI",
              value: realMarketData["Dow Jones"].value,
              change: realMarketData["Dow Jones"].change,
              changePercent: realMarketData["Dow Jones"].changePercent,
              volume: realMarketData["Dow Jones"].volume
            },
            {
              name: realMarketData["Russell 2000"].name,
              symbol: "RUT",
              value: realMarketData["Russell 2000"].value,
              change: realMarketData["Russell 2000"].change,
              changePercent: realMarketData["Russell 2000"].changePercent,
              volume: realMarketData["Russell 2000"].volume
            }
          ];
          
          const trendingStocks = await stockService.getTrendingStocks();
          
          return res.json({
            trendingStocks,
            marketIndices
          });
        } else {
          console.log(`❌ Flask backend returned ${response.status} for market data`);
        }
      } catch (flaskError) {
        console.log('⚠️ Flask backend error for market data:', (flaskError as Error).message);
      }

      // Fallback to mock data if Flask backend is not available
      console.log('🔄 Using fallback market data');
      const [trendingStocks, marketIndices] = await Promise.all([
        stockService.getTrendingStocks(),
        stockService.getMarketIndices()
      ]);

      res.json({
        trendingStocks,
        marketIndices
      });
    } catch (error) {
      console.error("Market data error:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Search stocks
  app.get("/api/stocks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }

      const results = await stockService.searchStocks(query);
      res.json(results);
    } catch (error) {
      console.error("Stock search error:", error);
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  // Get stock data - integrates with Flask backend for real-time yfinance data
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
            // First try to fetch from Flask backend for real-time yfinance data
      try {
        console.log(`🔍 Attempting to fetch real-time data for ${symbol} from Flask backend...`);
        
        // Use a simple fetch without timeout first
        const response = await fetch(`http://localhost:8000/api/stocks/${symbol}`);
        
        if (response.ok) {
          const stockData = await response.json();
          console.log(`✅ Real-time data for ${symbol}: $${stockData.price}`);
          return res.json(stockData);
        } else {
          console.log(`❌ Flask backend returned ${response.status} for ${symbol}`);
        }
      } catch (flaskError) {
        console.log(`⚠️ Flask backend error for ${symbol}:`, (flaskError as Error).message);
      }

      // Fallback to mock data if Flask backend is not available
      console.log(`🔄 Using fallback data for ${symbol}`);
      const stockData = await stockService.getStockData(symbol);
      
      if (!stockData) {
        return res.status(404).json({ message: "Stock not found" });
      }

      res.json(stockData);
    } catch (error) {
      console.error("Stock data error:", error);
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });

  // AI Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = chatQuerySchema.parse(req.body);
      const userId = DEFAULT_USER_ID;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const portfolio = await storage.getUserPortfolio(userId);
      const symbols = portfolio.map(p => p.symbol);
      const stockData = await stockService.getMultipleStocks(symbols);
      
      // Calculate total portfolio value
      let totalValue = 0;
      portfolio.forEach(position => {
        const currentStock = stockData.find(s => s.symbol === position.symbol);
        const currentPrice = currentStock?.price || parseFloat(position.averagePrice);
        totalValue += currentPrice * position.shares;
      });

      const response = await aiService.getPortfolioInsights(
        portfolio, 
        totalValue, 
        parseFloat(user.cashBalance), 
        message
      );

      // Save chat message
      await storage.createChatMessage({
        userId,
        message,
        response
      });

      res.json({ response });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message", errors: error.errors });
      }
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  // Get AI portfolio analysis
  app.get("/api/ai/analyze", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const portfolio = await storage.getUserPortfolio(userId);
      const symbols = portfolio.map(p => p.symbol);
      const stockData = await stockService.getMultipleStocks(symbols);

      const analysis = await aiService.getPortfolioAnalysis(portfolio, stockData);
      res.json({ analysis });
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ message: "Failed to analyze portfolio" });
    }
  });

  // Get investment education on specific topics
  app.get("/api/ai/learn/:topic", async (req, res) => {
    try {
      const { topic } = req.params;
      const decodedTopic = decodeURIComponent(topic);
      
      const education = await aiService.getInvestmentEducation(decodedTopic);
      res.json({ education });
    } catch (error) {
      console.error("AI education error:", error);
      res.status(500).json({ message: "Failed to get educational content" });
    }
  });

  // Get market education
  app.get("/api/ai/market-education", async (req, res) => {
    try {
      const education = await aiService.getMarketEducation();
      res.json({ education });
    } catch (error) {
      console.error("Market education error:", error);
      res.status(500).json({ message: "Failed to get market education" });
    }
  });

  // Get recent transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || null; // No default limit
      
      // First try to fetch from Flask backend for real portfolio transactions
      try {
        console.log('🔍 Attempting to fetch transactions from Flask backend...');
        const response = await fetch(`http://localhost:8000/api/transactions`);
        
        if (response.ok) {
          const transactions = await response.json();
          console.log(`✅ Fetched ${transactions.length} transactions from Flask backend`);
          
          // Apply limit only if explicitly specified
          const limitedTransactions = limit ? transactions.slice(0, limit) : transactions;
          return res.json(limitedTransactions);
        } else {
          console.log(`❌ Flask backend returned ${response.status} for transactions`);
        }
      } catch (flaskError) {
        console.log('⚠️ Flask backend error for transactions:', (flaskError as Error).message);
      }

      // Fallback to mock data if Flask backend is not available
      console.log('🔄 Using fallback transaction data');
      const userId = DEFAULT_USER_ID;
      const transactions = await storage.getUserTransactions(userId, limit || 10);
      res.json(transactions);
    } catch (error) {
      console.error("Transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get chat history
  app.get("/api/chat/history", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const chatHistory = await storage.getUserChatHistory(userId, limit);
      res.json(chatHistory);
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Export transactions - integrates with Flask backend
  app.get("/api/export/transactions", async (req, res) => {
    try {
      // First try to fetch from Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/export/transactions');
        if (response.ok) {
          const exportData = await response.json();
          return res.json(exportData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available for export transactions, using fallback');
      }

      // Fallback to mock data if Flask backend is not available
      const userId = DEFAULT_USER_ID;
      const transactions = await storage.getUserTransactions(userId);
      
      const formattedTransactions = transactions.map(t => ({
        id: t.id,
        symbol: t.symbol,
        companyName: t.companyName,
        sector: 'Technology', // Mock sector
        industry: 'Software', // Mock industry
        quantity: t.shares,
        price: parseFloat(t.price),
        type: t.type.toUpperCase(),
        date: t.date,
        totalAmount: parseFloat(t.totalAmount)
      }));

      res.json({
        success: true,
        data: formattedTransactions,
        count: formattedTransactions.length,
        exportDate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Export transactions error:", error);
      res.status(500).json({ error: "Failed to export transactions" });
    }
  });

  // Export holdings - integrates with Flask backend
  app.get("/api/export/holdings", async (req, res) => {
    try {
      // First try to fetch from Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/export/holdings');
        if (response.ok) {
          const exportData = await response.json();
          return res.json(exportData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available for export holdings, using fallback');
      }

      // Fallback to mock data if Flask backend is not available
      const userId = DEFAULT_USER_ID;
      const portfolio = await storage.getUserPortfolio(userId);
      const symbols = portfolio.map(p => p.symbol);
      const stockData = await stockService.getMultipleStocks(symbols);
      
      const formattedHoldings = portfolio.map(position => {
        const currentStock = stockData.find(s => s.symbol === position.symbol);
        const currentPrice = currentStock?.price || parseFloat(position.averagePrice);
        const quantity = position.shares;
        const avgPrice = parseFloat(position.averagePrice);
        const marketValue = currentPrice * quantity;
        const costBasis = avgPrice * quantity;
        const gainLoss = marketValue - costBasis;
        const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis * 100) : 0;

        return {
          symbol: position.symbol,
          name: position.companyName,
          sector: 'Technology', // Mock sector
          industry: 'Software', // Mock industry
          quantity: quantity,
          avgPrice: avgPrice,
          currentPrice: currentPrice,
          marketValue: marketValue,
          costBasis: costBasis,
          gainLoss: gainLoss,
          gainLossPercent: gainLossPercent
        };
      });

      const totalValue = formattedHoldings.reduce((sum, h) => sum + h.marketValue, 0);
      const totalCost = formattedHoldings.reduce((sum, h) => sum + h.costBasis, 0);
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost * 100) : 0;

      res.json({
        success: true,
        data: formattedHoldings,
        summary: {
          totalValue: totalValue,
          totalCost: totalCost,
          totalGainLoss: totalGainLoss,
          totalGainLossPercent: totalGainLossPercent,
          numberOfPositions: formattedHoldings.length,
          exportDate: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Export holdings error:", error);
      res.status(500).json({ error: "Failed to export holdings" });
    }
  });

  // Export full portfolio - integrates with Flask backend
  app.get("/api/export/full-portfolio", async (req, res) => {
    try {
      // First try to fetch from Flask backend
      try {
        const response = await fetch('http://localhost:8000/api/export/full-portfolio');
        if (response.ok) {
          const exportData = await response.json();
          return res.json(exportData);
        }
      } catch (flaskError) {
        console.log('Flask backend not available for full portfolio export, using fallback');
      }

      // Fallback to mock data if Flask backend is not available
      const userId = DEFAULT_USER_ID;
      const user = await storage.getUser(userId);
      const portfolio = await storage.getUserPortfolio(userId);
      const transactions = await storage.getUserTransactions(userId);
      
      // This would be a simplified version - in practice you'd want to implement
      // the full portfolio analytics logic here
      res.json({
        success: true,
        message: "Full portfolio export not available in fallback mode",
        exportDate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Full portfolio export error:", error);
      res.status(500).json({ error: "Failed to export full portfolio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

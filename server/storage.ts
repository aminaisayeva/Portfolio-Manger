import { 
  type User, 
  type InsertUser, 
  type Portfolio, 
  type InsertPortfolio,
  type Transaction,
  type InsertTransaction,
  type ChatMessage,
  type InsertChatMessage,
  type StockData,
  type PortfolioSummary,
  type MarketIndex
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCashBalance(userId: string, newBalance: number): Promise<void>;

  // Portfolio methods
  getUserPortfolio(userId: string): Promise<Portfolio[]>;
  getPortfolioPosition(userId: string, symbol: string): Promise<Portfolio | undefined>;
  createPortfolioPosition(position: InsertPortfolio): Promise<Portfolio>;
  updatePortfolioPosition(userId: string, symbol: string, shares: number, averagePrice: number): Promise<void>;
  deletePortfolioPosition(userId: string, symbol: string): Promise<void>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;

  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private portfolios: Map<string, Portfolio>;
  private transactions: Map<string, Transaction>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.transactions = new Map();
    this.chatMessages = new Map();

    // Create a default user for demo
    const defaultUser: User = {
      id: "default-user",
      username: "demo",
      password: "demo",
      cashBalance: "12543.75"
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create some default portfolio positions
    const defaultPositions: Portfolio[] = [
      {
        id: "pos-1",
        userId: "default-user",
        symbol: "AAPL",
        companyName: "Apple Inc.",
        shares: 25,
        averagePrice: "173.03",
        createdAt: new Date()
      },
      {
        id: "pos-2",
        userId: "default-user",
        symbol: "TSLA",
        companyName: "Tesla Inc.",
        shares: 15,
        averagePrice: "216.52",
        createdAt: new Date()
      },
      {
        id: "pos-3",
        userId: "default-user",
        symbol: "AMZN",
        companyName: "Amazon Inc.",
        shares: 18,
        averagePrice: "158.69",
        createdAt: new Date()
      }
    ];

    defaultPositions.forEach(position => {
      this.portfolios.set(position.id, position);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, cashBalance: "10000.00" };
    this.users.set(id, user);
    return user;
  }

  async updateUserCashBalance(userId: string, newBalance: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.cashBalance = newBalance.toFixed(2);
      this.users.set(userId, user);
    }
  }

  async getUserPortfolio(userId: string): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(
      (position) => position.userId === userId
    );
  }

  async getPortfolioPosition(userId: string, symbol: string): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(
      (position) => position.userId === userId && position.symbol === symbol
    );
  }

  async createPortfolioPosition(insertPosition: InsertPortfolio): Promise<Portfolio> {
    const id = randomUUID();
    const position: Portfolio = { 
      ...insertPosition, 
      id, 
      createdAt: new Date(),
      averagePrice: insertPosition.averagePrice.toString()
    };
    this.portfolios.set(id, position);
    return position;
  }

  async updatePortfolioPosition(userId: string, symbol: string, shares: number, averagePrice: number): Promise<void> {
    const position = await this.getPortfolioPosition(userId, symbol);
    if (position) {
      position.shares = shares;
      position.averagePrice = averagePrice.toFixed(2);
      this.portfolios.set(position.id, position);
    }
  }

  async deletePortfolioPosition(userId: string, symbol: string): Promise<void> {
    const position = await this.getPortfolioPosition(userId, symbol);
    if (position) {
      this.portfolios.delete(position.id);
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date(),
      price: insertTransaction.price.toString(),
      totalAmount: insertTransaction.totalAmount.toString()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    return userTransactions.slice(0, limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getUserChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const userMessages = Array.from(this.chatMessages.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
    
    return userMessages.slice(-limit);
  }
}

export const storage = new MemStorage();

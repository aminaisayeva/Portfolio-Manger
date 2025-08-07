# Portfolio Management Platform

A comprehensive stock portfolio management platform with real-time market data, AI-powered insights, and professional trading capabilities.

## 🏗️ Architecture Overview

This application uses a modern full-stack architecture with three main components:

### 1. **React Frontend** (Port 5000)
- **Framework**: React with TypeScript, Vite build tool
- **UI**: Shadcn/ui components with dark theme design
- **State**: TanStack Query for server state management
- **Features**: Dashboard, Portfolio view, Trading center, Analytics, AI chatbot

### 2. **Flask Backend** (Port 8080)
- **Framework**: Python Flask with CORS enabled
- **Data**: MySQL integration using yfinance for real stock prices
- **APIs**: Portfolio data (`/api/portfolio`) and trading (`/api/trade`)
- **Functions**:   original `get_portfolio()` and `handle_trade()` code

### 3. **MySQL Database**
- **Schema**: Complete portfolio management tables with triggers
- **Tables**: `portfolio_item`, `portfolio_transaction`, `cash_account`, `stock_price_history`
- **Features**: Automatic portfolio recalculation, trade validation, daily snapshots

## 🔄 Component Interactions

```
┌─────────────────┐    HTTP API     ┌─────────────────┐    MySQL      ┌─────────────────┐
│                 │   (Port 8080)   │                 │  Queries      │                 │
│  React Frontend ├────────────────►│  Flask Backend  ├──────────────►│ MySQL Database  │
│   (Port 5000)   │                 │   (Port 8080)   │               │                 │
│                 │◄────────────────┤                 │◄──────────────┤                 │
└─────────────────┘   JSON Data     └─────────────────┘   Real Data   └─────────────────┘
```

### Data Flow:
1. **Frontend** makes API calls every 30 seconds to `/api/portfolio`
2. **Flask Backend** calls   `get_portfolio()` function
3. **Database** queries execute with real-time yfinance stock prices
4. **JSON Response** flows back through Flask to React components
5. **Trading** follows the same pattern through `/api/trade` endpoint

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (for React frontend)
- Python 3.8+ (for Flask backend)
- MySQL Server running locally
- MySQL root access with password

### 1. Setup Database
```bash
# Start MySQL service
sudo service mysql start

# Create database and tables
mysql -u root -p 

source C:/.../master.sql

```

### 2. Setup Flask Backend
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment (make the file yourself if needed)
cp .env
# Edit .env and add: DB_PASSWORD= _mysql_password

# Start Flask server
python app.py
```
✅ **Backend will be running on**: `http://localhost:8080`

### 3. Setup React Frontend
```bash
# Install Node.js dependencies (from root directory)
npm install

# Start React development server
npm run dev
```
✅ **Frontend will be running on**: `http://localhost:5000`

## 📊 Features & Functionality

### Dashboard
- Real-time portfolio value and profit/loss tracking
- Market overview with trending stocks and indices
- Portfolio performance history with interactive charts
- Best performing stock highlights

### Portfolio Management
- Complete holdings view with current market prices
- Cost basis and weighted average price calculations
- Individual stock performance metrics
- Asset allocation visualization

### Trading Center
- Buy/sell stock functionality
- Real-time price fetching using yfinance
- Trade validation (insufficient funds/shares prevention)
- Transaction history tracking

### Analytics Dashboard
- Portfolio performance metrics and trends
- Profit/loss analysis over time
- Monthly growth rate calculations
- Historical value tracking with 90-day charts

### AI Financial Advisor
- Contextual portfolio insights using OpenAI GPT-4o
- Personalized investment recommendations
- Chat interface with conversation history
- Real-time market analysis integration

## 🔧 Technical Details

### Database Schema
  original MySQL schema includes:
- **Automatic triggers** for portfolio recalculation after trades
- **Stored procedures** for daily snapshots and holdings updates
- **Foreign key constraints** ensuring data integrity
- **Overdraft/oversell protection** built into the database layer

### API Endpoints
- `GET /api/portfolio` - Returns complete portfolio data
- `POST /api/trade` - Processes buy/sell transactions
- `POST /api/add-funds` - Adds funds to the cash balance
- `GET /api/market` - Market data and trending stocks
- `POST /api/ai/chat` - AI advisor interactions

### Real-time Data
- **Stock prices** fetched live using yfinance Python library
- **Market data** updates every 30 seconds automatically
- **Portfolio values** calculated with current market prices
- **Trade execution** uses real-time prices for accuracy

## 🛠️ Development Notes

### File Structure
```
portfolio-manager/
├── README.md                 # This file
├── backend/                  # Flask backend with   original code
│   ├── app.py               #   get_portfolio() and handle_trade()
│   ├── schema.sql           #   database tables and triggers
│   └── sample_data.sql      #   sample portfolio data
├── client/                   # React frontend
│   └── src/pages/           # Dashboard, Portfolio, Trading, Analytics
├── server/                   # Node.js middleware layer
└── package.json             # Frontend dependencies
```

### Environment Variables
- **Backend**: `DB_PASSWORD` in `backend/.env`
- **Frontend**: Automatically configured for localhost development
- **Ports**: Frontend (5000), Backend (8080), MySQL (3306)

## 🎯 Integration Success

  existing Flask functions work exactly as provided:
- ✅ `get_portfolio()` returns real portfolio data
- ✅ `handle_trade()` processes actual buy/sell transactions  
- ✅ MySQL schema preserved with all triggers and procedures
- ✅ yfinance integration provides live stock prices
- ✅ No modifications to   original SQL files or core logic

The React frontend displays   actual portfolio data (currently showing values around $22,900+) and all trading operations go through   existing MySQL database with real market prices.
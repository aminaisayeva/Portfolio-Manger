# ThemisTrends - Portfolio Management System

A comprehensive portfolio management and trading platform built with React, TypeScript, and Flask. ThemisTrends provides real-time market data, portfolio tracking, trading capabilities, and advanced analytics.

## 🚀 Features

### Core Functionality
- **Portfolio Management**: Track holdings, gains/losses, and portfolio performance
- **Real-time Trading**: Buy and sell stocks with live market data
- **Market Data**: Real-time stock prices, market indices, and economic indicators
- **Advanced Analytics**: Performance metrics, sector allocation, and correlation analysis
- **Transaction History**: Complete trading history with filtering and pagination

### Key Features
- **Real-time Data**: Live stock prices via yfinance API
- **Portfolio Analytics**: Sharpe ratio, beta, volatility, and alpha calculations
- **Market Overview**: S&P 500, NASDAQ, Dow Jones, and Russell 2000 tracking
- **Economic Indicators**: Treasury yields, commodities, and currency data
- **Sector Performance**: Real-time sector ETF performance tracking
- **Responsive Design**: Mobile-friendly interface with modern UI

## 🏗️ Project Structure

```
portfolio_manager_team15/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── portfolio/           # Portfolio-specific components
│   │   │   └── ui/                  # Reusable UI components
│   │   ├── pages/                   # Main application pages
│   │   ├── hooks/                   # Custom React hooks
│   │   └── lib/                     # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── backend/                         # Flask API server
│   ├── app.py                       # Main Flask application
│   ├── crud.py                      # Database operations
│   ├── math_operations.py           # Financial calculations
│   ├── requirements.txt
│   └── db/                          # Database schema and data
├── server/                          # Additional server components
└── shared/                          # Shared TypeScript types
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Flask** Python web framework
- **MySQL** database
- **yfinance** for market data
- **requests-cache** for API caching

### Database
- **MySQL** with custom schema
- Portfolio items, transactions, and cash balance tracking

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MySQL** database server
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd portfolio_manager_team15
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Database Setup
1. Create a MySQL database named `portfolio_manager`
2. Set up your database credentials in a `.env` file:
```env
DB_PASSWORD=your_mysql_password
```

3. Initialize the database:
```bash
# Run the database initialization scripts
mysql -u root -p portfolio_manager < db/master.sql
```

#### Start the Flask Server
```bash
python app.py
```
The backend will run on `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
npm install
```

#### Start the Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5000`

## 📊 Database Schema

### Key Tables
- **portfolio_item**: Current holdings with prices and quantities
- **portfolio_transaction**: Complete transaction history
- **cash_account**: Cash balance management
- **portfolio_history**: Historical portfolio values

### Sample Data
The system comes pre-loaded with:
- Initial $25,000 cash balance
- Sample stock holdings (AAPL, AMZN, GOOGL, etc.)
- Historical transaction data

## 🎯 Usage Guide

### Dashboard
- **Portfolio Overview**: Total value, gains/losses, cash balance
- **Performance Metrics**: Realized and unrealized gains
- **Portfolio Chart**: Historical performance visualization
- **Quick Actions**: Buy/sell stocks, add funds

### Portfolio Page
- **Holdings List**: All current positions with real-time prices
- **Search & Filter**: Find specific holdings
- **Sort Options**: Sort by value, gain/loss, shares, or symbol
- **Pagination**: View 10 holdings per page
- **Trading Actions**: Buy or sell directly from holdings

### Trading Center
- **Transaction History**: Complete buy/sell history
- **Trading Metrics**: Capital deployed, realized gains, activity stats
- **Filtering**: Search by symbol, filter by transaction type and date
- **Pagination**: Navigate through transaction history

### Analytics
- **Performance Metrics**: Total return, Sharpe ratio, portfolio beta, volatility, alpha
- **Sector Allocation**: Visual breakdown of portfolio by sector
- **Correlation Matrix**: Asset correlation analysis
- **Timeframe Selection**: 1M, 3M, 6M, 1Y, or all-time analysis

### Market Page
- **Market Indices**: S&P 500, NASDAQ, Dow Jones, Russell 2000
- **Market Performance**: Intraday performance charts
- **Economic Indicators**: Treasury yields, commodities, currency data
- **Sector Performance**: Real-time sector ETF tracking

## 🔧 API Endpoints

### Portfolio Management
- `GET /api/portfolio` - Get portfolio data and holdings
- `POST /api/add-funds` - Add funds to cash account
- `POST /api/buy-stock` - Buy stock shares
- `POST /api/sell-stock` - Sell stock shares

### Market Data
- `GET /api/market_movers` - Major market indices
- `GET /api/stocks/<symbol>` - Individual stock data
- `GET /api/market_performance` - Intraday performance
- `GET /api/sector_performance` - Sector ETF data
- `GET /api/economic_indicators` - Economic indicators

### Transactions
- `GET /api/transactions` - Transaction history

## 🎨 UI Components

### Reusable Components
- **Navigation**: Header with logo and navigation links
- **Cards**: Consistent card layouts for data display
- **Charts**: Line charts, bar charts, pie charts for analytics
- **Modals**: Buy/sell modals, add funds modal
- **Tables**: Sortable data tables with pagination

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Gradients**: Purple and green gradient themes
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Built-in dark theme support

## 🔄 Data Flow

1. **Real-time Updates**: yfinance API provides live market data
2. **Caching**: requests-cache reduces API calls and improves performance
3. **State Management**: TanStack Query handles server state and caching
4. **Database**: MySQL stores portfolio data and transaction history
5. **Calculations**: Backend handles complex financial calculations

## 🚨 Error Handling

- **API Failures**: Graceful fallbacks for market data
- **Database Errors**: Proper error messages and logging
- **Network Issues**: Retry mechanisms and offline indicators
- **Invalid Data**: Input validation and error boundaries

## 🔒 Security Considerations

- **Input Validation**: All user inputs are validated
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Sensitive data stored in .env files

## 📈 Performance Optimizations

- **API Caching**: 24-hour cache for market data
- **Pagination**: Large datasets split into manageable chunks
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized icons and assets

## 🧪 Testing

### Manual Testing Checklist
- [ ] Portfolio data loads correctly
- [ ] Buy/sell transactions work
- [ ] Market data updates in real-time
- [ ] Analytics calculations are accurate
- [ ] Mobile responsiveness
- [ ] Error handling works properly

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MySQL connection and credentials
- Ensure all Python dependencies are installed
- Verify .env file exists with correct database password

**Frontend won't load:**
- Check if backend is running on port 8000
- Verify all npm dependencies are installed
- Check browser console for errors

**Market data not updating:**
- Check yfinance API status
- Verify internet connection
- Check cache settings in backend

**Database errors:**
- Ensure MySQL server is running
- Verify database schema is properly initialized
- Check database user permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


# ThemisTrends - Portfolio Management System

A full-stack portfolio management and trading platform that gives you real-time market data, portfolio tracking, and advanced analytics. Built with React, TypeScript, and Flask, it's designed to be both powerful and user-friendly.

## What's Inside

### Core Features
- **Portfolio Management**: Keep track of your holdings, gains/losses, and overall performance
- **Live Trading**: Buy and sell stocks with real-time market data
- **Market Data**: Get live stock prices, market indices, and economic indicators
- **Analytics**: Deep dive into performance metrics, sector allocation, and correlations
- **Transaction History**: Complete trading history with search and filtering
- **AI Assistant**: Get intelligent insights and recommendations for your portfolio

### Key Highlights
- Real-time data from Yahoo Finance
- Advanced portfolio analytics (Sharpe ratio, beta, volatility, alpha)
- Market overview with S&P 500, NASDAQ, Dow Jones, and Russell 2000
- Economic indicators and sector performance tracking
- Mobile-responsive design that works on any device
- Dark and light mode themes
- Real-time notifications and alerts

## Project Structure

We've built this with a dual-backend approach - you can use either Python/Flask or Node.js/Express:

```
portfolio_manager_team15/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── portfolio/           # Portfolio-specific components
│   │   │   │   ├── portfolio-header.tsx
│   │   │   │   ├── portfolio-chart.tsx
│   │   │   │   ├── holdings-list.tsx
│   │   │   │   ├── buy-sell-modal.tsx
│   │   │   │   ├── add-funds-modal.tsx
│   │   │   │   ├── ai-chat-modal.tsx
│   │   │   │   └── recent-transactions.tsx
│   │   │   └── ui/                  # Reusable UI components
│   │   ├── pages/                   # Main app pages
│   │   │   ├── dashboard.tsx        # Main dashboard
│   │   │   ├── portfolio.tsx        # Portfolio management
│   │   │   ├── trading.tsx          # Trading interface
│   │   │   ├── analytics.tsx        # Advanced analytics
│   │   │   ├── market.tsx           # Market overview
│   │   │   └── settings.tsx         # User settings
│   │   ├── hooks/                   # Custom React hooks
│   │   └── lib/                     # Utilities
│   ├── index.html
│   └── package.json
├── backend/                         # Python Flask API
│   ├── app.py                       # Main Flask app
│   ├── crud.py                      # Database operations
│   ├── math_operations.py           # Financial calculations
│   ├── initialize_portfolio.py      # Portfolio setup
│   ├── requirements.txt
│   ├── yfinance_cache.sqlite        # Market data cache
│   └── db/                          # Database files
│       ├── schema.sql               # Database schema
│       ├── data.sql                 # Sample data
│       ├── procedures.sql           # Stored procedures
│       ├── triggers.sql             # Database triggers
│       └── scheduler.sql            # Scheduled tasks
├── server/                          # Node.js backend (optional)
│   ├── index.ts                     # Main server
│   ├── routes.ts                    # API routes
│   ├── db.ts                        # Database connection
│   ├── storage.ts                   # Data storage
│   └── services/                    # Business logic
│       ├── stock-service.ts         # Stock data
│       └── ai-service.ts            # AI chat
├── shared/                          # Shared types
│   └── schema.ts                    # Database types
├── package.json                     # Main package.json
├── vite.config.ts                   # Vite config
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
└── drizzle.config.ts                # Database ORM config
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- TanStack Query for data fetching and caching
- Recharts for beautiful data visualizations
- Tailwind CSS for styling
- shadcn/ui for consistent UI components
- Lucide React for icons
- Framer Motion for smooth animations
- React Hook Form for form handling
- Zod for validation

### Backend (Python/Flask)
- Flask 2.3.3 for the web framework
- MySQL database with custom schema
- yfinance for real-time market data
- requests-cache for API caching
- pandas for data manipulation
- Flask-CORS for cross-origin requests

### Backend (Node.js/Express) - Optional
- Express.js web framework
- Drizzle ORM for database operations
- OpenAI API for AI chat functionality
- WebSocket for real-time updates
- Passport.js for authentication

### Database
- MySQL with comprehensive schema
- SQLite for caching market data
- PostgreSQL support via Drizzle ORM

## Getting Started

### Prerequisites
You'll need:
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MySQL database server (v8.0 or higher)
- Git
- npm or yarn

### Installation

1. **Clone the repo**
```bash
git clone <repository-url>
cd portfolio_manager_team15
```

2. **Set up the Python backend**
```bash
cd backend
pip install -r requirements.txt
```

3. **Set up the database**
First, create a MySQL database named `portfolio_manager`, then create a `.env` file:
```env
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_USER=root
DB_NAME=portfolio_manager
```

Initialize the database:
```bash
mysql -u root -p portfolio_manager < db/master.sql
mysql -u root -p portfolio_manager < db/schema.sql
mysql -u root -p portfolio_manager < db/data.sql
mysql -u root -p portfolio_manager < db/procedures.sql
mysql -u root -p portfolio_manager < db/triggers.sql
```

4. **Start the Flask server**
```bash
python app.py
```
The backend will run on `http://localhost:8000`

5. **Set up the frontend**
```bash
npm install
```

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:3000
```

6. **Start the development server**
```bash
npm run dev
```
The frontend will run on `http://localhost:5000`

### Optional: Node.js Backend
If you want to use the Node.js backend instead:
```bash
npm install
export DATABASE_URL="your_database_url"
export OPENAI_API_KEY="your_openai_api_key"
npm run dev
```

## Database Schema

### Main Tables
- `portfolio_item`: Your current holdings with prices and quantities
- `portfolio_transaction`: Complete transaction history
- `cash_account`: Cash balance management
- `portfolio_history`: Historical portfolio values
- `market_data`: Cached market data
- `user_settings`: Your preferences and settings

### Sample Data
The system comes with:
- $25,000 starting cash balance
- Sample holdings (AAPL, AMZN, GOOGL, MSFT, TSLA)
- Historical transaction data
- Market indices data

## How to Use

### Dashboard
The main dashboard gives you a quick overview of your portfolio:
- Total portfolio value and gains/losses
- Cash balance
- Portfolio performance chart
- Quick actions for buying/selling
- AI chat for insights

### Portfolio Page
Manage your holdings:
- See all your current positions with live prices
- Search and filter holdings by symbol or company name
- Sort by value, gain/loss, shares, or symbol
- Pagination for large portfolios
- Buy or sell directly from the holdings list
- Portfolio summary with key metrics

### Trading Center
Track your trading activity:
- Complete transaction history with advanced filtering
- Trading metrics and statistics
- Search by symbol, filter by transaction type and date
- Export your transaction data
- Pagination for large transaction histories

### Analytics
Deep dive into your portfolio performance:
- Performance metrics (total return, Sharpe ratio, beta, volatility, alpha)
- Sector allocation breakdown
- Correlation analysis between assets
- Timeframe selection (1M, 3M, 6M, 1Y, all-time)
- Risk analysis and VaR calculations
- Performance attribution

### Market Page
Stay on top of the markets:
- Major indices (S&P 500, NASDAQ, Dow Jones, Russell 2000)
- Intraday performance charts
- Economic indicators and commodities
- Sector performance tracking
- Real-time market clock
- Market news and updates

### Settings
Customize your experience:
- Theme preferences (dark/light mode)
- Notification settings
- Account management
- API configuration
- Data export/import

## API Endpoints

### Portfolio Management
- `GET /api/portfolio` - Get your portfolio data and holdings
- `POST /api/add-funds` - Add money to your cash account
- `POST /api/buy-stock` - Buy stock shares
- `POST /api/sell-stock` - Sell stock shares
- `POST /api/trade` - Generic trade endpoint

### Market Data
- `GET /api/market_movers` - Major market indices
- `GET /api/stocks/<symbol>` - Individual stock data
- `GET /api/market_performance` - Intraday performance
- `GET /api/sector_performance` - Sector ETF data
- `GET /api/economic_indicators` - Economic indicators

### Transactions
- `GET /api/transactions` - Your transaction history with filtering

### AI Services
- `POST /api/ai/chat` - Chat with the AI assistant
- `GET /api/ai/insights` - Get portfolio insights

## UI Components

We use shadcn/ui for consistent, beautiful components:
- Navigation with logo and links
- Cards for data display
- Charts for analytics
- Modals for trading and settings
- Tables with sorting and pagination
- Forms with validation
- Buttons and tooltips

### Portfolio Components
- PortfolioHeader: Summary and quick actions
- PortfolioChart: Performance visualization
- HoldingsList: Current holdings with trading
- BuySellModal: Stock trading interface
- AddFundsModal: Cash deposit
- AIChatModal: AI-powered insights
- RecentTransactions: Latest activity

## Data Flow

Here's how everything works together:
1. Yahoo Finance provides real-time market data
2. We cache API calls to improve performance
3. TanStack Query manages server state and caching
4. MySQL stores your portfolio data and transactions
5. The backend handles complex financial calculations
6. OpenAI provides intelligent insights
7. WebSockets enable real-time updates

## Error Handling

We've built robust error handling:
- Graceful fallbacks when market data fails
- Clear error messages and logging
- Retry mechanisms for network issues
- Input validation and error boundaries
- Toast notifications for user feedback

## Security

Security is a priority:
- All inputs are validated with Zod
- SQL injection prevention with parameterized queries
- Proper CORS configuration
- Environment variables for sensitive data
- API rate limiting
- XSS prevention

## Performance

We've optimized for speed:
- 24-hour cache for market data
- Pagination for large datasets
- Lazy loading for components
- Optimized assets and icons
- Code splitting for better loading
- Memoization for expensive calculations

## Testing

### Manual Testing
Before deploying, test:
- Portfolio data loading
- Buy/sell transactions
- Real-time market updates
- Analytics calculations
- Mobile responsiveness
- Error handling
- AI chat functionality
- Theme switching
- Search and filtering
- Pagination

### Future Testing
We plan to add:
- Unit tests for components
- Integration tests for APIs
- End-to-end tests
- Performance testing

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check MySQL connection
mysql -u root -p -e "SHOW DATABASES;"

# Verify Python dependencies
pip list | grep -E "(Flask|mysql-connector|yfinance)"

# Check environment variables
echo $DB_PASSWORD
```

**Frontend won't load:**
```bash
# Check if backend is running
curl http://localhost:8000/api/portfolio

# Verify npm dependencies
npm list --depth=0

# Check browser console for errors
```

**Market data not updating:**
```bash
# Check yfinance API
python -c "import yfinance as yf; print(yf.Ticker('AAPL').info['regularMarketPrice'])"

# Clear cache
rm backend/yfinance_cache.sqlite

# Check internet connection
ping api.yahoo.com
```

**Database errors:**
```bash
# Check MySQL status
sudo systemctl status mysql

# Verify database exists
mysql -u root -p -e "USE portfolio_manager; SHOW TABLES;"

# Check user permissions
mysql -u root -p -e "SHOW GRANTS FOR 'your_user'@'localhost';"
```

### Performance Issues
- Clear browser cache and cookies
- Restart development servers
- Check for memory leaks
- Monitor API response times

## Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use consistent code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## License

This project is licensed under the MIT License.

## Acknowledgments

Thanks to:
- Yahoo Finance for market data
- shadcn/ui for beautiful components
- Tailwind CSS for styling
- React Query for data fetching
- Recharts for visualizations

## Support

Need help?
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**Built by Team 15**


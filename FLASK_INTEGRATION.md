# Flask Backend Integration Guide

## Overview
  Flask backend with MySQL and yfinance integration is now compatible with the React frontend. The frontend has been adapted to work with   backend's API structure.

## Backend Setup (Flask)  
  Flask backend should be running on `http://localhost:8080` with the following endpoints:

**Important**:   Flask backend must run on port 8080, while the React frontend runs on port 5000 (Replit's default).

### Required Endpoints
1. **Portfolio Data** - `GET /api/portfolio`
   - Returns: `{ totalValue, profitLoss, monthlyGrowth, assets, history, bestToken }`
   - Frontend expects: `assets` array with fields: `symbol`, `name`, `price`, `change`, `volume`, `weighted_buy_price`
   - Example response from   backend:
   ```json
   {
     "totalValue": 23014.4,
     "profitLoss": 2847.2,
     "monthlyGrowth": 5.2,
     "assets": [
       {
         "symbol": "AAPL",
         "name": "Apple Inc.", 
         "price": 175.43,
         "change": 2.3,
         "volume": 50,
         "weighted_buy_price": 165.20
       }
     ],
     "history": [
       { "date": "2025-06-01", "value": 20000 },
       { "date": "2025-06-02", "value": 20150 }
     ],
     "bestToken": { "symbol": "AAPL", "name": "Apple Inc.", "price": 175.43, "change": 2.3, "volume": 50, "weighted_buy_price": 165.20 }
   }
   ```

2. **Trading** - `POST /api/trade` 
   - Accepts: `{ symbol, amount, trade_type, date }`
   - Integrates with   `handle_trade(symbol, amount, trade_type, date)` function
   - Example request:
   ```json
   {
     "symbol": "AAPL",
     "amount": 10,
     "trade_type": "BUY",
     "date": "2025-08-06"
   }
   ```

## Frontend Adaptations Made

### Field Mappings
The frontend now uses   Flask backend field names:
- `company_name` instead of `companyName`
- `volume` instead of `shares`
- `weighted_buy_price` instead of `avgCost`
- `change` (percentage) instead of separate gain/loss fields
- `price` for current market price

### Pages Updated
1. **Dashboard** (`/`) - Shows portfolio overview with   real data
2. **Portfolio** (`/portfolio`) - Detailed holdings view with sorting/filtering
3. **Analytics** (`/analytics`) - Top/underperformers based on   holdings

## Running Both Together

### Option 1: Add Endpoints to   Existing Flask App
Copy the endpoints from `flask_endpoints.py` into   existing Flask application and add CORS support:

```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:3000"])
```

### Option 2: Run as Separate Flask App
1. **Start   Flask Backend:**
   ```bash
   cd  -flask-directory
   python flask_endpoints.py  # The file I created for you
   ```
   Backend runs on: `http://localhost:8080`

2. **Start React Frontend (in Replit):**
   ```bash
   npm run dev
   ```
   Frontend runs on: `http://localhost:5000` (Replit's default port)

The React frontend will automatically try to fetch data from   Flask backend on port 8080 every 30 seconds.

## CORS Configuration
Make sure   Flask app has CORS enabled for the frontend domain:
```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:3000"])  # Or   frontend port
```

## Missing Endpoints
The frontend expects these additional endpoints that may need to be implemented in   Flask backend:

1. **Trading** - `POST /api/trade` (for buy/sell functionality)
2. **Transactions** - `GET /api/transactions` (for trading history)
3. **AI Chat** - `POST /api/ai/chat` (for AI advisor feature)
4. **Stock Search** - `GET /api/stocks/search?q=AAPL` (for stock lookup)

## Data Flow
1. Frontend queries `/api/portfolio` every 30 seconds
2.   Flask backend fetches real-time data from yfinance
3. Frontend displays   actual portfolio holdings and performance
4. All calculations (profit/loss, percentages) use   backend logic

## Next Steps
1. Ensure Flask backend is running on port 5000
2. Test portfolio data displays correctly in frontend
3. Implement missing endpoints as needed for full functionality
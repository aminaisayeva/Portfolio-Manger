# Flask Backend for Portfolio Manager

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Setup Environment Variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add   MySQL password: DB_PASSWORD= _password
   ```

3. **Setup MySQL Database:**
   ```bash
   # Run these SQL files in order:
   mysql -u root -p < schema.sql        # Creates tables, triggers, procedures
   mysql -u root -p < sample_data.sql   # Inserts sample portfolio data
   ```

4. **Run the Flask Backend:**
   ```bash
   python app.py
   ```
   Backend will run on: `http://localhost:8080`

## API Endpoints

- `GET /api/portfolio` - Returns portfolio data for React frontend
- `POST /api/trade` - Handles buy/sell requests from React frontend

## Integration

This Flask backend connects to   existing MySQL database using:
- `portfolio_item` table for current holdings
- `portfolio_transaction` table for trades
- `yfinance` for real-time stock prices
-   existing `get_portfolio()` and `handle_trade()` functions

The React frontend on port 5000 will automatically fetch data from this backend on port 8080.
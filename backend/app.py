from flask import Flask, jsonify, request
from flask_cors import CORS
from initialize_portfolio import initialize_portfolio
from crud import get_portfolio as get_portfolio_items, handle_trade, get_cash_balance, add_funds

import requests_cache
import yfinance as yf

requests_cache.install_cache('yfinance_cache', expire_after=86400)
initialize_portfolio()
app = Flask(__name__)
CORS(app, origins=["http://localhost:5000"])

@app.route('/api/portfolio')
def get_portfolio():
    """API endpoint to get portfolio items with cash balance."""
    try:
        num_entries = int(request.args.get('numEntries', 5))
        order_by = request.args.get('orderBy', 'pi_id')
        portfolio_items = get_portfolio_items(order_by)

        # Cash balance is already included in the response from   fixed crud.py
        return jsonify(portfolio_items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/market_movers')
def get_market_movers():
    try:
        market_movers = {
            yf.Ticker("^GSPC").info.get('longName', 'S&P 500'): yf.Ticker("^GSPC").info['regularMarketChangePercent'],
            yf.Ticker("^DJI").info.get('longName', 'Dow Jones Industrial Average'): yf.Ticker("^DJI").info['regularMarketChangePercent'],
            yf.Ticker("^IXIC").info.get('longName', 'NASDAQ Composite'): yf.Ticker("^IXIC").info['regularMarketChangePercent'],
        }
        return jsonify(market_movers), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stocks/<symbol>')
def get_stock_data(symbol):
    """Get real-time stock data using yfinance."""
    try:
        ticker = yf.Ticker(symbol.upper())
        info = ticker.info
        
        # Get current price and previous close
        current_price = info.get('regularMarketPrice', 0)
        previous_close = info.get('regularMarketPreviousClose', current_price)
        change = current_price - previous_close
        change_percent = (change / previous_close * 100) if previous_close > 0 else 0
        
        stock_data = {
            "symbol": symbol.upper(),
            "companyName": info.get('longName', symbol.upper()),
            "price": round(current_price, 2),
            "change": round(change, 2),
            "changePercent": round(change_percent, 2),
            "volume": info.get('volume', 0),
            "marketCap": info.get('marketCap', 0)
        }
        
        return jsonify(stock_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch stock data for {symbol}: {str(e)}"}), 500

@app.route('/api/add-funds', methods=['POST'])
def add_funds_endpoint():
    """API endpoint to add funds to cash account -   EXACT TRANSACTION LOGIC."""
    try:
        data = request.get_json()
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
        
        # Use   exact add_funds function from crud.py
        result = add_funds(amount)
        
        if result:
            return jsonify({
                "message": f"Successfully added ${amount:.2f} to   account",
                "newBalance": result.get("new_balance", 0),
                "transactionId": result.get("transaction_id", "")
            }), 200
        else:
            return jsonify({"error": "Failed to add funds"}), 500
            
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/buy-stock', methods=['POST'])
def buy_stock():
    """API endpoint to buy stock."""
    try:
        data = request.get_json()
        symbol = data['symbol'].upper()
        quantity = int(data['quantity'])
        
        if quantity <= 0:
            return jsonify({"error": "Quantity must be positive"}), 400
        
        # Use   handle_trade function from crud.py
        handle_trade(symbol, quantity, 'BUY')
        
        return jsonify({
            "message": f"Successfully bought {quantity} shares of {symbol}",
            "symbol": symbol,
            "quantity": quantity
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sell-stock', methods=['POST'])
def sell_stock():
    """API endpoint to sell stock."""
    try:
        data = request.get_json()
        symbol = data['symbol'].upper()
        quantity = int(data['quantity'])
        
        if quantity <= 0:
            return jsonify({"error": "Quantity must be positive"}), 400
        
        # Use   handle_trade function from crud.py
        handle_trade(symbol, quantity, 'SELL')
        
        return jsonify({
            "message": f"Successfully sold {quantity} shares of {symbol}",
            "symbol": symbol,
            "quantity": quantity
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trade', methods=['POST'])
def trade():
    """Unified API endpoint for buying and selling stocks."""
    try:
        data = request.get_json()
        symbol = data.get('symbol', '').upper()
        amount = int(data.get('amount', 0))
        trade_type = data.get('trade_type', '').upper()
        
        if not symbol or amount <= 0 or trade_type not in ['BUY', 'SELL']:
            return jsonify({"error": "Invalid parameters. Required: symbol, amount, trade_type (BUY/SELL)"}), 400
        
        # Use the handle_trade function from crud.py
        handle_trade(symbol, amount, trade_type)
        
        return jsonify({
            "message": f"Successfully {trade_type.lower()}ed {amount} shares of {symbol}",
            "symbol": symbol,
            "quantity": amount,
            "type": trade_type
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Portfolio system initialized")
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False)
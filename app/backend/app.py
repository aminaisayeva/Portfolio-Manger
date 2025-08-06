from flask import Flask, jsonify, request
from flask_cors import CORS
from initialize_portfolio import initialize_portfolio
from crud import get_portfolio as get_portfolio_items, handle_trade

import requests_cache
import yfinance as yf

requests_cache.install_cache('yfinance_cache', expire_after=86400)
initialize_portfolio()
app = Flask(__name__)
CORS(app)

@app.route('/api/portfolio')
def get_portfolio():
    """API endpoint to get portfolio items."""
    try:
        num_entries = int(request.args.get('numEntries', 5))
        order_by = request.args.get('orderBy', 'pi_id')
        portfolio_items = get_portfolio_items(order_by)
        
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
    
@app.route('/api/trade', methods=['POST'])
def trade():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'message': 'Invalid JSON or missing content-type header'}), 400

        symbol = data.get('symbol')
        amount = data.get('amount')
        trade_type = data.get('type').upper()

        if not symbol or not amount or not trade_type:
            return jsonify({'message': 'Missing symbol, amount, or type in request'}), 400

        # Ensure amount is an integer
        amount = int(amount)

        # Handle the trade logic in a separate function
        handle_trade(symbol, amount, trade_type)
        return jsonify({'message': 'Trade executed successfully'}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 430

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

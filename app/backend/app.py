from flask import Flask, jsonify, request
from flask_cors import CORS
from initialize_portfolio import initialize_portfolio
from crud import get_portfolio as get_portfolio_items

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
        print("before")
        portfolio_items = get_portfolio_items(num_entries, order_by)
        print("after")
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

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)

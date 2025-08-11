# Flask Endpoints for React Frontend Integration
# Add these endpoints to  existing Flask app

from flask import Flask, jsonify, request
from flask_cors import CORS

from backend.app import get_portfolio
from backend.crud import handle_trade

# Import existing functions
# from  _existing_file import get_portfolio, handle_trade

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Allow frontend access

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio_endpoint():
    """
    Endpoint that calls   existing get_portfolio function
    and returns data in the format expected by the React frontend
    """
    try:
        # Call   existing get_portfolio function
        portfolio_data = get_portfolio('pi_total_quantity')  # or any orderBy you prefer
        
        # The data is already in the correct format from   get_portfolio function:
        # {
        #   "totalValue": float,
        #   "profitLoss": float, 
        #   "monthlyGrowth": float,
        #   "assets": [...],
        #   "history": [...],
        #   "bestToken": {...}
        # }
        
        return jsonify(portfolio_data)
        
    except Exception as e:
        print(f"Error fetching portfolio: {e}")
        return jsonify({
            "error": str(e),
            "totalValue": 0,
            "profitLoss": 0,
            "monthlyGrowth": 0,
            "assets": [],
            "history": [],
            "bestToken": None
        }), 500

@app.route('/api/trade', methods=['POST'])
def trade_endpoint():
    """
    Endpoint that calls   existing handle_trade function
    and processes buy/sell requests from the React frontend
    """
    try:
        data = request.get_json()
        
        # Extract data from request
        symbol = data.get('symbol')
        amount = data.get('amount')
        trade_type = data.get('trade_type')  # 'BUY' or 'SELL'
        date_str = data.get('date')  # YYYY-MM-DD format
        
        # Validate required fields
        if not symbol or not amount or not trade_type:
            return jsonify({"error": "Missing required fields: symbol, amount, trade_type"}), 400
            
        # Convert date string to datetime if provided
        trade_date = None
        if date_str:
            from datetime import datetime
            trade_date = datetime.strptime(date_str, '%Y-%m-%d')
        
        # Call   existing handle_trade function
        handle_trade(symbol, amount, trade_type, trade_date)
        
        return jsonify({
            "success": True,
            "message": f"Successfully {trade_type.lower()}ed {amount} shares of {symbol}",
            "data": {
                "symbol": symbol,
                "amount": amount,
                "trade_type": trade_type,
                "date": date_str
            }
        })
        
    except ValueError as e:
        # Handle business logic errors (insufficient funds, insufficient shares, etc.)
        return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        print(f"Trading error: {e}")
        return jsonify({"error": f"Failed to execute trade: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)
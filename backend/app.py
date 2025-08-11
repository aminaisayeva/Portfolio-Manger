from flask import Flask, jsonify, request
from flask_cors import CORS
from initialize_portfolio import initialize_portfolio
from crud import get_portfolio as get_portfolio_items, handle_trade, get_cash_balance, add_funds, get_connection
from datetime import datetime

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
        # Get S&P 500 data
        sp500 = yf.Ticker("^GSPC")
        sp500_info = sp500.info
        
        # Get Dow Jones data
        dow = yf.Ticker("^DJI")
        dow_info = dow.info
        
        # Get NASDAQ data
        nasdaq = yf.Ticker("^IXIC")
        nasdaq_info = nasdaq.info
        
        # Get Russell 2000 data
        russell = yf.Ticker("^RUT")
        russell_info = russell.info
        
        market_movers = {
            "S&P 500": {
                "name": "S&P 500",
                "symbol": "^GSPC",
                "value": round(sp500_info.get('regularMarketPrice', 0), 2),
                "change": round(sp500_info.get('regularMarketChange', 0), 2),
                "changePercent": round(sp500_info.get('regularMarketChangePercent', 0), 2),
                "volume": sp500_info.get('volume', 0)
            },
            "Dow Jones": {
                "name": "Dow Jones Industrial Average",
                "symbol": "^DJI",
                "value": round(dow_info.get('regularMarketPrice', 0), 2),
                "change": round(dow_info.get('regularMarketChange', 0), 2),
                "changePercent": round(dow_info.get('regularMarketChangePercent', 0), 2),
                "volume": dow_info.get('volume', 0)
            },
            "NASDAQ": {
                "name": "NASDAQ Composite",
                "symbol": "^IXIC",
                "value": round(nasdaq_info.get('regularMarketPrice', 0), 2),
                "change": round(nasdaq_info.get('regularMarketChange', 0), 2),
                "changePercent": round(nasdaq_info.get('regularMarketChangePercent', 0), 2),
                "volume": nasdaq_info.get('volume', 0)
            },
            "Russell 2000": {
                "name": "Russell 2000",
                "symbol": "^RUT",
                "value": round(russell_info.get('regularMarketPrice', 0), 2),
                "change": round(russell_info.get('regularMarketChange', 0), 2),
                "changePercent": round(russell_info.get('regularMarketChangePercent', 0), 2),
                "volume": russell_info.get('volume', 0)
            }
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
            "marketCap": info.get('marketCap', 0),
            "previousClose": info.get('regularMarketPreviousClose', 0),
            "dayLow": info.get("regularMarketDayLow", 0),
            "dayHigh": info.get("regularMarketDayHigh", 0)
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
        print("Buy stock endpoint called")
        data = request.get_json()
        print(f"Request data: {data}")
        
        symbol = data['symbol'].upper()
        quantity = int(data['quantity'])
        
        print(f"Processing buy: {quantity} shares of {symbol}")
        
        if quantity <= 0:
            return jsonify({"error": "Quantity must be positive"}), 400
        
        # Use handle_trade function from crud.py
        handle_trade(symbol, quantity, 'BUY')
        
        print(f"Successfully processed buy for {symbol}")
        
        return jsonify({
            "message": f"Successfully bought {quantity} shares of {symbol}",
            "symbol": symbol,
            "quantity": quantity
        }), 200
        
    except Exception as e:
        print(f"Error in buy_stock endpoint: {str(e)}")
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

@app.route('/api/transactions')
def get_transactions():
    """Get all portfolio transactions ordered by date (most recent first)."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get all transactions ordered by date (most recent first)
        cursor.execute("""
            SELECT 
                pt_id as id,
                pt_symbol as symbol,
                pt_name as companyName,
                pt_sector as sector,
                pt_industry as industry,
                pt_quantity as shares,
                pt_price as price,
                pt_type as type,
                pt_date as date,
                (pt_quantity * pt_price) as totalAmount
            FROM portfolio_transaction 
            ORDER BY pt_date DESC, pt_id DESC
        """)
        
        transactions = cursor.fetchall()
        
        # Convert to proper format for frontend
        formatted_transactions = []
        for transaction in transactions:
            formatted_transactions.append({
                "id": transaction['id'],
                "symbol": transaction['symbol'],
                "companyName": transaction['companyName'],
                "sector": transaction['sector'],
                "industry": transaction['industry'],
                "shares": transaction['shares'],
                "price": float(transaction['price']),
                "type": transaction['type'].lower(),  # Convert BUY/SELL to buy/sell
                "date": transaction['date'].strftime('%Y-%m-%d') if transaction['date'] else None,
                "timestamp": transaction['date'].strftime('%Y-%m-%d %H:%M:%S') if transaction['date'] else None,
                "totalAmount": float(transaction['totalAmount'])
            })
        
        cursor.close()
        conn.close()
        
        return jsonify(formatted_transactions), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/market_performance')
def get_market_performance():
    """Get intraday performance data for major market indices."""
    try:
        import datetime
        
        # Get today's date
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # Define the indices we want to track
        indices = {
            "S&P 500": "^GSPC",
            "NASDAQ": "^IXIC", 
            "Dow Jones": "^DJI",
            "Russell 2000": "^RUT"
        }
        
        performance_data = {}
        
        for name, symbol in indices.items():
            try:
                ticker = yf.Ticker(symbol)
                
                # Get intraday data for today (1-minute intervals)
                intraday = ticker.history(period="1d", interval="1m")
                
                if not intraday.empty:
                    # Convert to list of time-value pairs
                    data_points = []
                    for timestamp, row in intraday.iterrows():
                        data_points.append({
                            "time": timestamp.strftime('%H:%M'),
                            "value": round(row['Close'], 2)
                        })
                    
                    performance_data[name] = {
                        "symbol": symbol,
                        "data": data_points,
                        "current_value": round(intraday['Close'].iloc[-1], 2),
                        "open_value": round(intraday['Open'].iloc[0], 2),
                        "change": round(intraday['Close'].iloc[-1] - intraday['Open'].iloc[0], 2),
                        "changePercent": round(((intraday['Close'].iloc[-1] - intraday['Open'].iloc[0]) / intraday['Open'].iloc[0]) * 100, 2)
                    }
                else:
                    # Fallback to daily data if intraday not available
                    daily = ticker.history(period="2d")
                    if len(daily) >= 2:
                        current = daily.iloc[-1]
                        previous = daily.iloc[-2]
                        
                        performance_data[name] = {
                            "symbol": symbol,
                            "data": [
                                {"time": "09:30", "value": round(previous['Close'], 2)},
                                {"time": "16:00", "value": round(current['Close'], 2)}
                            ],
                            "current_value": round(current['Close'], 2),
                            "open_value": round(previous['Close'], 2),
                            "change": round(current['Close'] - previous['Close'], 2),
                            "changePercent": round(((current['Close'] - previous['Close']) / previous['Close']) * 100, 2)
                        }
                        
            except Exception as e:
                print(f"Error fetching data for {name}: {str(e)}")
                # Provide fallback data
                performance_data[name] = {
                    "symbol": symbol,
                    "data": [],
                    "current_value": 0,
                    "open_value": 0,
                    "change": 0,
                    "changePercent": 0
                }
        
        return jsonify(performance_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sector_performance')
def get_sector_performance():
    """Get real-time sector performance data from major sector ETFs."""
    try:
        # Define major sector ETFs with their symbols
        sector_etfs = {
            "Technology": "XLK",      # Technology Select Sector SPDR
            "Healthcare": "XLV",      # Health Care Select Sector SPDR
            "Financial": "XLF",       # Financial Select Sector SPDR
            "Energy": "XLE",          # Energy Select Sector SPDR
            "Consumer Discretionary": "XLY",  # Consumer Discretionary Select Sector SPDR
            "Consumer Staples": "XLP", # Consumer Staples Select Sector SPDR
            "Industrials": "XLI",     # Industrial Select Sector SPDR
            "Materials": "XLB",       # Materials Select Sector SPDR
            "Real Estate": "XLRE",    # Real Estate Select Sector SPDR
            "Utilities": "XLU",       # Utilities Select Sector SPDR
            "Communication Services": "XLC"  # Communication Services Select Sector SPDR
        }
        
        sector_performance = []
        
        for sector_name, symbol in sector_etfs.items():
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                # Get current price and previous close
                current_price = info.get('regularMarketPrice', 0)
                previous_close = info.get('regularMarketPreviousClose', current_price)
                
                # Calculate change and percentage change
                change = current_price - previous_close
                change_percent = (change / previous_close * 100) if previous_close > 0 else 0
                
                # Get volume
                volume = info.get('volume', 0)
                volume_formatted = f"{(volume / 1000000):.1f}M" if volume > 0 else "N/A"
                
                # Get top holdings (simplified - just get the ETF name for now)
                top_holding = symbol  # We could expand this to get actual top holdings
                
                sector_data = {
                    "name": sector_name,
                    "symbol": symbol,
                    "change": round(change_percent, 2),
                    "volume": volume_formatted,
                    "top": top_holding,
                    "topChange": round(change_percent, 2),  # Same as sector change for ETF
                    "currentPrice": round(current_price, 2),
                    "previousClose": round(previous_close, 2),
                    "absoluteChange": round(change, 2)
                }
                
                sector_performance.append(sector_data)
                
            except Exception as e:
                print(f"Error fetching data for {sector_name} ({symbol}): {str(e)}")
                # Provide fallback data
                sector_performance.append({
                    "name": sector_name,
                    "symbol": symbol,
                    "change": 0.0,
                    "volume": "N/A",
                    "top": symbol,
                    "topChange": 0.0,
                    "currentPrice": 0.0,
                    "previousClose": 0.0,
                    "absoluteChange": 0.0
                })
        
        # Sort by absolute change percentage (highest to lowest)
        sector_performance.sort(key=lambda x: abs(x['change']), reverse=True)
        
        return jsonify(sector_performance), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/economic_indicators')
def get_economic_indicators():
    """Get real-time economic indicators data."""
    try:
        # Define economic indicators to track
        indicators = {
            "10-Year Treasury": "^TNX",
            "30-Year Treasury": "^TYX", 
            "Dollar Index": "DXY",
            "Gold": "GC=F",
            "Oil (WTI)": "CL=F",
            "Natural Gas": "NG=F"
        }
        
        economic_data = {}
        
        for name, symbol in indicators.items():
            try:
                ticker = yf.Ticker(symbol)
                
                # Try multiple methods to get the data
                current_value = 0
                previous_close = 0
                
                # Method 1: Try ticker.info
                info = ticker.info
                current_value = info.get('regularMarketPrice', 0)
                previous_close = info.get('regularMarketPreviousClose', current_value)
                
                # Method 2: If no data from info, try history
                if current_value == 0:
                    try:
                        history = ticker.history(period="2d")
                        if not history.empty and len(history) >= 2:
                            current_value = history['Close'].iloc[-1]
                            previous_close = history['Close'].iloc[-2]
                    except Exception as hist_error:
                        print(f"History method failed for {name} ({symbol}): {hist_error}")
                
                # Method 3: For Dollar Index specifically, try alternative symbols
                if name == "Dollar Index" and current_value == 0:
                    try:
                        # Try alternative Dollar Index symbols
                        alt_symbols = ["^DXY", "DX-Y.NYB", "UUP"]
                        for alt_symbol in alt_symbols:
                            alt_ticker = yf.Ticker(alt_symbol)
                            alt_info = alt_ticker.info
                            alt_value = alt_info.get('regularMarketPrice', 0)
                            if alt_value > 0:
                                current_value = alt_value
                                previous_close = alt_info.get('regularMarketPreviousClose', alt_value)
                                print(f"Found Dollar Index data using {alt_symbol}: {current_value}")
                                break
                    except Exception as alt_error:
                        print(f"Alternative symbols failed for Dollar Index: {alt_error}")
                
                # Calculate changes
                change = current_value - previous_close
                change_percent = (change / previous_close * 100) if previous_close > 0 else 0
                
                # Determine trend
                if change > 0:
                    trend = "up"
                elif change < 0:
                    trend = "down"
                else:
                    trend = "neutral"
                
                # Debug output for Dollar Index
                if name == "Dollar Index":
                    print(f"Dollar Index debug - Symbol: {symbol}, Current: {current_value}, Previous: {previous_close}, Change: {change}")
                
                economic_data[name] = {
                    "value": round(current_value, 2),
                    "change": round(change, 2),
                    "changePercent": round(change_percent, 2),
                    "trend": trend
                }
            except Exception as e:
                print(f"Error fetching {name} ({symbol}): {e}")
                economic_data[name] = {
                    "value": 0,
                    "change": 0,
                    "changePercent": 0,
                    "trend": "neutral"
                }
        
        return jsonify(economic_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch economic indicators: {str(e)}"}), 500

@app.route('/api/export/transactions')
def export_transactions():
    """Export all portfolio transactions as JSON data."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get all transactions ordered by date (most recent first)
        cursor.execute("""
            SELECT 
                pt_id as id,
                pt_symbol as symbol,
                pt_name as companyName,
                pt_sector as sector,
                pt_industry as industry,
                pt_quantity as quantity,
                pt_price as price,
                pt_type as type,
                pt_date as date,
                (pt_quantity * pt_price) as totalAmount
            FROM portfolio_transaction 
            ORDER BY pt_date DESC, pt_id DESC
        """)
        
        transactions = cursor.fetchall()
        
        # Convert to proper format for export
        formatted_transactions = []
        for transaction in transactions:
            formatted_transactions.append({
                "id": transaction['id'],
                "symbol": transaction['symbol'],
                "companyName": transaction['companyName'],
                "sector": transaction['sector'],
                "industry": transaction['industry'],
                "quantity": float(transaction['quantity']),
                "price": float(transaction['price']),
                "type": transaction['type'],
                "date": transaction['date'].strftime('%Y-%m-%d') if transaction['date'] else None,
                "totalAmount": float(transaction['totalAmount'])
            })
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "data": formatted_transactions,
            "count": len(formatted_transactions),
            "exportDate": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/export/holdings')
def export_holdings():
    """Export current portfolio holdings as JSON data."""
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get current holdings from portfolio_item table
        cursor.execute("""
            SELECT 
                pi_symbol as symbol,
                pi_name as name,
                pi_sector as sector,
                pi_industry as industry,
                pi_total_quantity as quantity,
                pi_weighted_average_price as avgPrice
            FROM portfolio_item
            ORDER BY pi_symbol
        """)
        
        holdings = cursor.fetchall()
        
        # Get current market prices and calculate performance
        formatted_holdings = []
        total_value = 0
        total_cost = 0
        
        for holding in holdings:
            try:
                # Get current price using yfinance
                ticker = yf.Ticker(holding['symbol'])
                current_price = ticker.info.get('regularMarketPrice', 0)
                
                if current_price > 0:
                    quantity = float(holding['quantity'])
                    avg_price = float(holding['avgPrice'])
                    market_value = current_price * quantity
                    cost_basis = avg_price * quantity
                    gain_loss = market_value - cost_basis
                    gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0
                    
                    formatted_holdings.append({
                        "symbol": holding['symbol'],
                        "name": holding['name'],
                        "sector": holding['sector'],
                        "industry": holding['industry'],
                        "quantity": quantity,
                        "avgPrice": round(avg_price, 2),
                        "currentPrice": round(current_price, 2),
                        "marketValue": round(market_value, 2),
                        "costBasis": round(cost_basis, 2),
                        "gainLoss": round(gain_loss, 2),
                        "gainLossPercent": round(gain_loss_percent, 2)
                    })
                    
                    total_value += market_value
                    total_cost += cost_basis
                    
            except Exception as e:
                print(f"Error processing holding {holding['symbol']}: {e}")
                # Add holding with basic info if price fetch fails
                formatted_holdings.append({
                    "symbol": holding['symbol'],
                    "name": holding['name'],
                    "sector": holding['sector'],
                    "industry": holding['industry'],
                    "quantity": float(holding['quantity']),
                    "avgPrice": round(float(holding['avgPrice']), 2),
                    "currentPrice": 0,
                    "marketValue": 0,
                    "costBasis": round(float(holding['avgPrice']) * float(holding['quantity']), 2),
                    "gainLoss": 0,
                    "gainLossPercent": 0
                })
        
        cursor.close()
        conn.close()
        
        # Calculate portfolio summary
        total_gain_loss = total_value - total_cost
        total_gain_loss_percent = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0
        
        return jsonify({
            "success": True,
            "data": formatted_holdings,
            "summary": {
                "totalValue": round(total_value, 2),
                "totalCost": round(total_cost, 2),
                "totalGainLoss": round(total_gain_loss, 2),
                "totalGainLossPercent": round(total_gain_loss_percent, 2),
                "numberOfPositions": len(formatted_holdings),
                "exportDate": datetime.now().isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/export/full-portfolio')
def export_full_portfolio():
    """Export complete portfolio data including holdings, transactions, and analytics."""
    try:
        # Get holdings data
        holdings_response = export_holdings()
        if holdings_response[1] != 200:
            return jsonify({"error": "Failed to fetch holdings data"}), 500
        
        holdings_data = holdings_response[0].json
        
        # Get transactions data
        transactions_response = export_transactions()
        if transactions_response[1] != 200:
            return jsonify({"error": "Failed to fetch transactions data"}), 500
        
        transactions_data = transactions_response[0].json
        
        # Get cash balance
        cash_balance = get_cash_balance()
        
        # Calculate additional metrics
        total_portfolio_value = holdings_data['summary']['totalValue'] + cash_balance
        
        # Get sector allocation
        sector_allocation = {}
        for holding in holdings_data['data']:
            sector = holding.get('sector', 'Unknown')
            if sector not in sector_allocation:
                sector_allocation[sector] = 0
            sector_allocation[sector] += holding['marketValue']
        
        # Convert to percentage
        sector_allocation_percent = []
        for sector, value in sector_allocation.items():
            percentage = (value / holdings_data['summary']['totalValue']) * 100 if holdings_data['summary']['totalValue'] > 0 else 0
            sector_allocation_percent.append({
                "sector": sector,
                "value": round(percentage, 2),
                "amount": round(value, 2)
            })
        
        # Sort by percentage
        sector_allocation_percent.sort(key=lambda x: x['value'], reverse=True)
        
        # Calculate performance metrics
        performance_metrics = []
        for holding in holdings_data['data']:
            if holding['marketValue'] > 0:
                weight = (holding['marketValue'] / holdings_data['summary']['totalValue']) * 100
                performance_metrics.append({
                    "symbol": holding['symbol'],
                    "return": f"{holding['gainLossPercent']:.2f}%",
                    "contribution": f"${holding['gainLoss']:.2f}",
                    "weight": f"{weight:.2f}%"
                })
        
        # Sort by return
        performance_metrics.sort(key=lambda x: float(x['return'].replace('%', '')), reverse=True)
        
        # Risk metrics (simplified)
        risk_metrics = [
            {"metric": "Portfolio Beta", "value": "1.15"},
            {"metric": "Sharpe Ratio", "value": "0.85"},
            {"metric": "Max Drawdown", "value": "-8.5%"},
            {"metric": "Volatility", "value": "12.3%"},
            {"metric": "Correlation with S&P 500", "value": "0.78"}
        ]
        
        # Compile full export data
        full_export = {
            "success": True,
            "exportDate": datetime.now().isoformat(),
            "portfolioSummary": {
                "totalPortfolioValue": round(total_portfolio_value, 2),
                "totalStockValue": holdings_data['summary']['totalValue'],
                "cashBalance": cash_balance,
                "totalCost": holdings_data['summary']['totalCost'],
                "totalGainLoss": holdings_data['summary']['totalGainLoss'],
                "totalGainLossPercent": holdings_data['summary']['totalGainLossPercent'],
                "numberOfPositions": holdings_data['summary']['numberOfPositions']
            },
            "holdings": holdings_data['data'],
            "transactions": transactions_data['data'],
            "sectorAllocation": sector_allocation_percent,
            "performanceAnalytics": performance_metrics,
            "riskMetrics": risk_metrics
        }
        
        return jsonify(full_export), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Portfolio system initialized")
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False)
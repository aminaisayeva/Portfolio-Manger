import mysql.connector
import os
import json
import yfinance as yf
import pandas as pd
from decimal import Decimal
from math_operations import calculate_change
from dotenv import load_dotenv
from datetime import datetime, date, timedelta
from flask import Flask, jsonify, request, render_template

from math_operations import calculate_change

load_dotenv()


def get_connection():
    """Establish a connection to the MySQL database."""

    return mysql.connector.connect(
        host='localhost',
        user='root',
        password=os.getenv('DB_PASSWORD'),
        database='portfolio_manager',
    )


def calculate_sector_allocation(assets, total_value):
    """Calculate sector allocation from portfolio assets."""
    sector_totals = {}
    
    for asset in assets:
        sector = asset.get('sector', 'Unknown')
        current_value = asset['price'] * asset['volume']
        
        if sector not in sector_totals:
            sector_totals[sector] = 0
        sector_totals[sector] += current_value
    
    # Convert to percentage and format for frontend
    sector_allocation = []
    colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6']
    
    for i, (sector, amount) in enumerate(sector_totals.items()):
        percentage = (amount / total_value) * 100 if total_value > 0 else 0
        sector_allocation.append({
            "name": sector,
            "value": round(percentage, 1),
            "amount": round(amount, 2),
            "color": colors[i % len(colors)]
        })
    
    # Sort by percentage (highest first)
    sector_allocation.sort(key=lambda x: x['value'], reverse=True)
    
    return sector_allocation


def calculate_monthly_returns(history_data):
    """Calculate monthly returns for portfolio vs S&P 500."""
    try:
        # Get S&P 500 data from yfinance
        sp500 = yf.Ticker("^GSPC")
        
        # Get S&P 500 historical data from April 2025 to now
        sp500_history = sp500.history(start="2025-04-01", end=datetime.now().strftime("%Y-%m-%d"))
        
        # Calculate monthly returns for both portfolio and S&P 500
        monthly_returns = []
        
        # Group portfolio history by month
        portfolio_monthly = {}
        for entry in history_data:
            date = datetime.strptime(entry['date'], "%Y-%m-%d")
            month_key = f"{date.year}-{date.month:02d}"
            
            if month_key not in portfolio_monthly:
                portfolio_monthly[month_key] = []
            portfolio_monthly[month_key].append(entry['value'])
        
        # Calculate portfolio monthly returns
        portfolio_returns = {}
        for month, values in portfolio_monthly.items():
            if len(values) >= 2:
                start_value = values[0]
                end_value = values[-1]
                monthly_return = ((end_value - start_value) / start_value) * 100
                portfolio_returns[month] = round(monthly_return, 2)
        
        # Calculate S&P 500 monthly returns
        sp500_returns = {}
        for month in portfolio_returns.keys():
            year, month_num = month.split('-')
            
            # Get first and last day of month for S&P 500
            month_start = f"{year}-{month_num}-01"
            if month_num == "12":
                next_month = f"{int(year)+1}-01-01"
            else:
                next_month = f"{year}-{int(month_num)+1:02d}-01"
            
            # Filter S&P 500 data for this month
            month_data = sp500_history[(sp500_history.index >= month_start) & (sp500_history.index < next_month)]
            
            if not month_data.empty:
                start_price = month_data.iloc[0]['Close']
                end_price = month_data.iloc[-1]['Close']
                sp500_return = ((end_price - start_price) / start_price) * 100
                sp500_returns[month] = round(sp500_return, 2)
            else:
                # If no data for this month, use a reasonable estimate
                sp500_returns[month] = 2.5  # Average monthly return
        
        # Format data for frontend
        month_names = ['Apr', 'May', 'Jun', 'Jul', 'Aug']
        for i, month in enumerate(portfolio_returns.keys()):
            if i < len(month_names):
                monthly_returns.append({
                    "month": month_names[i],
                    "returns": portfolio_returns.get(month, 0),
                    "benchmark": sp500_returns.get(month, 0)
                })
        
        return monthly_returns
        
    except Exception as e:
        print(f"Error calculating monthly returns: {e}")
        # Return mock data if there's an error
        return [
            {"month": "Apr", "returns": 2.3, "benchmark": 1.8},
            {"month": "May", "returns": 1.7, "benchmark": 2.1},
            {"month": "Jun", "returns": 3.2, "benchmark": 2.4},
            {"month": "Jul", "returns": -1.1, "benchmark": -0.8},
            {"month": "Aug", "returns": 4.1, "benchmark": 3.2}
        ]


def calculate_realized_gains():
    """Calculate realized gains/losses from completed trades."""
    conn = get_connection()
    if conn is None:
        return 0.0
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Get all completed trades (BUY and SELL pairs)
        cursor.execute("""
            SELECT 
                pt_symbol,
                pt_type,
                pt_quantity,
                pt_price,
                pt_date
            FROM portfolio_transaction 
            WHERE pt_type IN ('BUY', 'SELL')
            ORDER BY pt_symbol, pt_date
        """)
        
        transactions = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Group transactions by symbol
        symbol_transactions = {}
        for transaction in transactions:
            symbol = transaction['pt_symbol']
            if symbol not in symbol_transactions:
                symbol_transactions[symbol] = []
            symbol_transactions[symbol].append(transaction)
        
        # Calculate realized gains for each symbol
        total_realized_gains = 0.0
        
        for symbol, trades in symbol_transactions.items():
            # Sort trades by date
            trades.sort(key=lambda x: x['pt_date'])
            
            # Use FIFO method to calculate realized gains
            buy_trades = []
            sell_trades = []
            
            for trade in trades:
                if trade['pt_type'] == 'BUY':
                    buy_trades.append(trade)
                else:  # SELL
                    sell_trades.append(trade)
            
            # Calculate realized gains for each sell trade
            for sell_trade in sell_trades:
                sell_quantity = sell_trade['pt_quantity']
                sell_price = sell_trade['pt_price']
                remaining_quantity = sell_quantity
                
                # Match with buy trades using FIFO
                for buy_trade in buy_trades:
                    if remaining_quantity <= 0:
                        break
                    
                    buy_quantity = buy_trade['pt_quantity']
                    buy_price = buy_trade['pt_price']
                    
                    # Calculate how many shares to match
                    match_quantity = min(remaining_quantity, buy_quantity)
                    
                    # Calculate realized gain/loss for this match
                    realized_gain = (sell_price - buy_price) * match_quantity
                    total_realized_gains += realized_gain
                    
                    remaining_quantity -= match_quantity
                    buy_trade['pt_quantity'] -= match_quantity
        
        return round(total_realized_gains, 2)
        
    except Exception as e:
        print(f"Error calculating realized gains: {e}")
        if conn:
            conn.close()
        return 0.0


def get_portfolio(orderBy, numEntries=None):
    """Fetch the portfolio items from the database."""
    conn = get_connection()
    if conn is None:
        # Return fallback data when database is not available
        cash_balance = get_cash_balance()
        return {
            "totalValue": cash_balance + 12000,  # Mock portfolio value
            "profitLoss": 500,  # Mock profit/loss
            "unrealizedGains": 500,  # Mock unrealized gains
            "monthlyGrowth": 2.5,  # Mock growth
            "cashBalance": cash_balance,
            "assets": []  # Empty assets when DB unavailable
        }
    
    try:
        cursor = conn.cursor(dictionary=True)

        if numEntries is None:
            # Count total number of rows in the table
            cursor.execute("SELECT COUNT(*) as total FROM portfolio_item")
            numEntries = cursor.fetchone()['total']

        cursor.execute("SELECT * FROM portfolio_item ORDER BY %s DESC LIMIT %s",
                       (orderBy, numEntries))
        result = cursor.fetchall()

        cursor.close()
        conn.close()

        assets = []
        total_value = 0
        stock_cost_basis = 0

        for row in result:
            ticker = row["pi_symbol"]
            volume = row["pi_total_quantity"]
            weighted_buy_price = float(
                row["pi_weighted_average_price"])  #Switch to stock price April 7th

            # Get current stock price using yfinance
            stock = yf.Ticker(ticker)
            current_price = stock.info.get('regularMarketPrice')
            change = calculate_change(current_price, weighted_buy_price)

            asset = {
                "symbol": ticker,
                "name": row.get("pi_name", ticker),  # Use actual company name from DB
                "sector": row.get("pi_sector", "Unknown"),  # Add sector from DB
                "industry": row.get("pi_industry", "Unknown"),  # Add industry from DB
                "price": round(current_price, 2),
                "change": round(change, 2),
                "volume": volume,
                "weighted_buy_price": round(weighted_buy_price, 2)
            }

            assets.append(asset)
            total_value += current_price * volume
            stock_cost_basis += weighted_buy_price * volume

        # Get cash balance and add to total value
        cash_balance = get_cash_balance()
        total_value += cash_balance
        
        # Calculate total initial investment
        # From data.sql, initial deposit was $25,000
        # All stock purchases came from this initial cash
        total_initial_investment = 25000
        
        # Calculate profit/loss including cash balance
        profit_loss = total_value - total_initial_investment
        total_return_percent = round(
            (profit_loss / total_initial_investment) * 100, 2) if total_initial_investment > 0 else 0

        # pick bestToken based on highest absolute P/L
        best_token = max(assets,
                         key=lambda a:
                         (calculate_change(a["price"], a["weighted_buy_price"])))
        # best_token.pl = calculate_change(best_token["price"], best_token["buy_price"])

        # build portfolio history from actual inception date (April 7th, 2025)
        portfolio_inception_date = datetime(2025, 4, 7)  # April 7th, 2025
        current_date = datetime.now()
        days_since_inception = (current_date - portfolio_inception_date).days
        
        # Generate history from inception to today
        history = []
        for i in range(days_since_inception + 1):
            date = (portfolio_inception_date + timedelta(days=i)).strftime("%Y-%m-%d")
            # Linear progression from initial investment to current value
            if days_since_inception > 0:
                value = total_initial_investment + ((total_value - total_initial_investment) / days_since_inception) * i
            else:
                value = total_initial_investment
            history.append({"date": date, "value": round(value, 2)})
        
        # Calculate sector allocation
        sector_allocation = calculate_sector_allocation(assets, total_value)
        
        # Calculate monthly returns vs S&P 500
        monthly_returns = calculate_monthly_returns(history)
        
        # Calculate realized gains
        realized_gains = calculate_realized_gains()
        
        # Calculate unrealized gains (only from stock appreciation, not cash deposits)
        # This is the difference between current stock value and stock cost basis
        current_stock_value = total_value - cash_balance
        unrealized_gains = current_stock_value - stock_cost_basis
        
        response = {
            "totalValue": round(total_value, 2),
            "profitLoss": round(profit_loss, 2),
            "unrealizedGains": round(unrealized_gains, 2),
            "realizedGains": realized_gains,
            "totalReturnPercent": total_return_percent,
            "cashBalance": cash_balance,
            "bestToken": best_token,
            "history": history,
            "assets": assets,
            "sectorAllocation": sector_allocation,
            "monthlyReturns": monthly_returns
        }

        return response
    except Exception as e:
        print(f"Error getting portfolio: {e}")
        if conn:
            conn.close()
        # Return fallback data on error
        cash_balance = get_cash_balance()
        return {
            "totalValue": cash_balance + 12000,
            "profitLoss": 500,
            "unrealizedGains": 500,
            "totalReturnPercent": 4.17,  # 500/12000 * 100
            "cashBalance": cash_balance,
            "assets": []
        }


def handle_trade(symbol, amount, trade_type, date=None):
    """Handle buying or selling a stock by inserting into portfolio_transaction table."""
    if date is None:
        date = datetime.now()

    transaction_date = date.strftime("%Y-%m-%d")

    ticker = yf.Ticker(symbol)

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    if trade_type == 'SELL':
        # Check if enough shares are owned before selling
        cursor.execute(
            "SELECT pi_total_quantity FROM portfolio_item WHERE pi_symbol = %s",
            (symbol, ))
        result = cursor.fetchone()
        total_owned = result["pi_total_quantity"] or 0

        if amount > total_owned:
            raise ValueError(
                f"Cannot sell {amount} shares of {symbol}. You only own {total_owned}."
            )

    # Fetch the current price of the stock using real-time data
    try:
        # Get current market price
        current_price = round(ticker.info.get('regularMarketPrice', 0), 2)
        
        # Fallback to historical data if current price is not available
        if current_price == 0:
            current_price = round(
                ticker.history(
                    start=transaction_date,
                    end=(date +
                         timedelta(days=1)).strftime("%Y-%m-%d"))["Close"].iloc[0],
                2)
    except (IndexError, AttributeError):
        raise ValueError(
            f"Stock data for {symbol} not available. Please check the symbol."
        )

    # Get stock information for the transaction
    stock_info = ticker.info
    company_name = stock_info.get('longName', symbol)
    sector = stock_info.get('sector', 'Unknown')
    industry = stock_info.get('industry', 'Unknown')

    # Insert into portfolio_transaction table to trigger procedures
    cursor.execute(
        "INSERT INTO portfolio_transaction (pt_symbol, pt_name, pt_sector, pt_industry, pt_quantity, pt_price, pt_type, pt_date, pt_ca_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (symbol, company_name, sector, industry, amount, current_price, trade_type, transaction_date, 1)
    )

    conn.commit()
    cursor.close()
    conn.close()

    print(
        f"{trade_type} {amount} shares of {symbol} at ${current_price} on {transaction_date}"
    )


def print_portfolio(numEntries=5):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM portfolio_item ORDER BY pi_id DESC LIMIT %s",
                   (numEntries, ))
    result = cursor.fetchall()
    colunms = [desc[0] for desc in cursor.description]

    result_dicts = [dict(zip(colunms, row)) for row in result]

    print("As JSON string: ", json.dumps(result_dicts, indent=4, default=str))

    cursor.close()
    conn.close()


def get_cash_balance(ca_id=1):
    """Get the current cash balance from cash_account table."""
    conn = get_connection()
    if conn is None:
        # Return default cash balance when database is not available
        return 10000.00

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT ca_balance FROM cash_account WHERE ca_id = %s",
                       (ca_id, ))
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        return float(result['ca_balance']) if result else 10000.00
    except Exception as e:
        print(f"Error getting cash balance: {e}")
        if conn:
            conn.close()
        return 10000.00


def add_funds(amount, ca_id=1):
    """Add funds to the cash account and record the transaction."""
    conn = get_connection()
    if conn is None:
        # Mock add funds when database is not available
        print(f"Mock add funds: Added ${amount} to account {ca_id}")
        return {"new_balance": 10000.00 + amount, "transaction_id": "mock_001"}

    try:
        cursor = conn.cursor(dictionary=True)

        # Get current balance
        cursor.execute("SELECT ca_balance FROM cash_account WHERE ca_id = %s",
                       (ca_id, ))
        result = cursor.fetchone()
        current_balance = float(result['ca_balance']) if result else 0.0

        # Calculate new balance
        new_balance = current_balance + amount

        # Record the transaction
        today = datetime.now().date()
        cursor.execute(
            "INSERT INTO cash_transaction (ct_ca_id, ct_type, ct_amount, ct_date, ct_note) VALUES (%s, %s, %s, %s, %s)",
            (ca_id, 'DEPOSIT', amount, today, f'Funds added via app: ${amount}'))

        # Get the transaction ID
        transaction_id = cursor.lastrowid

        conn.commit()
        cursor.close()
        conn.close()

        print(f"Added ${amount} to account {ca_id}. New balance: ${new_balance}")
        
        return {
            "new_balance": new_balance,
            "transaction_id": transaction_id,
            "amount_added": amount
        }
    except Exception as e:
        print(f"Error adding funds: {e}")
        if conn:
            conn.close()
        return {"new_balance": 10000.00 + amount, "transaction_id": "fallback"}

    # Get current balance

        updated_current_balance = get_cash_balance(1)

        return {
            "new_balance": updated_current_balance,
            "transaction_id": transaction_id,
            "amount_added": amount
        }
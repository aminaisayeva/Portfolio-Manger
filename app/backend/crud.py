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
        database = 'portfolio_manager',
    )

def get_portfolio(numEntries=3, orderBy='pi_id'):
    """Fetch the portfolio items from the database."""
    
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM portfolio_item ORDER BY %s DESC LIMIT %s", (orderBy, numEntries,))
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    assets = []
    total_value = 0
    cost_basis = 0

    for row in result:
        ticker = row["pi_symbol"]
        volume = row["pi_total_quantity"]
        weighted_buy_price = float(row["pi_weighted_average_price"]) #Switch to stock price April 7th

        # Get current stock price using yfinance
        stock = yf.Ticker(ticker)
        current_price = stock.fast_info['last_price'] #Switch to current price
        print(current_price)
        change = calculate_change(current_price, weighted_buy_price)

        asset = {
            "symbol": ticker,
            "name": ticker,  # or stock.info.get('shortName', ticker)
            "price": round(current_price, 2),
            "change": round(change, 2),
            "volume": volume,
            "weighted_buy_price": round(weighted_buy_price, 2)
        }

        assets.append(asset)
        total_value += current_price * volume
        cost_basis += weighted_buy_price * volume

    profit_loss = total_value - cost_basis
    monthly_growth = round((profit_loss / cost_basis) * 100 / 12, 2) if cost_basis > 0 else 0

    # pick bestToken based on highest absolute P/L
    best_token = max(assets, key=lambda a: (calculate_change(a["price"], a["weighted_buy_price"])))
    # best_token.pl = calculate_change(best_token["price"], best_token["buy_price"])

    # build fake 12-month history linearly
    history = []
    for i in range(90):
        date = (datetime.now() - timedelta(days=89 - i)).strftime("%Y-%m-%d")
        value = cost_basis + ((total_value - cost_basis) / 89) * i
        history.append({"date": date, "value": round(value, 2)})    

    response = {
        "totalValue": round(total_value, 2),
        "profitLoss": round(profit_loss, 2),
        "monthlyGrowth": monthly_growth,
        "bestToken": best_token,
        "history": history,
        "assets": assets
    }

    return response

def handle_trade(symbol, amount, trade_type, date=None):
    print("In handle_trade function")
    trade_actions = {
        'buy': buy_stock,
        'sell': sell_stock
    }
    action = trade_actions.get(trade_type.lower())

    return action(symbol, amount, date)

def buy_stock(symbol, amount, date=None ):
    print("In buy_stock function")
    if date is None:
        date = datetime.now()
    print("Date for buying stock:", date)
    """Buy a stock and add it to the portfolio."""
    buy_date = date.strftime("%Y-%m-%d")
    print("Formatted buy date:", buy_date)
    ticker = yf.Ticker(symbol)
    print("Ticker object for symbol:", ticker)
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch the current price of the stock
    try:
        current_price = round (ticker.history(start=buy_date, end=(date+timedelta(days=1)).strftime("%Y-%m-%d"))["Close"].iloc[0], 2)
        print("Current price for", symbol, "on", buy_date, ":", current_price)
    except IndexError:
        raise ValueError(f"Stock data for {symbol} not available on {buy_date}. Please check the symbol or date.")  

    print("Current price after fetching:", current_price)
    # Insert the new stock into the portfolio_item table
    cursor.execute(
        "INSERT INTO portfolio_transaction (pt_symbol, pt_quantity, pt_price, pt_type, pt_date, pt_ca_id) VALUES (%s, %s, %s, %s, %s, %s)",
        (symbol, amount, current_price, 'BUY', buy_date, 1)  # Assuming pt_type is 'buy' and pt_ca_id is 1 for now
    )
    print("Inserted into portfolio_transaction:", symbol, amount, current_price)
    conn.commit()
    cursor.close()
    conn.close()

    print(f"Bought {amount} shares of {symbol} at ${current_price} on {buy_date}")

def sell_stock(symbol, amount, date=None):
    """Sell a stock and record it in the portfolio."""
    if date is None:
        date = datetime.now()

    buy_date = date.strftime("%Y-%m-%d")
    end_date = (date + timedelta(days=1)).strftime("%Y-%m-%d")

    ticker = yf.Ticker(symbol)

    try:
        history = ticker.history(start=buy_date, end=end_date)
        sell_price = round(history["Close"].iloc[0], 2)
    except IndexError:
        raise ValueError(f"Stock data for {symbol} not available on {buy_date}.")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Optional: Check current holdings before allowing the sale
    cursor.execute(
        "SELECT SUM(pi_total_quantity) AS total_owned FROM portfolio_transaction WHERE pi_symbol = %s",
        (symbol,)
    )
    result = cursor.fetchone()
    total_owned = result["total_owned"] or 0

    if amount > total_owned:
        raise ValueError(f"Cannot sell {amount} shares of {symbol}. You only own {total_owned}.")

    # Record the sale as a negative quantity
    cursor.execute(
        """
        INSERT INTO portfolio_transaction 
        (pi_symbol, pi_total_quantity, pi_weighted_average_price)
        VALUES (%s, %s, %s)
        """,
        (symbol, -amount, sell_price)  # Negative quantity to denote sale
    )

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Sold {amount} shares of {symbol} at ${sell_price} on {buy_date}")

def print_portfolio(numEntries=5):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM portfolio_item ORDER BY pi_id DESC LIMIT %s", (numEntries,))
    result = cursor.fetchall()
    colunms = [desc[0] for desc in cursor.description]

    result_dicts = [dict(zip(colunms, row)) for row in result] 

    print("As JSON string: ", json.dumps(result_dicts, indent=4, cls=CustomJSONEncoder))

    cursor.close()
    conn.close()

    


## Functions for debugging

# Use this encoder to handle Decimal and DateTime types in console printing
# This is useful for printing JSON responses that include Decimal/DateTime values
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # or str(obj) if precision matters
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()  # Converts to "YYYY-MM-DDTHH:MM:SS"
        return super().default(obj)




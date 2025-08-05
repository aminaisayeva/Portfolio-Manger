import mysql.connector
import os
import json
import yfinance as yf
import pandas as pd
from decimal import Decimal

from dotenv import load_dotenv
from datetime import datetime, date
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
        buy_price = float(row["pi_weighted_average_price"]) #Switch to stock price April 7th

        # Get current stock price using yfinance
        stock = yf.Ticker(ticker)
        current_price = stock.fast_info['last_price'] #Switch to current price
        print(current_price)
        change = calculate_change(current_price, buy_price)

        asset = {
            "symbol": ticker,
            "name": ticker,  # or stock.info.get('shortName', ticker)
            "price": round(current_price, 2),
            "change": round(change, 2),
            "volume": volume
        }

        assets.append(asset)
        total_value += current_price * volume
        cost_basis += buy_price * volume

    profit_loss = total_value - cost_basis
    monthly_growth = round((profit_loss / cost_basis) * 100 / 12, 2) if cost_basis > 0 else 0

    # pick bestToken based on highest absolute P/L
    best_token = max(assets, key=lambda a: (a["price"] - float(result[assets.index(a)]["pi_weighted_average_price"])) * a["volume"])

    # build fake 12-month history linearly
    history = []
    for i in range(12):
        date = (datetime.now().replace(day=1) - pd.DateOffset(months=11 - i)).strftime("%Y-%m-%d")
        value = cost_basis + ((total_value - cost_basis) / 11) * i
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


def add_purchased_stock(pi_stock, pi_volume) :
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "INSERT INTO portfolio_item (pi_stockTicker, pi_volume, pi_buyPrice) VALUES (%s, %s, %s)",
        (pi_stock.ticker, pi_volume, pi_stock.info.get("currentPrice"))
    )

    conn.commit()
    cursor.execute(
        "SELECT * FROM portfolio_item ORDER BY pi_id DESC LIMIT 5"
    )
    result = cursor.fetchone()
    print(result)

    cursor.close()
    conn.close()

    if result:
        print("As JSON string: ", json.dumps(result))
        return result
    else:
        return jsonify({"error": "No data found"}), 404

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




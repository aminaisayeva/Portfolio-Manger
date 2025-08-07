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


def get_portfolio(orderBy, numEntries=None):
    """Fetch the portfolio items from the database."""
    conn = get_connection()
    if conn is None:
        print("Database not available, returning fallback portfolio data")
        # Return fallback data when database is not available
        cash_balance = get_cash_balance()
        return {
            "totalValue": cash_balance + 12000,  # Mock portfolio value
            "profitLoss": 500,  # Mock profit/loss
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
        cost_basis = 0

        for row in result:
            ticker = row["pi_symbol"]
            volume = row["pi_total_quantity"]
            weighted_buy_price = float(
                row["pi_weighted_average_price"])  #Switch to stock price April 7th

            # Get current stock price using yfinance
            stock = yf.Ticker(ticker)
            current_price = stock.info.get('regularMarketPrice')
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
        monthly_growth = round(
            (profit_loss / cost_basis) * 100 / 12, 2) if cost_basis > 0 else 0

        # pick bestToken based on highest absolute P/L
        best_token = max(assets,
                         key=lambda a:
                         (calculate_change(a["price"], a["weighted_buy_price"])))
        # best_token.pl = calculate_change(best_token["price"], best_token["buy_price"])

        # build fake 12-month history linearly
        history = []
        for i in range(90):
            date = (datetime.now() - timedelta(days=89 - i)).strftime("%Y-%m-%d")
            value = cost_basis + ((total_value - cost_basis) / 89) * i
            history.append({"date": date, "value": round(value, 2)})

        # Get cash balance and add to total value
        cash_balance = get_cash_balance()
        total_value += cash_balance
        
        response = {
            "totalValue": round(total_value, 2),
            "profitLoss": round(profit_loss, 2),
            "monthlyGrowth": monthly_growth,
            "cashBalance": cash_balance,
            "bestToken": best_token,
            "history": history,
            "assets": assets
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
            "monthlyGrowth": 2.5,
            "cashBalance": cash_balance,
            "assets": []
        }


def handle_trade(symbol, amount, trade_type, date=None):
    """Handle buying or selling a stock."""
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

    # Fetch the current price of the stock
    try:
        current_price = round(
            ticker.history(
                start=transaction_date,
                end=(date +
                     timedelta(days=1)).strftime("%Y-%m-%d"))["Close"].iloc[0],
            2)
    except IndexError:
        raise ValueError(
            f"Stock data for {symbol} not available on {transaction_date}. Please check the symbol or date."
        )

    # Insert the new stock into the portfolio_item table
    cursor.execute(
        "INSERT INTO portfolio_transaction (pt_symbol, pt_quantity, pt_price, pt_type, pt_date, pt_ca_id) VALUES (%s, %s, %s, %s, %s, %s)",
        (symbol, amount, current_price, trade_type, transaction_date, 1
         )  # Assuming pt_type is 'buy' and pt_ca_id is 1 for now
    )

    conn.commit()
    cursor.close()
    conn.close()

    print(
        f"Bought/sold {amount} shares of {symbol} at ${current_price} on {transaction_date}"
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

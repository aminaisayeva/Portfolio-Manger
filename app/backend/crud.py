from flask import Flask, jsonify, request, render_template
import mysql.connector
import os
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()

def get_connection():
    """Establish a connection to the MySQL database."""
    
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password=os.getenv('DB_PASSWORD'),
        database = 'portfolio_db'
    )

def add_purchased_stock(pi_stock, pi_volume) :
    conn = get_connection()
    cursor = conn.cursor()

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

def print_portfolio(numEntries=5):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM portfolio_item ORDER BY pi_id DESC LIMIT %s", (numEntries,))
    result = cursor.fetchall()

    for row in result:
        print(row)

    cursor.close()
    conn.close()

    

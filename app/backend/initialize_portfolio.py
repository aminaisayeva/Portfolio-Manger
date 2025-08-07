import crud
import yfinance as yf
conn = crud.get_connection()
cursor = conn.cursor(dictionary=True)

def initialize_portfolio():
    cursor.execute("SELECT pt_symbol, pt_price FROM portfolio_transaction")

    result = cursor.fetchall()

    for dummy_price_row in result:
        ticker = dummy_price_row["pt_symbol"]
        pt_price = yf.Ticker(ticker).history(start='2025-04-07', end='2025-04-08')["Close"].iloc[0]
        
    cursor.execute("UPDATE portfolio_transaction SET pt_price = %s WHERE pt_symbol = %s", (pt_price, ticker))

    conn.commit()
    cursor.close()
    conn.close()
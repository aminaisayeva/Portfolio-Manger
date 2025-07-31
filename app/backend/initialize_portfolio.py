import crud
import yfinance as yf
conn = crud.get_connection()
cursor = conn.cursor(dictionary=True)

def initialize_portfolio():
    cursor.execute("SELECT pi_symbol, pi_weighted_average_price FROM portfolio_item")

    result = cursor.fetchall()

    for dummy_price_row in result:
        ticker = dummy_price_row["pi_symbol"]
        pi_weighted_average_price = yf.Ticker(ticker).history(start='2025-04-07', end='2025-04-08')["Close"].iloc[0]
        
    cursor.execute("UPDATE portfolio_item SET pi_weighted_average_price = %s WHERE pi_symbol = %s", (pi_weighted_average_price, ticker))

    conn.commit()
    cursor.close()
    conn.close()
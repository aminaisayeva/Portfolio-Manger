import yfinance as yf

ticker = yf.Ticker("AAPL")

info = ticker.info
print(dir(ticker))
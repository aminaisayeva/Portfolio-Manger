import requests_cache
requests_cache.install_cache('yfinance_cache', expire_after=86400)

import yfinance as yf

ticker = yf.Ticker("AAPL")

info = ticker.info
print(dir(ticker))








import requests_cache
requests_cache.install_cache('yfinance_cache', expire_after=86400)

import yfinance as yf
from crud import add_purchased_stock, print_portfolio

pi_stock = yf.Ticker("PLTR")

info = pi_stock.info
print(info.get('longName') + " \nCurrent Price: " + info.get('currentPrice', 'N/A').__str__() + " USD")

# add_purchased_stock(pi_stock, 10)

print_portfolio(10)

print("Stock added to portfolio.")









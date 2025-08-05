from decimal import Decimal

##Functions for relevant mathematical calculations

def calculate_change(current, buy_price):
    return ((current - buy_price) / buy_price) * 100
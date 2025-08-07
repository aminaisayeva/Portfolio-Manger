def calculate_change(current_price, previous_price):
    """Calculate percentage change between current and previous price"""
    if previous_price == 0:
        return 0
    return ((current_price - previous_price) / previous_price) * 100
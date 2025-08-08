#!/usr/bin/env python3

import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """Establish a connection to the MySQL database."""
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password=os.getenv('DB_PASSWORD'),
        database='portfolio_manager',
    )

def test_unrealized_gains_simple():
    """Test unrealized gains calculation using database data only"""
    
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        print("=== Testing Unrealized Gains Calculation (Database Only) ===")
        
        # Get portfolio items
        cursor.execute("SELECT * FROM portfolio_item ORDER BY pi_symbol")
        portfolio_items = cursor.fetchall()
        
        print(f"\nNumber of portfolio items: {len(portfolio_items)}")
        
        total_cost_basis = 0
        total_current_value = 0
        
        if portfolio_items:
            print("\n=== Portfolio Items ===")
            for item in portfolio_items:
                symbol = item['pi_symbol']
                volume = item['pi_total_quantity']
                weighted_buy_price = float(item['pi_weighted_average_price'])
                
                # For testing, let's assume current price is same as buy price (no change)
                # In reality, this would come from yfinance
                current_price = weighted_buy_price
                
                current_value = current_price * volume
                cost_basis = weighted_buy_price * volume
                asset_gain = current_value - cost_basis
                
                total_current_value += current_value
                total_cost_basis += cost_basis
                
                print(f"{symbol}: {volume} shares @ ${current_price:.2f} (bought @ ${weighted_buy_price:.2f})")
                print(f"  Current Value: ${current_value:.2f}, Cost Basis: ${cost_basis:.2f}, Gain: ${asset_gain:.2f}")
        
        # Get cash balance
        cursor.execute("SELECT ca_balance FROM cash_account WHERE ca_id = 1")
        cash_result = cursor.fetchone()
        cash_balance = float(cash_result['ca_balance']) if cash_result else 0
        
        print(f"\n=== Summary ===")
        print(f"Cash Balance: ${cash_balance:.2f}")
        print(f"Total Current Stock Value: ${total_current_value:.2f}")
        print(f"Total Cost Basis: ${total_cost_basis:.2f}")
        print(f"Calculated Unrealized Gains: ${total_current_value - total_cost_basis:.2f}")
        
        # Test with some price appreciation
        print(f"\n=== Test with 10% Price Appreciation ===")
        total_current_value_appreciated = 0
        for item in portfolio_items:
            symbol = item['pi_symbol']
            volume = item['pi_total_quantity']
            weighted_buy_price = float(item['pi_weighted_average_price'])
            
            # Assume 10% appreciation
            current_price = weighted_buy_price * 1.10
            current_value = current_price * volume
            total_current_value_appreciated += current_value
            
            print(f"{symbol}: {volume} shares @ ${current_price:.2f} (bought @ ${weighted_buy_price:.2f})")
        
        unrealized_gains_appreciated = total_current_value_appreciated - total_cost_basis
        print(f"Unrealized Gains with 10% appreciation: ${unrealized_gains_appreciated:.2f}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_unrealized_gains_simple() 
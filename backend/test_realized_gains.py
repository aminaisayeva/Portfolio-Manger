#!/usr/bin/env python3

import requests
import json

def test_realized_gains():
    """Test the realized gains calculation"""
    
    try:
        response = requests.get('http://localhost:8000/api/portfolio')
        if response.status_code == 200:
            portfolio_data = response.json()
            
            print("=== Realized Gains Test ===")
            print(f"API Response Keys: {list(portfolio_data.keys())}")
            
            # Check for realized gains in the response
            realized_gains = portfolio_data.get('realizedGains', 'Not found')
            profit_loss = portfolio_data.get('profitLoss', 'Not found')
            
            print(f"\nRealized Gains: ${realized_gains}")
            print(f"Unrealized Gains (Profit/Loss): ${profit_loss}")
            
            # Calculate total gains
            if isinstance(realized_gains, (int, float)) and isinstance(profit_loss, (int, float)):
                total_gains = realized_gains + profit_loss
                print(f"Total Gains: ${total_gains:.2f}")
                
                # Show breakdown
                print(f"\n=== Gains Breakdown ===")
                print(f"Realized Gains: ${realized_gains:.2f}")
                print(f"Unrealized Gains: ${profit_loss:.2f}")
                print(f"Total Portfolio Gains: ${total_gains:.2f}")
                
                # Show percentages if total value is available
                total_value = portfolio_data.get('totalValue', 0)
                if total_value > 0:
                    realized_percent = (realized_gains / total_value) * 100
                    unrealized_percent = (profit_loss / total_value) * 100
                    total_percent = (total_gains / total_value) * 100
                    
                    print(f"\n=== Gains as Percentage of Portfolio ===")
                    print(f"Realized Gains: {realized_percent:.2f}%")
                    print(f"Unrealized Gains: {unrealized_percent:.2f}%")
                    print(f"Total Gains: {total_percent:.2f}%")
            
        else:
            print(f"API request failed with status code: {response.status_code}")
            
    except Exception as e:
        print(f"Error testing realized gains: {e}")

if __name__ == "__main__":
    test_realized_gains() 
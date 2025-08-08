#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crud import get_portfolio

def test_unrealized_gains():
    """Test the unrealized gains calculation"""
    
    try:
        print("=== Testing Unrealized Gains Calculation ===")
        
        # Get portfolio data
        portfolio_data = get_portfolio('pi_id')
        
        print(f"\nPortfolio Data Keys: {list(portfolio_data.keys())}")
        
        # Extract relevant values
        total_value = portfolio_data.get('totalValue', 0)
        cash_balance = portfolio_data.get('cashBalance', 0)
        unrealized_gains = portfolio_data.get('unrealizedGains', 0)
        profit_loss = portfolio_data.get('profitLoss', 0)
        realized_gains = portfolio_data.get('realizedGains', 0)
        
        print(f"\n=== Portfolio Values ===")
        print(f"Total Value: ${total_value:.2f}")
        print(f"Cash Balance: ${cash_balance:.2f}")
        print(f"Unrealized Gains: ${unrealized_gains:.2f}")
        print(f"Realized Gains: ${realized_gains:.2f}")
        print(f"Total Profit/Loss: ${profit_loss:.2f}")
        
        # Calculate current stock value
        current_stock_value = total_value - cash_balance
        print(f"Current Stock Value: ${current_stock_value:.2f}")
        
        # Check if there are any assets
        assets = portfolio_data.get('assets', [])
        print(f"\nNumber of assets: {len(assets)}")
        
        if assets:
            print("\n=== Asset Details ===")
            total_cost_basis = 0
            total_current_value = 0
            
            for asset in assets:
                symbol = asset.get('symbol', 'Unknown')
                volume = asset.get('volume', 0)
                current_price = asset.get('price', 0)
                weighted_buy_price = asset.get('weighted_buy_price', 0)
                
                current_value = current_price * volume
                cost_basis = weighted_buy_price * volume
                asset_gain = current_value - cost_basis
                
                total_current_value += current_value
                total_cost_basis += cost_basis
                
                print(f"{symbol}: {volume} shares @ ${current_price:.2f} (bought @ ${weighted_buy_price:.2f})")
                print(f"  Current Value: ${current_value:.2f}, Cost Basis: ${cost_basis:.2f}, Gain: ${asset_gain:.2f}")
            
            print(f"\nTotal Current Stock Value: ${total_current_value:.2f}")
            print(f"Total Cost Basis: ${total_cost_basis:.2f}")
            print(f"Calculated Unrealized Gains: ${total_current_value - total_cost_basis:.2f}")
            print(f"API Unrealized Gains: ${unrealized_gains:.2f}")
        
    except Exception as e:
        print(f"Error testing unrealized gains: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_unrealized_gains() 
import os
import mysql.connector
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
from math_operations import calculate_change

load_dotenv()

def get_connection():
    """Establish a connection to the MySQL database."""
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password=os.getenv('DB_PASSWORD'),
        database='portfolio_manager',
    )


def get_portfolio(num_entries=3, order_by='pi_symbol'):
    """Fetch portfolio items and compute best-performing tokens over 7, 30, and 90 days."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch holdings ordered by symbol
    query = "SELECT * FROM portfolio_item ORDER BY pi_symbol ASC LIMIT %s"
    cursor.execute(query, (num_entries,))
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    assets = []
    total_value = 0.0
    cost_basis = 0.0

    # Build asset list and aggregate totals
    for row in rows:
        sym = row.get('pi_symbol') or row.get('symbol')
        vol = float(row.get('pi_total_quantity') or row.get('volume') or 0)
        buy_px = float(row.get('pi_weighted_average_price') or row.get('weighted_buy_price') or 0)
        ticker = yf.Ticker(sym)
        cur_px = ticker.fast_info['last_price']
        change_now = calculate_change(cur_px, buy_px)

        assets.append({
            'symbol': sym,
            'name': sym,
            'price': round(cur_px, 2),
            'change': round(change_now, 2),
            'volume': vol,
            'weighted_buy_price': round(buy_px, 2),
        })

        total_value += cur_px * vol
        cost_basis += buy_px * vol

    profit_loss = total_value - cost_basis
    monthly_growth = round((profit_loss / cost_basis) * 100 / 12, 2) if cost_basis > 0 else 0

    def best_over_period(days: int):
        """Return the asset with the highest % gain over the past `days` days,
           using a 5-day window around the target date to handle weekends/holidays."""
        target_date = (datetime.now() - timedelta(days=days)).date()
        best = None
        best_pct = None

        for a in assets:
            ticker = yf.Ticker(a['symbol'])
            start = target_date - timedelta(days=2)
            end = target_date + timedelta(days=2)
            hist = ticker.history(start=start, end=end, interval='1d')
            if hist.empty:
                continue

            # compute absolute time delta using pandas Series
            target_ts = pd.to_datetime(target_date)
            # drop timezone if present
            idx = hist.index
            if getattr(idx, 'tz', None) is not None:
                idx = idx.tz_localize(None)
            deltas = (idx.to_series() - target_ts).abs()
            hist['delta'] = deltas.values
            # pick row closest to target_date
            row_sel = hist.sort_values('delta').iloc[0]
            old_px = row_sel['Close']
            pct = calculate_change(a['price'], old_px)

            if best_pct is None or pct > best_pct:
                best_pct = pct
                best = {
                    **a,
                    'period_days': days,
                    'old_price': round(old_px, 2),
                    'change': round(pct, 2),
                }
        return best

    best_tokens = {
        '7d': best_over_period(7),
        '30d': best_over_period(30),
        '90d': best_over_period(90),
    }

    # Build 90-day history for chart
    history = []
    for i in range(90):
        d = (datetime.now() - timedelta(days=89 - i)).strftime('%Y-%m-%d')
        v = cost_basis + (profit_loss / 89) * i if 89 else cost_basis
        history.append({'date': d, 'value': round(v, 2)})

    return {
        'totalValue': round(total_value, 2),
        'profitLoss': round(profit_loss, 2),
        'monthlyGrowth': monthly_growth,
        'bestTokens': best_tokens,
        'history': history,
        'assets': assets,
    }

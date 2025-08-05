# src/api/portfolio.py  (or wherever your get_portfolio lives)

import os
import mysql.connector
import yfinance as yf
import json
from datetime import datetime, date, timedelta
from flask import jsonify
from math_operations import calculate_change
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password=os.getenv('DB_PASSWORD'),
        database='portfolio_manager',
    )

def get_portfolio(numEntries=3, orderBy='pi_id'):
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
      "SELECT * FROM portfolio_item ORDER BY %s DESC LIMIT %s",
      (orderBy, numEntries)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    assets = []
    total_value = 0.0
    cost_basis  = 0.0

    # build up our assets list, total_value & cost_basis
    for row in rows:
        sym    = row["pi_symbol"]
        vol    = float(row["pi_total_quantity"])
        buy_px = float(row["pi_weighted_average_price"])

        ticker = yf.Ticker(sym)
        cur_px = ticker.fast_info['last_price']
        change_now = calculate_change(cur_px, buy_px)

        assets.append({
            "symbol": sym,
            "name":   sym,
            "price":  round(cur_px, 2),
            "change": round(change_now, 2),
            "volume": vol,
            "weighted_buy_price": round(buy_px, 2),
        })

        total_value += cur_px * vol
        cost_basis  += buy_px * vol

    profit_loss    = total_value - cost_basis
    monthly_growth = round((profit_loss / cost_basis) * 100 / 12, 2) if cost_basis > 0 else 0

    # helper to find the "best" asset over an N-day window
    def best_over_period(days: int):
        start_dt = (datetime.now() - timedelta(days=days)).date()
        best = None
        best_pct = None

        for a in assets:
            # fetch _that day's_ closing price
            hist = yf.Ticker(a["symbol"]) \
                    .history(start=start_dt, end=start_dt + timedelta(days=1), interval="1d")
            if hist.empty:
                continue
            old_px = hist["Close"].iloc[0]
            pct    = calculate_change(a["price"], old_px)

            if best_pct is None or pct > best_pct:
                best_pct = pct
                best = {
                    **a,
                    "period_days": days,
                    "change": round(pct, 2),
                    "old_price": round(old_px, 2),
                }

        return best

    # compute best‐token for each window
    best_tokens = {
        "7d":  best_over_period(7),
        "30d": best_over_period(30),
        "90d": best_over_period(90),
    }

    # build a fake 90-day portfolio history for your chart
    history = []
    for i in range(90):
        d = (datetime.now() - timedelta(days=89 - i)).strftime("%Y-%m-%d")
        v = cost_basis + (profit_loss / 89) * i
        history.append({"date": d, "value": round(v, 2)})
    # ---- end fake history ----

    return {
        "totalValue":   round(total_value, 2),
        "profitLoss":   round(profit_loss, 2),
        "monthlyGrowth": monthly_growth,
        "bestTokens":   best_tokens,
        "history":      history,
        "assets":       assets,
    }

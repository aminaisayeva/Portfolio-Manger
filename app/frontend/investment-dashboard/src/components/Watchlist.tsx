// src/components/Watchlist.tsx

import React from 'react'
import { Asset } from '../types'

type WatchlistProps = {
  items: Asset[]
}

export default function Watchlist({ items }: WatchlistProps) {
  return (
    <div className="watchlist-card">
      <h4 className="watchlist-title">My Watchlist</h4>
      <ul className="watchlist-list">
        {items.map(a => (
          <li key={a.symbol} className="watchlist-item">
            <span className="watchlist-name">
              {a.name} ({a.symbol})
            </span>
            <div className="watchlist-stats">
              <span className="watchlist-price">
                ${a.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`change-badge ${a.change >= 0 ? 'positive' : 'negative'}`}>
                {a.change >= 0 ? '+' : '-'}
                {Math.abs(a.change).toFixed(2)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
)
}

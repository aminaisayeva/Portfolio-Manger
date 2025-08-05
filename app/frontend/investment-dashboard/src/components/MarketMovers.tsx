import React from 'react'
import { Asset } from '../types'

interface MarketMoversProps {
  assets: Asset[]
}

export default function MarketMovers({ assets }: MarketMoversProps) {
  // static index data for now
  const indexes = [
    { label: 'S&P 500',    change: 0.65 },
    { label: 'Dow Jones',  change: -0.72 },
    { label: 'NASDAQ',     change: 0.14 },
  ]

  // average change across holdings
  const avgHolding =
    assets.reduce((sum, a) => sum + a.change, 0) / (assets.length || 1)

  // top 5 gainers & losers
  const sorted = [...assets].sort((a, b) => b.change - a.change)
  const gainers = sorted.slice(0, 5)
  const losers  = sorted.slice(-5).reverse()

  return (
    <div className="market-card">
      <h4 className="market-title">Market Movers</h4>

      {/* Index Movers */}
      <div className="index-row">
        {indexes.map(idx => (
          <div key={idx.label} className="index-box">
            <span className={idx.change >= 0 ? 'positive' : 'negative'}>
              {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
            </span>
            <div className="index-label">{idx.label}</div>
          </div>
        ))}
      </div>

      {/* Your Holdings */}
      <div className="holdings">
        <span>Your Holdings</span>
        <span className={avgHolding >= 0 ? 'positive' : 'negative'}>
          {avgHolding >= 0 ? '+' : ''}{avgHolding.toFixed(2)}%
        </span>
      </div>

      <hr />

      {/* Your Gainers */}
      <h5 className="subheading">Your Gainers</h5>
      <ul className="mover-list">
        {gainers.map(a => (
          <li key={a.symbol}>
            <span className="mover-name">{a.name}</span>
            <span className={a.change >= 0 ? 'positive' : 'negative'}>
              {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
            </span>
          </li>
        ))}
      </ul>

      <hr />

      {/* Your Losers */}
      <h5 className="subheading">Your Losers</h5>
      <ul className="mover-list">
        {losers.map(a => (
          <li key={a.symbol}>
            <span className="mover-name">{a.name}</span>
            <span className={a.change >= 0 ? 'positive' : 'negative'}>
              {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

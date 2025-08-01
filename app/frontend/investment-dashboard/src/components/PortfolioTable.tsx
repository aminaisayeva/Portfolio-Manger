// src/components/PortfolioTable.tsx
import React, { useState, useMemo } from 'react'
import { Asset } from '../types'
import './PortfolioTable.css'

type PortfolioTableProps = {
  assets: Asset[]
  onTrade: (symbol: string) => void
}

export default function PortfolioTable({
  assets,
  onTrade
}: PortfolioTableProps) {
  const [query, setQuery] = useState('')

  // memoize filtered list so we don’t recompute on every render
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return assets
    return assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.symbol.toLowerCase().includes(q)
    )
  }, [assets, query])

  return (
    <div className="table-wrapper">
      {/* search bar */}
      <div className="table-search">
        <input
          type="text"
          placeholder="🔍 Search holdings..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <table className="portfolio-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Volume</th>
            <th>Change</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.symbol}>
              <td>{a.name} <span className="symbol">({a.symbol})</span></td>
              <td>${a.price.toFixed(2)}</td>
              <td>{a.volume}</td>
              <td className={a.change >= 0 ? 'positive' : 'negative'}>
                {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
              </td>
              <td>
                <button onClick={() => onTrade(a.symbol)}>Trade</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="no-results">
                No holdings match “{query}”
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

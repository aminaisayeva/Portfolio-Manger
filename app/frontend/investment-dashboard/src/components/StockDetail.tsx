// src/components/StockDetail.tsx
import React, { useState, useMemo } from 'react'
import { Asset } from '../types'
import './StockDetail.css'

type Props = {
  stock: Asset
  onClose: () => void
}

export default function StockDetail({ stock, onClose }: Props) {
  // once‑only open/high/low
  const { open, high, low } = useMemo(() => {
    const o = (stock.price * (1 - Math.random()*0.02)).toFixed(2)
    const h = (stock.price * (1 + Math.random()*0.03)).toFixed(2)
    const l = (stock.price * (1 - Math.random()*0.03)).toFixed(2)
    return { open: o, high: h, low: l }
  }, [stock.price])

  const [vol, setVol]     = useState<string>('')      // string
  const [error, setError] = useState<string|null>(null)

  function submitBuy() {
    const n = parseInt(vol, 10)
    if (!vol || isNaN(n) || n <= 0) {
      setError('Please enter a positive integer')
      return
    }
    setError(null)
    console.log(`Buy ${n} of ${stock.symbol}`)
    alert(`Would buy ${n} shares of ${stock.symbol}`)
  }

  return (
    <div className="stock-detail">
      <button className="stock-detail__close" onClick={onClose}>×</button>
      <h2>{stock.name} ({stock.symbol})</h2>

      <div className="detail-price">
        ${stock.price.toFixed(2)}{' '}
        <span className={stock.change >= 0 ? 'positive' : 'negative'}>
          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
        </span>
      </div>

      <div className="detail-stats">
        <div>Open: ${open}</div>
        <div>High: ${high}</div>
        <div>Low:  ${low}</div>
      </div>

      <div className="detail-trade">
        <label>Volume to buy</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d*"
          placeholder="0"
          value={vol}
          onKeyPress={e => {
            if (!/[0-9]/.test(e.key)) e.preventDefault()
          }}
          onChange={e => {
            const v = e.target.value
            if (/^\d*$/.test(v)) setVol(v)
          }}
        />

        {error && <div className="error-banner">{error}</div>}

        <button onClick={submitBuy}>Buy</button>
      </div>
    </div>
  )
}

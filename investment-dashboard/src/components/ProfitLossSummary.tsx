// src/components/ProfitLossSummary.tsx

import React from 'react'
import { Portfolio } from '../types'

type Props = {
  data: Portfolio
}

export default function ProfitLossSummary({ data }: Props) {
  // Total profit
  const profitValue   = data.profitLoss
  const profitPercent = (profitValue / data.totalValue) * 100
  const profitPositive = profitValue >= 0

  // Avg. monthly growing
  const avgPct      = data.monthlyGrowth
  const avgPositive = avgPct >= 0
  const avgAmt      = (data.totalValue * avgPct) / 100

  // Best‑profit token
  const best = data.bestToken

  return (
    <div className="profit-summary">
      {/* Total Profit */}
      <div className="summary-item">
        <div className="item-label">Total profit</div>
        <div className={`item-value ${profitPositive ? 'positive' : 'negative'}`}>
          {profitPositive ? '+' : '-'}${Math.abs(profitValue).toFixed(2)}
        </div>
        <div className="item-subvalue">
          {profitPositive ? '+' : '-'}{Math.abs(profitPercent).toFixed(2)}%
        </div>
      </div>

      {/* Avg. Monthly Growing */}
      <div className="summary-item">
        <div className="item-label">Avg. monthly growing</div>
        <div className={`item-value ${avgPositive ? 'positive' : 'negative'}`}>
          {avgPositive ? '+' : '-'}{Math.abs(avgPct).toFixed(2)}%
          <span className="dropdown-arrow">▼</span>
        </div>
        <div className="item-subvalue">
          ~${avgAmt.toFixed(0)}
        </div>
      </div>

      {/* Best‑Profit Token */}
      <div className="summary-item token-item">
        <div className="item-label">Best‑profit token</div>
        <div className="token-card">
          <div className="token-icon">
            <img
              src={`https://cryptoicons.org/api/icon/${best.symbol.toLowerCase()}/48`}
              alt={best.name}
            />
          </div>
          <div className="token-info">
            <div className="token-name">{best.name}</div>
            <div className="token-symbol">{best.symbol}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

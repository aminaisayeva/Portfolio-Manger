// src/components/ProfitLossSummary.tsx
import React from 'react';
import { Asset } from '../types';

type ChartPoint = { date: string; value: number };

type Props = {
  history: ChartPoint[];
  periodDays: number;
  bestToken: Asset | null;
};

export default function ProfitLossSummary({ history, periodDays, bestToken }: Props) {
  if (history.length < 2) return null;

  // Total profit
  const first = history[0].value;
  const last  = history[history.length - 1].value;
  const profitValue   = last - first;
  const profitPercent = (profitValue / first) * 100;
  const profitPositive = profitValue >= 0;

  // Avg. monthly growth
  const monthlyGrowthPct = profitPercent / (periodDays / 30);
  const avgPct      = +monthlyGrowthPct.toFixed(2);
  const avgPositive = avgPct >= 0;
  const avgAmt      = (last - first) / (periodDays / 30);

  return (
    <div className="profit-summary">
      {/* Total Profit */}
      <div className="summary-item">
        <div className="item-label">Total profit ({periodDays}d)</div>
        <div className={`item-value ${profitPositive ? 'positive' : 'negative'}`}>
          {profitPositive ? '+' : '-'}${Math.abs(profitValue).toFixed(2)}
        </div>
        <div className="item-subvalue">
          {profitPositive ? '+' : '-'}{Math.abs(profitPercent).toFixed(2)}%
        </div>
      </div>

      {/* Avg. Monthly Growth */}
      <div className="summary-item">
        <div className="item-label">Avg. monthly growth</div>
        <div className={`item-value ${avgPositive ? 'positive' : 'negative'}`}>
          {avgPositive ? '+' : '-'}{Math.abs(avgPct).toFixed(2)}%
          <span className="dropdown-arrow">▼</span>
        </div>
        <div className="item-subvalue">
          ~${Math.abs(avgAmt).toFixed(2)} per month
        </div>
      </div>

      {/* Best-Profit Token */}
      <div className="summary-item token-item">
        <div className="item-label">Best-profit token</div>
        {bestToken ? (
          <div className="token-card">
            <div className="token-icon">
              <img
                src={`https://cryptoicons.org/api/icon/${bestToken.symbol.toLowerCase()}/48`}
                alt={bestToken.name}
              />
            </div>
            <div className="token-info">
              <div className="token-name">{bestToken.name}</div>
              <div className="token-symbol">{bestToken.symbol}</div>
            </div>
          </div>
        ) : (
          <div className="item-subvalue">N/A</div>
        )}
      </div>
    </div>
  );
}

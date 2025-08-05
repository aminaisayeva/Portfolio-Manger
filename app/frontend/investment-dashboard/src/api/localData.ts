// src/api/localData.ts

import raw from '../data/portfolioData.json'
import { Portfolio, Asset } from '../types'
import { subMonths, formatISO } from 'date-fns'

/**
 * Builds a fake Portfolio from your JSON:
 * - assets with random current prices
 * - totalValue, profitLoss, monthlyGrowth
 * - bestToken
 * - 12‑month history
 */
export async function fetchLocalPortfolio(): Promise<Portfolio> {
  const items = (raw as any).portfolio_item as Array<{
    pi_stockTicker: string
    pi_volume: number
    pi_buyPrice: number
  }>

  // 1) Build assets, random ±5% around buyPrice
  const assets: Asset[] = items.map(pi => {
    const variation = (Math.random() * 0.1) - 0.05        // ±5%
    const current  = pi.pi_buyPrice * (1 + variation)
    return {
      symbol: pi.pi_stockTicker,
      name:   pi.pi_stockTicker,                         // stub
      price:  Number(current.toFixed(2)),
      change: Number(((variation) * 100).toFixed(2)),
      volume: pi.pi_volume
    }
  })

  // 2) Totals
  const totalValue = assets.reduce((sum, a) => sum + a.price * a.volume, 0)
  const costBasis  = items.reduce((sum, pi, i) => sum + (pi.pi_buyPrice * assets[i].volume), 0)
  const profitLoss = totalValue - costBasis

  // 3) Monthly growth % over the year
  const monthlyGrowth = Number(((profitLoss / costBasis) * 100 / 12).toFixed(2))

  // 4) Best token by absolute P/L
  const bestToken = assets.reduce((best, a) => {
    const pi    = items.find(x => x.pi_stockTicker === a.symbol)!
    const pnl   = (a.price - pi.pi_buyPrice) * a.volume
    const bestPi= items.find(x => x.pi_stockTicker === best.symbol)!
    const bestPnl = (best.price - bestPi.pi_buyPrice) * best.volume
    return pnl > bestPnl ? a : best
  }, assets[0])

  // 5) Create a 12‑month history
  //    evenly interpolate from costBasis → totalValue, plus small noise
  const months = 12
  const history = Array.from({ length: months }).map((_, idx) => {
    const dateObj = subMonths(new Date(), months - 1 - idx)
    const isoDate = formatISO(dateObj, { representation: 'date' })  // "YYYY-MM-DD"
    // base value along line, plus ±1% jitter
    const base     = costBasis + ((totalValue - costBasis) / (months - 1)) * idx
    const jitter   = base * ((Math.random() * 0.02) - 0.01)        // ±1%
    const value    = Number((base + jitter).toFixed(2))
    return { date: isoDate, value }
  })

  return {
    totalValue:    Number(totalValue.toFixed(2)),
    profitLoss:    Number(profitLoss.toFixed(2)),
    monthlyGrowth,
    bestToken,
    history,
    assets
  }
}

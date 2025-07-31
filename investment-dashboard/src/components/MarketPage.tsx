// src/components/MarketPage.tsx
import React, { useState } from 'react'
import SearchBar   from './SearchBar'
import StockList   from './StockList'
import StockDetail from './StockDetail'
import { Asset }   from '../types'
import './MarketPage.css'

type MarketPageProps = {
  availableStocks: Asset[]
}

export default function MarketPage({ availableStocks }: MarketPageProps) {
  const [query,   setQuery]   = useState('')
  const [selected, setSelected] = useState<Asset | null>(null)

  // filter by symbol or name
  const filtered = availableStocks.filter(a =>
    a.symbol.toLowerCase().includes(query.toLowerCase()) ||
    a.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="market-container">
      {/* left pane */}
      <div className={`market-list ${selected ? '' : 'full-width'}`}>
        <SearchBar query={query} onQueryChange={setQuery} />
        <StockList stocks={filtered} onSelect={setSelected} />
      </div>

      {/* right pane */}
      {selected && (
        <div className="market-detail">
          <StockDetail
            stock={selected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  )
}

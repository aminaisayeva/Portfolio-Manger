import React, { useEffect, useState } from 'react'
import { fetchLocalPortfolio as fetchPortfolio } from './api/localData'
import Header from './components/Header'
import TotalAssetsSummary from './components/TotalAssetsSummary'
import PortfolioChart from './components/PortfolioChart'
import ProfitLossSummary from './components/ProfitLossSummary'
import PortfolioTable from './components/PortfolioTable'
import MarketMovers from './components/MarketMovers'
import Watchlist from './components/Watchlist'
import TradeModal from './components/TradeModal'
import { Portfolio } from './types'
import './components/styles.css'

export default function App() {
  const [portfolio, setPortfolio]     = useState<Portfolio|null>(null)
  const [period, setPeriod]           = useState('Last 7 days')
  const [tradeSymbol, setTradeSymbol] = useState<string|null>(null)
  const [modalOpen, setModalOpen]     = useState(false)

  useEffect(() => {
    fetchPortfolio().then(setPortfolio).catch(console.error)
  }, [])

  if (!portfolio) return <div>Loading…</div>

  return (
    <div className="app-container">
      <Header />
      <div className="content">
        <div className="main-left">
          <div className="chart-card">
            <TotalAssetsSummary
              total={portfolio.totalValue}
              changePercent={(portfolio.profitLoss/portfolio.totalValue)*100}
              changeAmount={portfolio.profitLoss}
              selectedPeriod={period}
              onPeriodChange={setPeriod}
            />
            <div className="card-header"><h3>Portfolio performance</h3></div>
            <PortfolioChart history={portfolio.history} />
          </div>

          <div className="profit-wrapper">
            <ProfitLossSummary data={portfolio}/>
          </div>

          <div className="table-card">
            <div className="card-header"><h3>Portfolio Overview</h3></div>
            <PortfolioTable
              assets={portfolio.assets}
              onTrade={sym => { setTradeSymbol(sym); setModalOpen(true) }}
            />
          </div>
        </div>

        <div className="main-right">
          <MarketMovers assets={portfolio.assets} />
          <Watchlist items={portfolio.assets.slice(0,3)} />
        </div>
      </div>

      {tradeSymbol && (
        <TradeModal 
          symbol={tradeSymbol} 
          isOpen={modalOpen} 
          onClose={()=>setModalOpen(false)} 
        />
      )}
    </div>
  )
}

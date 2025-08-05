// src/Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { fetchPortfolio } from './api/portfolio';
import TotalAssetsSummary, { PeriodOption } from './components/TotalAssetsSummary';
import PortfolioChart from './components/PortfolioChart';
import ProfitLossSummary from './components/ProfitLossSummary';
import PortfolioTable from './components/PortfolioTable';
import MarketMovers from './components/MarketMovers';
import Watchlist from './components/Watchlist';
import TradeModal from './components/TradeModal';
import { Portfolio, Asset } from './types';
import './components/styles.css';

type DashboardProps = { portfolios: Portfolio };

const periodConfig: Record<PeriodOption, { days: number; key: '7d' | '30d' | '90d' }> = {
  'Last 7 days':  { days: 7,  key: '7d'  },
  'Last 30 days': { days: 30, key: '30d' },
  'Last 90 days': { days: 90, key: '90d' },
};

export default function Dashboard({}: DashboardProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [period, setPeriod] = useState<PeriodOption>('Last 7 days');
  const [tradeSymbol, setTradeSymbol] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPortfolio().then(setPortfolio).catch(console.error);
  }, []);

  // Always call hooks in same order (useMemo before conditional return)
  const days = periodConfig[period].days;
  const key  = periodConfig[period].key;
  const filteredHistory = useMemo< { date: string; value: number }[] >(() => {
    if (!portfolio) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    return portfolio.history.filter(pt => parseISO(pt.date) >= cutoff);
  }, [portfolio, days]);

  if (!portfolio) {
    return <div>Loading…</div>;
  }

  // Compute summary stats
  const firstVal  = filteredHistory[0]?.value ?? portfolio.history[0].value;
  const lastVal   = filteredHistory[filteredHistory.length - 1]?.value ?? portfolio.totalValue;
  const changeAmt = lastVal - firstVal;
  const changePct = (changeAmt / firstVal) * 100;
  const bestToken = portfolio.bestTokens[key]!;  // assert non-null

  return (
    <>
      <div className="main-left">
        <div className="chart-card">
          <TotalAssetsSummary
            total={lastVal}
            changePercent={changePct}
            changeAmount={changeAmt}
            selectedPeriod={period}
            onPeriodChange={setPeriod}
          />
          <div className="card-header"><h3>Portfolio performance</h3></div>
          <PortfolioChart history={filteredHistory} periodDays={days} />
        </div>
        <div>
          <ProfitLossSummary
            history={filteredHistory}
            periodDays={days}
            bestToken={bestToken}
          />
        </div>
        <div className="table-card">
          <div className="card-header"><h3>Portfolio Overview</h3></div>
          <PortfolioTable
            assets={portfolio.assets}
            onTrade={sym => { setTradeSymbol(sym); setModalOpen(true); }}
          />
        </div>
      </div>
      <div className="main-right">
        <MarketMovers assets={portfolio.assets} />
        <Watchlist items={portfolio.assets.slice(0, 3)} />
      </div>
      {tradeSymbol && (
        <TradeModal symbol={tradeSymbol} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

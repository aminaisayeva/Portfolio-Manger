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
import { Portfolio } from './types';
import './components/styles.css';

type DashboardProps = { portfolios: Portfolio };

export default function Dashboard({ portfolios }: DashboardProps) {
  // state hooks
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [period, setPeriod] = useState<PeriodOption>('Last 7 days');
  const [tradeSymbol, setTradeSymbol] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // fetch on mount
  useEffect(() => {
    fetchPortfolio().then(setPortfolio).catch(console.error);
  }, []);

  // map period to days
  const periodToDays: Record<PeriodOption, number> = {
    'Last 7 days': 7,
    'Last 30 days': 30,
    'Last 90 days': 90,
  };
  const days = periodToDays[period];

  // prepare filtered history for chart (always call hook)
  const filteredHistory = useMemo(() => {
    if (!portfolio) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days + 1);
    return portfolio.history.filter(pt => parseISO(pt.date) >= cutoff);
  }, [portfolio, days]);

  // early return if data not yet loaded
  if (!portfolio) {
    return <div>Loading…</div>;
  }

  // compute values for summary now that portfolio is available
  const firstValue = filteredHistory[0]?.value ?? portfolio.history[0].value;
  const lastValue = filteredHistory[filteredHistory.length - 1]?.value ?? portfolio.totalValue;
  const changeAmount = lastValue - firstValue;
  const changePercent = (changeAmount / firstValue) * 100;

  return (
    <>
      <div className="main-left">
        <div className="chart-card">
          <TotalAssetsSummary
            total={lastValue}
            changePercent={changePercent}
            changeAmount={changeAmount}
            selectedPeriod={period}
            onPeriodChange={(p: PeriodOption) => setPeriod(p)}
          />
          <div className="card-header">
            <h3>Portfolio performance</h3>
          </div>
          <PortfolioChart history={filteredHistory} periodDays={days} />
        </div>

        <div>
          <ProfitLossSummary data={portfolio} />
        </div>

        <div className="table-card">
          <div className="card-header">
            <h3>Portfolio Overview</h3>
          </div>
          <PortfolioTable
            assets={portfolio.assets}
            onTrade={(sym: string) => {
              setTradeSymbol(sym);
              setModalOpen(true);
            }}
          />
        </div>
      </div>

      <div className="main-right">
        <MarketMovers assets={portfolio.assets} />
        <Watchlist items={portfolio.assets.slice(0, 3)} />
      </div>

      {tradeSymbol && (
        <TradeModal
          symbol={tradeSymbol}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

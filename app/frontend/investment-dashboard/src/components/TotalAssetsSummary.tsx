// src/components/TotalAssetsSummary.tsx
import React from 'react';
export type PeriodOption = 'Last 7 days' | 'Last 30 days' | 'Last 90 days';

type TotalAssetsProps = {
  total: number;
  changePercent: number;
  changeAmount: number;
  periodOptions?: PeriodOption[];
  selectedPeriod: PeriodOption;
  onPeriodChange: (period: PeriodOption) => void;
};

export default function TotalAssetsSummary({
  total, changePercent, changeAmount,
  periodOptions = ['Last 7 days','Last 30 days','Last 90 days'],
  selectedPeriod, onPeriodChange,
}: TotalAssetsProps) {
  const isPos = changePercent>=0;
  return (
    <div className="total-assets-card">
      <div className="left">
        <div className="label">Total assets</div>
        <div className="value">${total.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        <div className="changes">
          <span className={`change-badge percent ${isPos?'positive':'negative'}`}>{isPos?'▲':'▼'} {Math.abs(changePercent).toFixed(1)}%</span>
          <span className={`change-badge amount ${isPos?'positive':'negative'}`}>{isPos?'$':'-$'}{Math.abs(changeAmount).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        </div>
      </div>
      <div className="right">
        <select value={selectedPeriod} onChange={e=>onPeriodChange(e.target.value as PeriodOption)}>
          {periodOptions.map(o=> <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

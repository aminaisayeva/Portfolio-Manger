import React from 'react';
import { Asset } from '../types';

export default function PortfolioTable({
  assets,
  onTrade
}: {
  assets: Asset[];
  onTrade: (symbol: string) => void;
}) {
  return (
    <div className="table">
      <table>
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
          {assets.map(a => (
            <tr key={a.symbol}>
              <td>
                {a.name} <span className="symbol">{a.symbol}</span>
              </td>
              <td>${a.price.toFixed(2)}</td>
              <td>{(a.volume / 1e9).toFixed(2)}B</td>
              <td className={a.change >= 0 ? 'positive' : 'negative'}>
                {a.change.toFixed(2)}%
              </td>
              <td>
                <button onClick={() => onTrade(a.symbol)}>Trade</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

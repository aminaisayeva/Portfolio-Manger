// src/components/StockList.tsx
import React from 'react';
import { Asset } from '../types';
import './StockList.css';

type Props = {
  stocks: Asset[];
  onSelect: (a: Asset) => void;
};

export default function StockList({ stocks, onSelect }: Props) {
  return (
    <table className="stock-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Name</th>
          <th>Price</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map(a => (
          <tr key={a.symbol} onClick={() => onSelect(a)}>
            <td>{a.symbol}</td>
            <td>{a.name}</td>
            <td>${a.price.toFixed(2)}</td>
            <td className={a.change >= 0 ? 'positive' : 'negative'}>
              {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import React from 'react';

export default function SummaryCards() {
  const cards = [
    { label: 'Total Investment', value: '$350M', trend: 'up' },
    { label: 'Product Value',       value: '13B',  trend: 'down' },
    { label: 'Claimed Investment',  value: '520',  trend: 'up'   },
    { label: 'Production Project',  value: '154',  trend: 'down' },
    { label: 'Total Project',       value: '2.5M',trend: 'up'   }
  ];

  return (
    <div className="summary-cards">
      {cards.map(c => (
        <div className="card" key={c.label}>
          <div className="card-icon">📈</div>
          <div className="card-info">
            <div>{c.value}</div>
            <div className="card-label">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">LogoIpsum</div>
      <nav className="menu-bar">
        <button>Dashboard</button>
        <button>Market</button>
        <button>Transactions</button>
        <button>Wallet</button>
      </nav>
      <div className="header-right">
        <button className="icon-btn">🔔</button>
        <button className="icon-btn">⚙️</button>
      </div>
    </header>
  );
}

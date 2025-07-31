// in Header.tsx
type HeaderProps = {
  activeTab: 'dashboard' | 'market';
  onNav: (tab: 'dashboard' | 'market') => void;
};

export default function Header({ activeTab, onNav }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo">LogoIpsum</div>
      <nav className="menu-bar">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => onNav('dashboard')}
        >Dashboard</button>
        <button
          className={activeTab === 'market' ? 'active' : ''}
          onClick={() => onNav('market')}
        >Market</button>
        {/* other tabs as needed */}
      </nav>
      <div className="header-right">
        <button className="icon-btn">🔔</button>
        <button className="icon-btn">⚙️</button>
      </div>
    </header>
  );
}

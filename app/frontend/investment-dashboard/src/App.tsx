// src/App.tsx
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Dashboard from "./Dashboard"; //  existing Dashboard container
import MarketPage from "./components/MarketPage";
import { fetchLocalPortfolio as fetchPortfolio } from "./api/localData";
import { allStocks } from "./data/allStocks";
import { Portfolio } from "./types";
import "./components/styles.css";

type View = "dashboard" | "market";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  // load our dummy portfolio once
  useEffect(() => {
    fetchPortfolio().then(setPortfolio).catch(console.error);
  }, []);

  // show a loading state if dashboard needs it
  if (view === "dashboard" && !portfolio) {
    return <div className="loading">Loading portfolio…</div>;
  }

  return (
    <div className="app-container">
      {/* pass activeTab + nav callback into Header */}
      <Header activeTab={view} onNav={(tab) => setView(tab)} />

      <main className="content">
        {view === "dashboard" && portfolio && (
          <Dashboard portfolios={portfolio} />
        )}

        {view === "market" && <MarketPage availableStocks={allStocks} />}
      </main>
    </div>
  );
}

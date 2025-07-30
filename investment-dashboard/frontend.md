# Investment Dashboard

This is a React + TypeScript single‐page application that displays a user’s crypto/stock portfolio with charts, tables, and summary cards. At the moment because we are still developing our backend, to make it easier for all of us to see what is happening in the front, I am using dummy JSON data for now (via `fetchLocalPortfolio`) but is architected to swap in real REST endpoints later.

---

## Table of Contents
1. [Tech Stack](#tech-stack)  
2. [Getting Started](#getting-started)  
3. [Project Structure](#project-structure)  
4. [API Layer](#api-layer)  
5. [Data Types](#data-types)  
6. [Components](#components)  
7. [Data Flow & Interaction](#data-flow--interaction)  
8. [Switching to a Real REST Backend](#switching-to-a-real-rest-backend)  

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite  
- **Charts**: Recharts  
- **Date handling**: date‑fns  
- **Styling**: Plain CSS (single file `styles.css`)  

---

## Getting Started

1. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
    ```

2. **Run the dev‑server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Visit** `http://localhost:5173` in your browser.

---

## Project Structure

```
investment-dashboard/
├─ public/
│  └─ vite.svg
├─ src/
│  ├─ api/
│  │  ├─ localData.ts       ← loads & transforms JSON dummy data
│  │  └─ portfolio.ts       ← placeholder REST calls (stubs)
│  ├─ components/
│  │  ├─ Header.tsx
│  │  ├─ TotalAssetsSummary.tsx
│  │  ├─ PortfolioChart.tsx
│  │  ├─ ProfitLossSummary.tsx
│  │  ├─ PortfolioTable.tsx
│  │  ├─ MarketMovers.tsx
│  │  ├─ Watchlist.tsx
│  │  ├─ TradeModal.tsx
│  │  └─ styles.css
│  ├─ data/
│  │  └─ portfolioData.json ← seed JSON data
│  ├─ types/
│  │  └─ index.ts           ← shared TS types: `Asset`, `Portfolio`
│  ├─ App.tsx               ← main layout & state logic
│  └─ main.tsx              ← ReactDOM render
├─ package.json
└─ tsconfig.json
```

---

## API Layer

### `src/api/localData.ts`

* **Purpose**:

  * Loads `portfolioData.json`.
  * Builds an array of `Asset` with random ±5% current prices.
  * Computes `totalValue`, `profitLoss`, `monthlyGrowth`.
  * Picks the `bestToken`.
  * Generates a **12‑month** interpolated & jittered `history` array for the chart.

* **Key function**:

  ```ts
  export async function fetchLocalPortfolio(): Promise<Portfolio> { … }
  ```

### `src/api/portfolio.ts`

* **Purpose**:

  * Stubbed REST calls to demonstrate future integration.
  * `fetchPortfolio()` returns a small fake `Portfolio`.
  * `executeTrade(symbol, amount, type)` logs a mock trade.

---

## Data Types

    ```ts
    // src/types/index.ts

    export interface Asset {
    symbol: string;
    name: string;
    price: number;
    change: number;   // % change vs buyPrice
    volume: number;
    }

    export interface Portfolio {
    totalValue: number;
    profitLoss: number;
    monthlyGrowth: number;                 // % over 12 months
    bestToken: Asset;
    history: { date: string; value: number }[];  // for chart
    assets: Asset[];                       // portfolio table + watchlist
    }
    ```

---

## Components

### `Header.tsx`

Top nav bar with logo, menu buttons, and icons.

### `TotalAssetsSummary.tsx`

Displays **Total assets**, ▲/▼ % and \$ change badges, and a period dropdown (`7d/30d/90d`).
Props:

* `total: number`
* `changePercent: number`
* `changeAmount: number`
* `periodOptions: string[]`
* `selectedPeriod: string`
* `onPeriodChange: Dispatch<SetStateAction<string>>`

### `PortfolioChart.tsx`

Recharts **AreaChart** showing portfolio value over time.

* X‑axis: formatted `MMM yyyy`
* Y‑axis: `$####`
* Gradient fill under the curve
* A `ReferenceDot` marks the max point with a custom SVG label.

### `ProfitLossSummary.tsx`

Three‐column summary:

1. **Total Profit** (+/\$ or –/\$)
2. **Avg. Monthly Growing** with ▼ arrow
3. **Best‐Profit Token** card with icon and symbol

### `PortfolioTable.tsx`

Table of assets with:

* Name & symbol
* Current price
* Volume
* % change (green or red)
* “Trade” button → opens `TradeModal`

### `MarketMovers.tsx`

Right‐sidebar card showing:

* Three static index movers (S\&P 500, Dow Jones, NASDAQ) in colored boxes
* “Your Holdings” average change
* Top 5 **Gainers** and **Losers** from `assets[]`

### `Watchlist.tsx`

Right‐sidebar card showing our top 3 assets (symbol, price, % badge).
Styled like Gainers/Losers.

### `TradeModal.tsx`

A portal‐rendered modal to **Buy/Sell**:

* Toggle Buy vs Sell
* Input number of shares
* Submit calls `executeTrade(...)`

---

## Data Flow & Interaction

1. **App mounts** → calls `fetchLocalPortfolio()`
2. **Portfolio state** is set to a complete `Portfolio` object.
3. **Period selection** (`7d/30d/90d`) in `App.tsx` filters the 12‑month `history` into the `history` slice.
4. **`TotalAssetsSummary`** shows the last‐value of that slice and computes Δ vs first slice.
5. **`PortfolioChart`** receives only that filtered `history`.
6. **`PortfolioTable`, `MarketMovers`, `Watchlist`** consume the full `assets[]`.
7. **Trade button** → `TradeModal` opens → calls stubbed `executeTrade` → closes.

---

## Note to self: switching to a REAL REST backend

1. **remove** or rename `src/api/localData.ts`.
2. **implement** real HTTP calls in `src/api/portfolio.ts` (e.g. using `fetch('/api/portfolio')`).
3. **update** `App.tsx` to import `fetchPortfolio()` from `api/portfolio` instead of `localData`.
4. **ensure** backend’s JSON shape matches the `Portfolio` type (or add a transformer).


---

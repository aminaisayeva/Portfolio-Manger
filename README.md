# ThemisTrends — Portfolio Management System

A comprehensive portfolio management & trading platform built with **React + TypeScript (Vite)** on the frontend and **Flask + MySQL** on the backend. It provides live market data, portfolio tracking, trading, and analytics.

---

## Table of Contents

- [Quickstart (Copy-Paste)](#quickstart-copy-paste)
- [Prerequisites & Version Checks](#prerequisites--version-checks)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Backend Setup (Flask)](#backend-setup-flask)
- Database Setup (MySQL)

  - [Option A: One-shot with ](#option-a-one-shot-with-mastersql)[`master.sql`](#option-a-one-shot-with-mastersql)
  - [Option B: Run files separately](#option-b-run-files-separately)

- [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Run the Stack](#run-the-stack)
- [Port & URL Matrix](#port--url-matrix)
- [Core Features](#core-features)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Contributing](#contributing)

---

## Quickstart (Copy-Paste)

> Works on macOS/Linux (bash/zsh) and Windows (PowerShell). Adjust paths as needed.

### 1) Clone

```bash
git clone <repository-url>
cd portfolio_manager_team15
```

### 2) Backend (create venv, install, run)

```bash
# macOS/Linux
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # then edit values (see below)
python app.py
```

```powershell
# Windows (PowerShell)
cd backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env  # then edit values (see below)
python app.py
```

### 3) Database (seed)

Choose **Option A** (`master.sql`) or **Option B** (individual files) under [Database Setup](#database-setup-mysql).

### 4) Frontend (install, run)

```bash
# from project root
cd client
npm install
npm run dev
```

---

## Prerequisites & Version Checks

- **Node.js** ≥ 16

  ```bash
  node -v
  ```

- **npm** ≥ 8 (or use pnpm/yarn if your project does)

  ```bash
  npm -v
  ```

- **Python** ≥ 3.8

  ```bash
  python --version    # or: python3 --version
  ```

- **MySQL Server** (local or remote)

  ```bash
  mysql --version
  ```

- **Git**

  ```bash
  git --version
  ```

> Tip (Windows): If `mysql` isn’t recognized, add MySQL’s `bin` folder to PATH or run with full path, e.g.
> `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p`

---

## Project Structure

```
portfolio_manager_team15/
├── client/                       # Frontend (React + TS + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── portfolio/        # Portfolio-specific components
│   │   │   └── ui/               # Reusable UI components
│   │   ├── pages/                # Routes / pages
│   │   ├── hooks/                # Custom React hooks
│   │   └── lib/                  # Utilities
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Flask API server
│   ├── app.py                    # Main Flask application
│   ├── crud.py                   # DB operations
│   ├── math_operations.py        # Financial calculations
│   ├── requirements.txt
│   └── db/                       # SQL files (see below)
│       ├── master.sql
│       ├── schema.sql
│       ├── procedures.sql
│       ├── triggers.sql
│       ├── scheduler.sql
│       └── data.sql
└── shared/                       # Shared types / assets (if any)
```

---

## Environment Variables

Create **`.env`**:

```env
# MySQL
DB_PASSWORD=your_mysql_password
```

---

## Backend Setup (Flask)

```bash
cd backend
# Create and activate virtual environment
python3 -m venv .venv && source .venv/bin/activate    # macOS/Linux
# or: python -m venv .venv; .\.venv\Scripts\Activate.ps1   # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
# Flask will bind to default http://localhost:8000
```

**Included libs (from project docs):**

- `Flask` (web framework)
- `MySQL` driver (as required by your `requirements.txt`)
- `yfinance` (market data)
- `requests-cache` (API caching)

---

## Database Setup (MySQL)

### Option A: One-shot with `master.sql`

This runs everything in the correct order: schema → procedures → triggers → scheduler → data.

```bash
# macOS/Linux
mysql -u root -p portfolio_manager < backend/db/master.sql
```

```powershell
# Windows (PowerShell)
mysql -u root -p portfolio_manager < backend\db\master.sql
```

### Option B: Run files separately

```bash
# macOS/Linux
mysql -u root -p portfolio_manager < backend/db/schema.sql
mysql -u root -p portfolio_manager < backend/db/procedures.sql
mysql -u root -p portfolio_manager < backend/db/triggers.sql
mysql -u root -p portfolio_manager < backend/db/scheduler.sql
mysql -u root -p portfolio_manager < backend/db/data.sql
```

```powershell
# Windows (PowerShell)
mysql -u root -p portfolio_manager < backend\db\schema.sql
mysql -u root -p portfolio_manager < backend\db\procedures.sql
mysql -u root -p portfolio_manager < backend\db\triggers.sql
mysql -u root -p portfolio_manager < backend\db\scheduler.sql
mysql -u root -p portfolio_manager < backend\db\data.sql
```

**What each file does:**

- `schema.sql` — tables, PK/FK constraints
- `procedures.sql` — stored procedures (e.g., portfolio snapshot rebuilds)
- `triggers.sql` — automatic updates on insert/update
- `scheduler.sql` — scheduled DB events (nightly jobs / cleanup)
- `data.sql` — seed data (e.g., initial \$25,000 cash, sample holdings, transactions)
- `master.sql` — runs all of the above in order

---

## Frontend Setup (React + Vite)

```bash
cd client
npm install
npm run dev
# Default UI at http://localhost:5000 (as configured in this project)
```

---

## Run the Stack

1. **Start MySQL** and ensure the DB is created/seeded.
2. **Start Backend (Flask)**:

```bash
cd backend
source .venv/bin/activate     # macOS/Linux
# or: .\.venv\Scripts\Activate.ps1   # Windows
python app.py
```

3. **Start Frontend (React)**:

```bash
cd client
npm run dev
```

4. **Verify**:

- API health: open `http://localhost:8000/api/portfolio`
- UI: open `http://localhost:5000`

---

## Port & URL Matrix

| Component | Default Host       | Default Port | How to change                               |
| --------- | ------------------ | ------------ | ------------------------------------------- |
| Backend   | `http://localhost` | `8000`       | `BACKEND_PORT` in `backend/.env`            |
| Frontend  | `http://localhost` | `5000`       | Vite config or `npm run dev -- --port 5000` |
| MySQL     | `127.0.0.1`        | `3306`       | `DB_PORT` in `backend/.env`                 |

---

## Core Features

**Core functionality**

- Portfolio management (holdings, gains/losses, performance)
- Real-time trading (buy/sell)
- Market data (indices, economic indicators)
- Advanced analytics (Sharpe, beta, volatility, alpha)
- Transaction history with filtering & pagination

**Key features**

- Real-time data via `yfinance`
- Sector allocation & correlation analysis
- Market overview (S\&P 500, NASDAQ, Dow, Russell 2000)
- Economic indicators (treasuries, commodities, FX)
- Responsive UI (Tailwind, Recharts, Lucide)

**Tech stack**

- Frontend: React 18 + TypeScript, Vite, TanStack Query, Recharts, Tailwind
- Backend: Flask, `yfinance`, `requests-cache`
- DB: MySQL (portfolio items, transactions, cash balance, history)

---

## API Endpoints

**Portfolio & Cash**

- `GET /api/portfolio` — portfolio data & holdings
- `POST /api/trade` - Handles buy/sell requests from React frontend
- `POST /api/add-funds` — add funds to cash account

**Trading**

- `POST /api/buy-stock` — buy shares
- `POST /api/sell-stock` — sell shares

> Note: Some prior docs used `POST /api/trade` for both buy/sell. If your backend exposes a single trade endpoint, keep using it; otherwise use the explicit `buy-stock` / `sell-stock`.

**Market Data**

- `GET /api/market_movers` — major indices
- `GET /api/stocks/:symbol` — individual stock data
- `GET /api/market_performance` — intraday performance
- `GET /api/sector_performance` — sector ETF data
- `GET /api/economic_indicators` — macro indicators

**Transactions**

- `GET /api/transactions` — full transaction history

**Integration**

This Flask backend connects to existing MySQL database using:

- `portfolio_item` table for current holdings
- `portfolio_transaction` table for trades
- `yfinance` for real-time stock prices
- existing `get_portfolio()` and `handle_trade()` functions

## Usage Guide

**Dashboard**

- Overview: total value, P/L, cash
- Performance: realized vs. unrealized
- Charts: historical performance
- Quick actions: buy/sell, add funds

**Portfolio**

- Real-time holdings
- Search, filter, sort (value, gain/loss, shares, symbol)
- Paginated (e.g., 10/page)
- Inline trading actions

**Trading Center**

- History: all buys/sells
- Metrics: capital deployed, realized gains, activity
- Filters: by symbol, type, date
- Pagination

**Analytics**

- Total return, Sharpe, beta, volatility, alpha
- Sector allocation visualization
- Correlation matrix
- Timeframes: 1M / 3M / 6M / 1Y / All

**Market**

- Indices: S\&P 500, NASDAQ, Dow, Russell 2000
- Intraday market performance
- Economic indicators
- Sector ETF performance

---

## Troubleshooting

**Backend won’t start**

- Verify virtualenv active and `pip install -r requirements.txt` completed
- Check `backend/.env` DB settings (host/user/password/database)
- Ensure MySQL is running and reachable from the backend host/port

**Frontend can’t fetch API**

- Confirm backend is on `http://localhost:8000` (or your chosen port)
- Set `client/.env` → `VITE_API_BASE=http://localhost:8000`
- If using a Vite proxy, ensure the proxy target matches the backend port

**MySQL import issues**

- Ensure DB exists: `CREATE DATABASE portfolio_manager;`
- Use the database in your import command: `mysql -u root -p portfolio_manager < path/to/sql.sql`
- Windows path quoting: wrap full path in quotes if it includes spaces

**Market data not updating**

- Temporary `yfinance` issues: retry later
- Clear or shorten cache if `requests-cache` is enabled too aggressively

**Permission errors (Windows)**

- PowerShell execution policy:
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
  Then reopen PowerShell

---

## Security Notes

- Always use **parameterized queries** (as implemented in `crud.py`).
- Keep \*\*secrets in \*\***`.env`** (never commit to VCS).
- Configure **CORS** to allow your frontend origin only during development.
- Validate all input on both client and server.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Test thoroughly (API & UI)
5. Open a Pull Request with a clear description

---
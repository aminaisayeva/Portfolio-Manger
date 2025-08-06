-- Create the database
DROP DATABASE IF EXISTS portfolio_manager;
CREATE DATABASE IF NOT EXISTS portfolio_manager;
USE portfolio_manager;

-- ============================
-- TABLE DEFINITIONS
-- ============================

-- Table: Cash Accounts
CREATE TABLE IF NOT EXISTS cash_account (
    ca_id INT AUTO_INCREMENT PRIMARY KEY,
    ca_name VARCHAR(50) NOT NULL,
    ca_balance FLOAT NOT NULL
);

-- Table: Cash Transactions (for deposits/withdrawals)
CREATE TABLE IF NOT EXISTS cash_transaction (
    ct_id INT AUTO_INCREMENT PRIMARY KEY,
    ct_ca_id INT NOT NULL DEFAULT 1, -- FK to cash_account
    ct_type ENUM('DEPOSIT', 'WITHDRAWAL') NOT NULL,
    ct_amount FLOAT NOT NULL,
    ct_date DATE NOT NULL,
    ct_note VARCHAR(100),
    FOREIGN KEY (ct_ca_id) REFERENCES cash_account(ca_id)
);

-- Table: Portfolio Items (auto-calculated holdings)
CREATE TABLE IF NOT EXISTS portfolio_item (
    pi_symbol VARCHAR(10) PRIMARY KEY,
    pi_name VARCHAR(50),
    pi_sector VARCHAR(50),
    pi_total_quantity FLOAT NOT NULL,
    pi_weighted_average_price FLOAT NOT NULL
);

-- Table: Portfolio Transactions (user trades)
CREATE TABLE IF NOT EXISTS portfolio_transaction (
    pt_id INT AUTO_INCREMENT PRIMARY KEY,
    pt_symbol VARCHAR(10) NOT NULL,
    pt_name VARCHAR(50) NOT NULL,
    pt_sector VARCHAR(50),
    pt_quantity FLOAT NOT NULL,
    pt_price FLOAT NOT NULL,
    pt_type ENUM('BUY', 'SELL') NOT NULL,
    pt_date DATE NOT NULL,
    pt_ca_id INT NOT NULL DEFAULT 1,
    FOREIGN KEY (pt_ca_id) REFERENCES cash_account(ca_id)
);

-- Table: Daily Portfolio Snapshots
CREATE TABLE IF NOT EXISTS portfolio_snapshot (
    ps_id INT AUTO_INCREMENT PRIMARY KEY,
    ps_date DATE NOT NULL UNIQUE,
    ps_total_cash FLOAT NOT NULL,
    ps_total_equity FLOAT NOT NULL,
    ps_total_value FLOAT NOT NULL
);

-- Table: Watchlist (user maintained)
CREATE TABLE IF NOT EXISTS watchlist_item (
    wi_id INT AUTO_INCREMENT PRIMARY KEY,
    wi_symbol VARCHAR(10) NOT NULL UNIQUE,
    wi_sector VARCHAR(50),
    wi_added_date DATE NOT NULL
);
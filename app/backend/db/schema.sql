-- Create the database
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
    ct_ca_id INT NOT NULL, -- FK to cash_account
    ct_type ENUM('DEPOSIT', 'WITHDRAWAL') NOT NULL,
    ct_amount FLOAT NOT NULL,
    ct_date DATE NOT NULL,
    ct_note VARCHAR(100),
    FOREIGN KEY (ct_ca_id) REFERENCES cash_account(ca_id)
);

-- Table: Portfolio Items (auto-calculated holdings)
CREATE TABLE IF NOT EXISTS portfolio_item (
    pi_symbol VARCHAR(10) PRIMARY KEY,
    pi_sector VARCHAR(50),
    pi_total_quantity FLOAT NOT NULL,
    pi_weighted_average_price FLOAT NOT NULL
);

-- Table: Portfolio Transactions (user trades)
CREATE TABLE IF NOT EXISTS portfolio_transaction (
    pt_id INT AUTO_INCREMENT PRIMARY KEY,
    pt_symbol VARCHAR(10) NOT NULL,
    pt_quantity FLOAT NOT NULL,
    pt_price FLOAT NOT NULL,
    pt_type ENUM('BUY', 'SELL') NOT NULL,
    pt_date DATE NOT NULL,
    pt_ca_id INT NOT NULL,
    FOREIGN KEY (pt_ca_id) REFERENCES cash_account(ca_id)
);

-- Table: Stock Price History (auto-populated)
CREATE TABLE IF NOT EXISTS stock_price_history (
    sp_id INT AUTO_INCREMENT PRIMARY KEY,
    sp_symbol VARCHAR(10) NOT NULL,
    sp_date DATE NOT NULL,
    sp_closing_price FLOAT NOT NULL,
    UNIQUE(sp_symbol, sp_date)
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

-- ============================
-- TRIGGERS
-- ============================

DELIMITER $$

-- Trigger 1: Cash Transaction -> Update Cash Account
CREATE TRIGGER trg_cash_transaction_insert
AFTER INSERT ON cash_transaction
FOR EACH ROW
BEGIN
    IF NEW.ct_type = 'DEPOSIT' THEN
        UPDATE cash_account 
        SET ca_balance = ca_balance + NEW.ct_amount
        WHERE ca_id = NEW.ct_ca_id;
    ELSEIF NEW.ct_type = 'WITHDRAWAL' THEN
        UPDATE cash_account 
        SET ca_balance = ca_balance - NEW.ct_amount
        WHERE ca_id = NEW.ct_ca_id;
    END IF;
END $$

-- Trigger 2: Overdraft & Oversell Prevention
CREATE TRIGGER trg_portfolio_transaction_before_insert
BEFORE INSERT ON portfolio_transaction
FOR EACH ROW
BEGIN
    -- Overdraft Protection for BUY
    IF NEW.pt_type = 'BUY' THEN
        IF (SELECT ca_balance FROM cash_account WHERE ca_id = NEW.pt_ca_id) < (NEW.pt_quantity * NEW.pt_price) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Insufficient funds: Cannot complete BUY transaction.';
        END IF;
    END IF;

    -- Over-Sell Protection for SELL
    IF NEW.pt_type = 'SELL' THEN
        IF (SELECT COALESCE(SUM(pt_quantity * IF(pt_type='BUY',1,-1)),0) 
            FROM portfolio_transaction 
            WHERE pt_symbol = NEW.pt_symbol) < NEW.pt_quantity THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Insufficient shares: Cannot complete SELL transaction.';
        END IF;
    END IF;
END $$

-- Trigger 3: Portfolio Transaction -> Create Cash Transaction
CREATE TRIGGER trg_portfolio_transaction_insert
AFTER INSERT ON portfolio_transaction
FOR EACH ROW
BEGIN
    IF NEW.pt_type = 'BUY' THEN
        -- Create a withdrawal in cash_transaction for the purchase
        INSERT INTO cash_transaction (ct_ca_id, ct_type, ct_amount, ct_date, ct_note)
        VALUES (NEW.pt_ca_id, 'WITHDRAWAL', (NEW.pt_quantity * NEW.pt_price), NEW.pt_date,
                CONCAT('Purchase of ', NEW.pt_quantity, ' shares of ', NEW.pt_symbol));
    ELSEIF NEW.pt_type = 'SELL' THEN
        -- Create a deposit in cash_transaction for the sale
        INSERT INTO cash_transaction (ct_ca_id, ct_type, ct_amount, ct_date, ct_note)
        VALUES (NEW.pt_ca_id, 'DEPOSIT', (NEW.pt_quantity * NEW.pt_price), NEW.pt_date,
                CONCAT('Sale of ', NEW.pt_quantity, ' shares of ', NEW.pt_symbol));
    END IF;

    -- Auto-recalculate holdings & snapshot after each trade
    CALL recalculate_portfolio_items();
    CALL recalculate_portfolio_snapshot();
END $$

DELIMITER ;

-- ============================
-- STORED PROCEDURES
-- ============================

DELIMITER $$

-- Procedure 1: Recalculate Portfolio Items
CREATE PROCEDURE recalculate_portfolio_items()
BEGIN
    DELETE FROM portfolio_item;

    INSERT INTO portfolio_item (pi_symbol, pi_sector, pi_total_quantity, pi_weighted_average_price)
    SELECT 
        pt_symbol,
        NULL AS pi_sector,
        SUM(CASE WHEN pt_type='BUY' THEN pt_quantity ELSE -pt_quantity END) AS total_qty,
        (
            SUM(CASE WHEN pt_type='BUY' THEN pt_quantity * pt_price ELSE 0 END) /
            NULLIF(SUM(CASE WHEN pt_type='BUY' THEN pt_quantity ELSE 0 END), 0)
        ) AS weighted_avg_price
    FROM portfolio_transaction
    GROUP BY pt_symbol
    HAVING total_qty > 0;
END $$

-- Procedure 2: Recalculate Portfolio Snapshot
CREATE PROCEDURE recalculate_portfolio_snapshot()
BEGIN
    DECLARE v_cash FLOAT DEFAULT 0;
    DECLARE v_equity FLOAT DEFAULT 0;
    DECLARE v_total FLOAT DEFAULT 0;

    -- Cash balance
    SELECT COALESCE(SUM(ca_balance),0) INTO v_cash FROM cash_account;

    -- Equity value (latest price × quantity)
    SELECT COALESCE(SUM(pi_total_quantity * sp_closing_price),0) INTO v_equity
    FROM portfolio_item
    JOIN stock_price_history ON pi_symbol = sp_symbol
    WHERE sp_date = CURDATE();

    SET v_total = v_cash + v_equity;

    -- Insert or update today's snapshot
    INSERT INTO portfolio_snapshot (ps_date, ps_total_cash, ps_total_equity, ps_total_value)
    VALUES (CURDATE(), v_cash, v_equity, v_total)
    ON DUPLICATE KEY UPDATE 
        ps_total_cash = v_cash,
        ps_total_equity = v_equity,
        ps_total_value = v_total;
END $$

DELIMITER ;

-- ============================
-- EVENT SCHEDULER (NIGHTLY UPDATES)
-- ============================

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS evt_recalculate_portfolio_items
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
    CALL recalculate_portfolio_items();

CREATE EVENT IF NOT EXISTS evt_recalculate_portfolio_snapshot
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
    CALL recalculate_portfolio_snapshot();

USE portfolio_manager;

-- ============================
-- 1️⃣ INSERT CASH ACCOUNTS
-- ============================
INSERT INTO cash_account (ca_name, ca_balance) VALUES 
('Brokerage - Main', 0),
('Brokerage - Retirement', 0);

-- ============================
-- 2️⃣ INSERT CASH TRANSACTIONS
-- ============================
INSERT INTO cash_transaction (ct_ca_id, ct_type, ct_amount, ct_date, ct_note) VALUES
(1, 'DEPOSIT', 10000, '2025-06-01', 'Initial deposit'),
(2, 'DEPOSIT', 5000,  '2025-06-01', 'Initial deposit'),
(1, 'DEPOSIT', 2000,  '2025-06-15', 'Mid-month funding'),
(2, 'DEPOSIT', 1000,  '2025-07-05', 'Extra deposit');

-- ============================
-- 3️⃣ INSERT PORTFOLIO TRANSACTIONS (BUY/SELL)
-- ============================
INSERT INTO portfolio_transaction (pt_symbol, pt_quantity, pt_price, pt_type, pt_date, pt_ca_id) VALUES
-- June buys
('AAPL', 20, 150.00, 'BUY', '2025-06-02', 1),
('MSFT', 10, 320.00, 'BUY', '2025-06-03', 1),
('TSLA', 5,  700.00, 'BUY', '2025-06-05', 2),
('AMZN', 8,  120.00, 'BUY', '2025-06-07', 1),

-- More buys later in June
('AAPL', 10, 155.00, 'BUY', '2025-06-15', 1),
('TSLA', 3,  710.00, 'BUY', '2025-06-18', 2),

-- Early July buys
('MSFT', 5,  330.00, 'BUY', '2025-07-02', 1),
('AMZN', 4,  125.00, 'BUY', '2025-07-03', 1),

-- Mid-July sells
('AAPL', 5,  160.00, 'SELL', '2025-07-10', 1),
('TSLA', 2,  725.00, 'SELL', '2025-07-12', 2),

-- Late July buys & sells
('AAPL', 5,  158.00, 'BUY', '2025-07-18', 1),
('MSFT', 3,  340.00, 'SELL', '2025-07-20', 1),
('AMZN', 2,  130.00, 'BUY', '2025-07-21', 1);

-- ============================
-- 4️⃣ INSERT WATCHLIST ITEMS (NO PRICE IMPACT)
-- ============================
INSERT INTO watchlist_item (wi_symbol, wi_sector, wi_added_date) VALUES
('GOOGL', 'Technology', '2025-06-01'),
('NVDA',  'Semiconductors', '2025-06-05'),
('NFLX',  'Entertainment', '2025-07-01');

-- ============================
-- 5️⃣ AUTO-GENERATE STOCK PRICE HISTORY (TRADED SYMBOLS ONLY)
-- ============================
DELIMITER $$

DROP PROCEDURE IF EXISTS populate_stock_price_history $$
CREATE PROCEDURE populate_stock_price_history()
BEGIN
    DECLARE v_date DATE;
    DECLARE v_today DATE;
    DECLARE v_symbol VARCHAR(10);
    DECLARE v_price FLOAT;
    DECLARE v_base_price FLOAT;
    DECLARE v_pct_change FLOAT;

    SET v_date = '2025-06-01';
    SET v_today = CURDATE();

    -- Temporary table for traded symbols with base price
    DROP TEMPORARY TABLE IF EXISTS temp_symbols;
    CREATE TEMPORARY TABLE temp_symbols (symbol VARCHAR(10), base_price FLOAT);

    INSERT INTO temp_symbols (symbol, base_price)
    SELECT pt_symbol, MIN(pt_price) AS base_price 
    FROM portfolio_transaction 
    GROUP BY pt_symbol;

    -- Loop over dates
    WHILE v_date <= v_today DO
        -- Loop over each traded symbol
        BEGIN
            DECLARE done INT DEFAULT FALSE;
            DECLARE sym_cursor CURSOR FOR SELECT symbol, base_price FROM temp_symbols;
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

            OPEN sym_cursor;
            read_loop: LOOP
                FETCH sym_cursor INTO v_symbol, v_base_price;
                IF done THEN 
                    LEAVE read_loop;
                END IF;

                -- Daily price change: random between -1% and +1%
                SET v_pct_change = (RAND() * 2 - 1) / 100;

                -- Use prior day's price if exists, else base price
                IF EXISTS (SELECT 1 FROM stock_price_history WHERE sp_symbol = v_symbol AND sp_date = DATE_SUB(v_date, INTERVAL 1 DAY)) THEN
                    SELECT sp_closing_price INTO v_price
                    FROM stock_price_history 
                    WHERE sp_symbol = v_symbol AND sp_date = DATE_SUB(v_date, INTERVAL 1 DAY);
                    SET v_price = ROUND(v_price * (1 + v_pct_change), 2);
                ELSE
                    SET v_price = ROUND(v_base_price * (1 + v_pct_change), 2);
                END IF;

                INSERT INTO stock_price_history (sp_symbol, sp_date, sp_closing_price)
                VALUES (v_symbol, v_date, v_price)
                ON DUPLICATE KEY UPDATE sp_closing_price = v_price;

            END LOOP;
            CLOSE sym_cursor;
        END;

        SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);
    END WHILE;
END $$

DELIMITER ;

CALL populate_stock_price_history();

-- ============================
-- 6️⃣ RECALCULATE HOLDINGS
-- ============================
CALL recalculate_portfolio_items();

-- ============================
-- 7️⃣ BACKFILL PORTFOLIO SNAPSHOTS (DAILY)
-- ============================
DELIMITER $$

DROP PROCEDURE IF EXISTS backfill_portfolio_snapshots $$
CREATE PROCEDURE backfill_portfolio_snapshots()
BEGIN
    DECLARE v_date DATE;
    DECLARE v_today DATE;
    DECLARE v_cash FLOAT;
    DECLARE v_equity FLOAT;
    DECLARE v_total FLOAT;

    SET v_date = '2025-06-01';
    SET v_today = CURDATE();

    WHILE v_date <= v_today DO
        -- 1. Calculate cash balance as of this date
        SELECT COALESCE(SUM(
            CASE 
                WHEN ct_type='DEPOSIT' THEN ct_amount 
                WHEN ct_type='WITHDRAWAL' THEN -ct_amount 
                ELSE 0 END), 0) 
        INTO v_cash
        FROM cash_transaction
        WHERE ct_date <= v_date;

        -- 2. Calculate equity: holdings * price on that date
        SELECT COALESCE(SUM(qty * sp_closing_price), 0) INTO v_equity
        FROM (
            SELECT pt_symbol, 
                   SUM(CASE WHEN pt_type='BUY' THEN pt_quantity ELSE -pt_quantity END) AS qty
            FROM portfolio_transaction
            WHERE pt_date <= v_date
            GROUP BY pt_symbol
        ) AS holdings
        JOIN stock_price_history 
            ON holdings.pt_symbol = stock_price_history.sp_symbol
        WHERE sp_date = v_date AND qty > 0;

        -- 3. Total portfolio value
        SET v_total = v_cash + v_equity;

        -- 4. Insert or update snapshot
        INSERT INTO portfolio_snapshot (ps_date, ps_total_cash, ps_total_equity, ps_total_value)
        VALUES (v_date, v_cash, v_equity, v_total)
        ON DUPLICATE KEY UPDATE 
            ps_total_cash = v_cash,
            ps_total_equity = v_equity,
            ps_total_value = v_total;

        -- Move to next day
        SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);
    END WHILE;
END $$

DELIMITER ;

-- Run the procedure
CALL backfill_portfolio_snapshots();

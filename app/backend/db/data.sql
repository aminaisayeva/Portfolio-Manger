USE portfolio_manager;

-- ============================
-- 1️⃣ INSERT CASH ACCOUNTS
-- ============================
INSERT INTO cash_account (ca_name, ca_balance) VALUES 
('Brokerage - Main', 0);

-- ============================
-- 2️⃣ INSERT CASH TRANSACTIONS
-- ============================
INSERT INTO cash_transaction (ct_ca_id, ct_type, ct_amount, ct_date, ct_note) VALUES
(1, 'DEPOSIT', 25000, '2025-06-01', 'Initial deposit');
-- ============================
-- 3️⃣ INSERT PORTFOLIO TRANSACTIONS (BUY/SELL)
-- ============================
INSERT INTO portfolio_transaction (pt_symbol, pt_name, pt_sector, pt_industry, pt_quantity, pt_price, pt_type, pt_date) VALUES
-- Gainer buys
('NVDA', 'NVIDIA Corp', 'Technology', 'Semiconductors', 18, 97.64, 'BUY', '2025-04-07'),
('META', 'Meta Platforms Inc', 'Communication Services', 'Internet Content & Information', 3, 504.73, 'BUY', '2025-04-07'),
('MSFT', 'Microsoft Corporation', 'Technology', 'Software - Infrastructure', 5,  357.86, 'BUY', '2025-04-07'),
('GOOGL', 'Alphabet Inc', '', '', 12,  146.75, 'BUY', '2025-04-07'),
('AMZN', 'Amazon.com Inc', '', '', 10,  175.26, 'BUY', '2025-04-07'),
('PLTR', 'Palantir Technologies', '', '', 22,  77.84, 'BUY', '2025-04-07'),
('GEV', 'GE Vernova', '', '', 6,  286.07, 'BUY', '2025-04-07'),
('SMCI', 'Super Micro Computer', '', '', 53,  33.00, 'BUY', '2025-04-07'),

-- Loser buys
('TGTX', 'TG Therapetics, Inc.', '', '', 47, 37.25, 'BUY', '2025-04-07'),
('UNH', 'UnitedHealth Group Incorporated', '', '', 3, 524.70, 'BUY', '2025-04-07'),
('KRYS', 'Krystal Biotech, Inc.', '', '', 11,  166.01, 'BUY', '2025-04-07'),
('BRKR', 'Bruker Corporation', '', '', 45,  38.70, 'BUY', '2025-04-07');


-- ============================
-- 4️⃣ INSERT WATCHLIST ITEMS (NO PRICE IMPACT)
-- ============================
INSERT INTO watchlist_item (wi_symbol, wi_sector, wi_added_date) VALUES
('GOOGL', 'Technology', '2025-06-01'),
('NVDA',  'Semiconductors', '2025-06-05'),
('NFLX',  'Entertainment', '2025-07-01');

-- ============================
-- 6️⃣ RECALCULATE HOLDINGS
-- ============================
CALL recalculate_portfolio_items();

USE portfolio_db;

INSERT INTO cash_account (ca_name, ca_bank, ca_balance) VALUES
('Brokerage Account A', 'Fidelity', 50000.00),
('Brokerage Account B', 'Robinhood', 25000.00),
('Retirement Fund', 'Vanguard', 75000.00),
('Savings Account', 'Chase', 10000.00),
('Trading Account', 'E*TRADE', 15000.00);

INSERT INTO portfolio_item (pi_stockTicker, pi_volume, pi_buyPrice) VALUES
('AAPL', 50, 145.00),
('GOOGL', 10, 2700.00),
('AMZN', 5, 3300.00),
('MSFT', 30, 295.00),
('TSLA', 15, 710.00),
('NVDA', 25, 650.00),
('NFLX', 8, 510.00),
('META', 12, 300.00),
('INTC', 100, 35.00),
('AMD', 60, 110.00),
('BABA', 40, 160.00),
('DIS', 20, 175.00),
('UBER', 50, 45.00),
('PYPL', 30, 190.00),
('SQ', 25, 220.00),
('CRM', 18, 250.00),
('SHOP', 10, 1400.00),
('TWTR', 70, 38.00),
('ORCL', 22, 90.00),
('ADBE', 6, 530.00);

INSERT INTO portfolio_transaction (tr_type, tr_stockTicker, tr_volume, tr_price, tr_ca_id) VALUES
('buy', 'AAPL', 50, 145.00, 1),
('buy', 'GOOGL', 10, 2700.00, 2),
('buy', 'AMZN', 5, 3300.00, 3),
('buy', 'MSFT', 30, 295.00, 1),
('buy', 'TSLA', 15, 710.00, 2),
('buy', 'NVDA', 25, 650.00, 3),
('buy', 'NFLX', 8, 510.00, 4),
('buy', 'META', 12, 300.00, 5),
('buy', 'INTC', 100, 35.00, 1),
('buy', 'AMD', 60, 110.00, 2),
('buy', 'BABA', 40, 160.00, 3),
('buy', 'DIS', 20, 175.00, 4),
('buy', 'UBER', 50, 45.00, 5),
('buy', 'PYPL', 30, 190.00, 1),
('buy', 'SQ', 25, 220.00, 2),
('buy', 'CRM', 18, 250.00, 3),
('buy', 'SHOP', 10, 1400.00, 4),
('buy', 'TWTR', 70, 38.00, 5),
('buy', 'ORCL', 22, 90.00, 1),
('buy', 'ADBE', 6, 530.00, 2);

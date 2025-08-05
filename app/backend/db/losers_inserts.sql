INSERT INTO cash_transaction (ct_ca_id, ct_type, ct_amount, ct_date, ct_note) VALUES
(1, 'DEPOSIT', 20000, '2025-06-01', 'Initial deposit');



INSERT INTO portfolio_transaction (pt_symbol, pt_quantity, pt_price, pt_type, pt_date, pt_ca_id) VALUES
-- Loser buys
('TGTX', 10, 37.25, 'BUY', '2025-04-07', 1),
('UNH', 1, 524.70, 'BUY', '2025-04-07', 1),
('KRYS', 5,  166.01, 'BUY', '2025-04-07', 1),
('BRKR', 15,  38.70, 'BUY', '2025-04-07', 1);
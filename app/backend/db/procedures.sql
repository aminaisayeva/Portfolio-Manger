DELIMITER $$

DROP PROCEDURE IF EXISTS recalculate_portfolio_snapshot $$
CREATE PROCEDURE recalculate_portfolio_snapshot()
BEGIN
    DECLARE total_cash FLOAT DEFAULT 0;
    DECLARE total_equity FLOAT DEFAULT 0;

    -- Get total cash
    SELECT IFNULL(SUM(ca_balance),0) INTO total_cash FROM cash_account;

    -- Get total equity (quantity * weighted avg price)
    SELECT IFNULL(SUM(pi_total_quantity * pi_weighted_average_price),0) INTO total_equity FROM portfolio_item;

    -- Insert or update snapshot
    INSERT INTO portfolio_snapshot (ps_date, ps_total_cash, ps_total_equity, ps_total_value)
    VALUES (CURDATE(), total_cash, total_equity, total_cash + total_equity)
    ON DUPLICATE KEY UPDATE
        ps_total_cash = VALUES(ps_total_cash),
        ps_total_equity = VALUES(ps_total_equity),
        ps_total_value = VALUES(ps_total_value);
END $$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS recalculate_portfolio_items $$
CREATE PROCEDURE recalculate_portfolio_items()
BEGIN
    DELETE FROM portfolio_item;

    INSERT INTO portfolio_item (pi_symbol, pi_name, pi_sector, pi_total_quantity, pi_weighted_average_price)
    SELECT 
        pt_symbol,
        pt_name,
        pt_sector,
        SUM(CASE WHEN pt_type='BUY' THEN pt_quantity ELSE -pt_quantity END) AS total_qty,
        (
            SUM(CASE WHEN pt_type='BUY' THEN pt_quantity * pt_price ELSE 0 END) /
            NULLIF(SUM(CASE WHEN pt_type='BUY' THEN pt_quantity ELSE 0 END), 0)
        ) AS weighted_avg_price
    FROM portfolio_transaction
    GROUP BY pt_symbol, pt_name, pt_sector
    HAVING total_qty > 0;
END $$

DELIMITER ;

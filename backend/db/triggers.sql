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
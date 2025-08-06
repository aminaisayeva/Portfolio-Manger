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
CREATE DATABASE IF NOT EXISTS portfolio_db;

USE portfolio_db;

CREATE TABLE IF NOT EXISTS portfolio_item (
    pi_id INT AUTO_INCREMENT PRIMARY KEY,
    pi_stockTicker VARCHAR(10) NOT NULL,   
    pi_volume INT NOT NULL,
    pi_buyPrice DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pi_createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pi_lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cash_account (
    ca_id INT AUTO_INCREMENT PRIMARY KEY,
    ca_name VARCHAR(50) NOT NULL,
    ca_bank VARCHAR(50),
    ca_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ca_lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_transaction (
    tr_id INT AUTO_INCREMENT PRIMARY KEY,
    tr_type ENUM('buy','sell') NOT NULL,
    tr_stockTicker VARCHAR(10) NOT NULL,
    tr_volume INT NOT NULL,
    tr_price DECIMAL(10,2) NOT NULL,
    tr_totalAmount DECIMAL(12,2) GENERATED ALWAYS AS (tr_volume * tr_price) STORED,
    tr_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tr_ca_id INT,    
    FOREIGN KEY (tr_ca_id) REFERENCES cash_account(ca_id)
        ON UPDATE CASCADE
);
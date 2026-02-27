-- ============================================================
-- InvestSimulator - Complete MySQL Database Schema
-- Production-Ready Schema with indexes, constraints & triggers
-- ============================================================

CREATE DATABASE IF NOT EXISTS invest_simulator 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE invest_simulator;

-- ============================================================
-- TABLE 1: users
-- ============================================================
CREATE TABLE users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)        NOT NULL,
  email         VARCHAR(150)        NOT NULL UNIQUE,
  password_hash VARCHAR(255)        NOT NULL,
  role          ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  virtual_balance DECIMAL(18,4)     NOT NULL DEFAULT 0.0000,
  initial_capital DECIMAL(18,4)     NOT NULL DEFAULT 0.0000,
  is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login    TIMESTAMP           NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ============================================================
-- TABLE 2: assets (NSE stocks + Crypto)
-- ============================================================
CREATE TABLE assets (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  symbol        VARCHAR(50)         NOT NULL UNIQUE,      -- e.g. NSE:RELIANCE
  name          VARCHAR(150)        NOT NULL,
  type          ENUM('STOCK','CRYPTO') NOT NULL,
  sector        VARCHAR(80)         NULL,
  base_price    DECIMAL(18,6)       NOT NULL DEFAULT 0.0,
  current_price DECIMAL(18,6)       NOT NULL DEFAULT 0.0,
  price_change_pct DECIMAL(8,4)     NOT NULL DEFAULT 0.0,
  market_cap    DECIMAL(24,2)       NULL,
  is_active     BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_symbol (symbol),
  INDEX idx_active (is_active)
);

-- ============================================================
-- TABLE 3: portfolios (one per user)
-- ============================================================
CREATE TABLE portfolios (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT NOT NULL UNIQUE,
  total_invested      DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  total_current_value DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  realized_pnl        DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- ============================================================
-- TABLE 4: holdings (positions per user per asset)
-- ============================================================
CREATE TABLE holdings (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT          NOT NULL,
  asset_id      BIGINT          NOT NULL,
  quantity      DECIMAL(18,8)   NOT NULL DEFAULT 0.0,
  avg_buy_price DECIMAL(18,6)   NOT NULL DEFAULT 0.0,
  total_invested DECIMAL(18,4)  NOT NULL DEFAULT 0.0,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_asset (user_id, asset_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE RESTRICT,
  INDEX idx_user (user_id),
  INDEX idx_asset (asset_id)
);

-- ============================================================
-- TABLE 5: transactions (trade ledger)
-- ============================================================
CREATE TABLE transactions (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT                    NOT NULL,
  asset_id        BIGINT                    NOT NULL,
  type            ENUM('BUY','SELL')        NOT NULL,
  order_type      ENUM('MARKET','LIMIT')    NOT NULL DEFAULT 'MARKET',
  quantity        DECIMAL(18,8)             NOT NULL,
  price_per_unit  DECIMAL(18,6)             NOT NULL,
  total_amount    DECIMAL(18,4)             NOT NULL,
  realized_pnl    DECIMAL(18,4)             NULL,        -- only for SELL
  avg_buy_price   DECIMAL(18,6)             NULL,        -- snapshot at time of sell
  status          ENUM('PENDING','EXECUTED','CANCELLED') NOT NULL DEFAULT 'EXECUTED',
  executed_at     TIMESTAMP                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes           TEXT                      NULL,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE RESTRICT,
  INDEX idx_user (user_id),
  INDEX idx_asset (asset_id),
  INDEX idx_type (type),
  INDEX idx_executed_at (executed_at),
  INDEX idx_user_asset (user_id, asset_id)
);

-- ============================================================
-- TABLE 6: watchlist
-- ============================================================
CREATE TABLE watchlist (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT    NOT NULL,
  asset_id    BIGINT    NOT NULL,
  added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_asset_watch (user_id, asset_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- ============================================================
-- TABLE 7: price_history (for custom charts fallback)
-- ============================================================
CREATE TABLE price_history (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  asset_id    BIGINT          NOT NULL,
  price       DECIMAL(18,6)   NOT NULL,
  volume      DECIMAL(24,4)   NULL DEFAULT 0,
  recorded_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  INDEX idx_asset_time (asset_id, recorded_at)
);

-- ============================================================
-- TABLE 8: user_sessions (JWT token blacklist)
-- ============================================================
CREATE TABLE user_sessions (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT        NOT NULL,
  token_hash    VARCHAR(255)  NOT NULL,
  expires_at    TIMESTAMP     NOT NULL,
  is_revoked    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token_hash),
  INDEX idx_user (user_id)
);

-- ============================================================
-- SEED DATA: NSE Stocks (Top 25)
-- ============================================================
INSERT INTO assets (symbol, name, type, sector, base_price, current_price) VALUES
('NSE:RELIANCE',    'Reliance Industries',         'STOCK', 'Energy',          2847.50, 2847.50),
('NSE:TCS',         'Tata Consultancy Services',    'STOCK', 'IT',              3921.75, 3921.75),
('NSE:HDFCBANK',    'HDFC Bank',                    'STOCK', 'Banking',         1654.30, 1654.30),
('NSE:INFY',        'Infosys',                      'STOCK', 'IT',              1489.60, 1489.60),
('NSE:HINDUNILVR',  'Hindustan Unilever',           'STOCK', 'FMCG',            2378.90, 2378.90),
('NSE:ICICIBANK',   'ICICI Bank',                   'STOCK', 'Banking',         1089.45, 1089.45),
('NSE:SBIN',        'State Bank of India',          'STOCK', 'Banking',         812.30,  812.30),
('NSE:BHARTIARTL',  'Bharti Airtel',                'STOCK', 'Telecom',         1723.80, 1723.80),
('NSE:ITC',         'ITC Limited',                  'STOCK', 'FMCG',            453.20,  453.20),
('NSE:KOTAKBANK',   'Kotak Mahindra Bank',          'STOCK', 'Banking',         1876.55, 1876.55),
('NSE:LT',          'Larsen & Toubro',              'STOCK', 'Infrastructure',  3564.10, 3564.10),
('NSE:AXISBANK',    'Axis Bank',                    'STOCK', 'Banking',         1134.75, 1134.75),
('NSE:WIPRO',       'Wipro',                        'STOCK', 'IT',              567.40,  567.40),
('NSE:MARUTI',      'Maruti Suzuki India',          'STOCK', 'Auto',            12450.00, 12450.00),
('NSE:SUNPHARMA',   'Sun Pharmaceutical',           'STOCK', 'Pharma',          1678.25, 1678.25),
('NSE:HCLTECH',     'HCL Technologies',             'STOCK', 'IT',              1789.50, 1789.50),
('NSE:TATAMOTORS',  'Tata Motors',                  'STOCK', 'Auto',            967.80,  967.80),
('NSE:ONGC',        'Oil & Natural Gas Corp',       'STOCK', 'Energy',          276.45,  276.45),
('NSE:POWERGRID',   'Power Grid Corporation',       'STOCK', 'Utilities',       327.60,  327.60),
('NSE:NTPC',        'NTPC Limited',                 'STOCK', 'Utilities',       389.25,  389.25),
('NSE:BAJFINANCE',  'Bajaj Finance',                'STOCK', 'Finance',         7234.80, 7234.80),
('NSE:TITAN',       'Titan Company',                'STOCK', 'Consumer',        3456.70, 3456.70),
('NSE:ASIANPAINT',  'Asian Paints',                 'STOCK', 'Consumer',        2987.30, 2987.30),
('NSE:ULTRACEMCO',  'UltraTech Cement',             'STOCK', 'Materials',       11234.50, 11234.50),
('NSE:NESTLEIND',   'Nestlé India',                 'STOCK', 'FMCG',            24567.00, 24567.00);

-- ============================================================
-- SEED DATA: Cryptocurrencies (Top 20)
-- ============================================================
INSERT INTO assets (symbol, name, type, sector, base_price, current_price) VALUES
('BINANCE:BTCUSDT',  'Bitcoin',          'CRYPTO', 'Layer 1',   67432.50, 67432.50),
('BINANCE:ETHUSDT',  'Ethereum',         'CRYPTO', 'Layer 1',   3456.78,  3456.78),
('BINANCE:BNBUSDT',  'BNB',              'CRYPTO', 'Exchange',  567.34,   567.34),
('BINANCE:SOLUSDT',  'Solana',           'CRYPTO', 'Layer 1',   189.45,   189.45),
('BINANCE:XRPUSDT',  'XRP',              'CRYPTO', 'Payments',  0.6234,   0.6234),
('BINANCE:ADAUSDT',  'Cardano',          'CRYPTO', 'Layer 1',   0.4891,   0.4891),
('BINANCE:AVAXUSDT', 'Avalanche',        'CRYPTO', 'Layer 1',   38.76,    38.76),
('BINANCE:DOGEUSDT', 'Dogecoin',         'CRYPTO', 'Meme',      0.1456,   0.1456),
('BINANCE:DOTUSDT',  'Polkadot',         'CRYPTO', 'Interop',   7.89,     7.89),
('BINANCE:MATICUSDT','Polygon',          'CRYPTO', 'Layer 2',   0.8923,   0.8923),
('BINANCE:LINKUSDT', 'Chainlink',        'CRYPTO', 'Oracle',    14.56,    14.56),
('BINANCE:UNIUSDT',  'Uniswap',          'CRYPTO', 'DeFi',      10.23,    10.23),
('BINANCE:LTCUSDT',  'Litecoin',         'CRYPTO', 'Payments',  87.45,    87.45),
('BINANCE:ATOMUSDT', 'Cosmos',           'CRYPTO', 'Interop',   9.67,     9.67),
('BINANCE:NEARUSDT', 'NEAR Protocol',    'CRYPTO', 'Layer 1',   5.34,     5.34),
('BINANCE:FTMUSDT',  'Fantom',           'CRYPTO', 'Layer 1',   0.7823,   0.7823),
('BINANCE:ALGOUSDT', 'Algorand',         'CRYPTO', 'Layer 1',   0.1967,   0.1967),
('BINANCE:ICPUSDT',  'Internet Computer','CRYPTO', 'Web3',      12.34,    12.34),
('BINANCE:APTUSDT',  'Aptos',            'CRYPTO', 'Layer 1',   9.45,     9.45),
('BINANCE:ARBUSDT',  'Arbitrum',         'CRYPTO', 'Layer 2',   1.23,     1.23);

-- ============================================================
-- STORED PROCEDURE: Execute Trade (atomic buy/sell logic)
-- ============================================================
DELIMITER $$

CREATE PROCEDURE execute_trade(
  IN p_user_id      BIGINT,
  IN p_asset_id     BIGINT,
  IN p_trade_type   ENUM('BUY','SELL'),
  IN p_quantity     DECIMAL(18,8),
  IN p_price        DECIMAL(18,6),
  OUT p_result      VARCHAR(100)
)
BEGIN
  DECLARE v_balance      DECIMAL(18,4);
  DECLARE v_hold_qty     DECIMAL(18,8) DEFAULT 0;
  DECLARE v_hold_avg     DECIMAL(18,6) DEFAULT 0;
  DECLARE v_total        DECIMAL(18,4);
  DECLARE v_pnl          DECIMAL(18,4) DEFAULT NULL;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_result = 'ERROR: Transaction failed';
  END;

  START TRANSACTION;

  SELECT virtual_balance INTO v_balance FROM users WHERE id = p_user_id FOR UPDATE;
  SELECT quantity, avg_buy_price INTO v_hold_qty, v_hold_avg
    FROM holdings WHERE user_id = p_user_id AND asset_id = p_asset_id;

  SET v_total = p_quantity * p_price;

  IF p_trade_type = 'BUY' THEN
    IF v_balance < v_total THEN
      SET p_result = 'ERROR: Insufficient balance';
      ROLLBACK;
    ELSE
      UPDATE users SET virtual_balance = virtual_balance - v_total WHERE id = p_user_id;

      INSERT INTO holdings (user_id, asset_id, quantity, avg_buy_price, total_invested)
      VALUES (p_user_id, p_asset_id, p_quantity, p_price, v_total)
      ON DUPLICATE KEY UPDATE
        avg_buy_price  = (quantity * avg_buy_price + p_quantity * p_price) / (quantity + p_quantity),
        quantity       = quantity + p_quantity,
        total_invested = total_invested + v_total,
        updated_at     = NOW();

      INSERT INTO transactions (user_id, asset_id, type, quantity, price_per_unit, total_amount)
      VALUES (p_user_id, p_asset_id, 'BUY', p_quantity, p_price, v_total);

      UPDATE portfolios SET total_invested = total_invested + v_total WHERE user_id = p_user_id;

      COMMIT;
      SET p_result = 'SUCCESS: Buy order executed';
    END IF;

  ELSEIF p_trade_type = 'SELL' THEN
    IF v_hold_qty IS NULL OR v_hold_qty < p_quantity THEN
      SET p_result = 'ERROR: Insufficient holdings';
      ROLLBACK;
    ELSE
      SET v_pnl = (p_price - v_hold_avg) * p_quantity;

      UPDATE users SET virtual_balance = virtual_balance + v_total WHERE id = p_user_id;

      UPDATE holdings
      SET quantity       = quantity - p_quantity,
          total_invested = total_invested - (p_quantity * avg_buy_price),
          updated_at     = NOW()
      WHERE user_id = p_user_id AND asset_id = p_asset_id;

      DELETE FROM holdings WHERE user_id = p_user_id AND asset_id = p_asset_id AND quantity <= 0;

      INSERT INTO transactions (user_id, asset_id, type, quantity, price_per_unit, total_amount, realized_pnl, avg_buy_price)
      VALUES (p_user_id, p_asset_id, 'SELL', p_quantity, p_price, v_total, v_pnl, v_hold_avg);

      UPDATE portfolios SET realized_pnl = realized_pnl + v_pnl WHERE user_id = p_user_id;

      COMMIT;
      SET p_result = 'SUCCESS: Sell order executed';
    END IF;
  END IF;
END$$

DELIMITER ;

-- ============================================================
-- TRIGGER: Auto-create portfolio on user signup
-- ============================================================
DELIMITER $$
CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO portfolios (user_id, total_invested, total_current_value, realized_pnl)
  VALUES (NEW.id, 0, 0, 0);
END$$
DELIMITER ;

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- User portfolio summary view
CREATE VIEW v_portfolio_summary AS
SELECT
  u.id           AS user_id,
  u.full_name,
  u.virtual_balance,
  COUNT(h.id)    AS total_positions,
  SUM(h.quantity * a.current_price) AS current_portfolio_value,
  SUM(h.total_invested)             AS total_cost_basis,
  SUM(h.quantity * a.current_price) - SUM(h.total_invested) AS unrealized_pnl,
  p.realized_pnl
FROM users u
LEFT JOIN holdings h ON h.user_id = u.id
LEFT JOIN assets   a ON a.id = h.asset_id
LEFT JOIN portfolios p ON p.user_id = u.id
GROUP BY u.id, u.full_name, u.virtual_balance, p.realized_pnl;

-- Holding detail view
CREATE VIEW v_holdings_detail AS
SELECT
  h.user_id,
  a.symbol,
  a.name,
  a.type,
  a.sector,
  h.quantity,
  h.avg_buy_price,
  a.current_price,
  h.quantity * a.current_price     AS current_value,
  h.total_invested                 AS cost_basis,
  (a.current_price - h.avg_buy_price) * h.quantity AS unrealized_pnl,
  ((a.current_price - h.avg_buy_price) / h.avg_buy_price) * 100 AS pnl_pct
FROM holdings h
JOIN assets a ON a.id = h.asset_id
WHERE h.quantity > 0;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Wallet balances (one row per currency per user)
CREATE TABLE IF NOT EXISTS wallet_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_name TEXT NOT NULL,
  amount REAL DEFAULT 0,
  is_base INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, currency_code)
);

-- Transactions ledger
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('deposit', 'buy', 'sell')) NOT NULL,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  from_amount REAL NOT NULL,
  to_amount REAL NOT NULL,
  rate_used REAL NOT NULL,
  rate_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS reset_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON reset_tokens(user_id);

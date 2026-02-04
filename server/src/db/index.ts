import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

interface WalletBalance {
  currencyCode: string;
  currencyName: string;
  amount: number;
  isBase: boolean;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'buy' | 'sell';
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rateUsed: number;
  rateDate: string;
  createdAt: string;
}

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'currency-exchange.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
sqlite.exec(schema);

class DatabaseService {
  createUser(user: User): void {
    const stmt = sqlite.prepare(`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(user.id, user.email, user.name, user.passwordHash);
    
    const walletStmt = sqlite.prepare(`
      INSERT INTO wallet_balances (user_id, currency_code, currency_name, amount, is_base)
      VALUES (?, 'PLN', 'Polish Zloty', 0, 1)
    `);
    walletStmt.run(user.id);
  }

  getUserById(id: string): User | undefined {
    const stmt = sqlite.prepare(`
      SELECT id, email, name, password_hash as passwordHash
      FROM users WHERE id = ?
    `);
    return stmt.get(id) as User | undefined;
  }

  getUserByEmail(email: string): User | undefined {
    const stmt = sqlite.prepare(`
      SELECT id, email, name, password_hash as passwordHash
      FROM users WHERE email = ?
    `);
    return stmt.get(email) as User | undefined;
  }

  updateUserPassword(userId: string, passwordHash: string): void {
    const stmt = sqlite.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `);
    stmt.run(passwordHash, userId);
  }

  storeResetToken(token: string, userId: string): void {
    const expiresAt = Date.now() + 3600000;
    const stmt = sqlite.prepare(`
      INSERT INTO reset_tokens (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(token, userId, expiresAt);
  }

  getResetToken(token: string): { userId: string; expiresAt: number } | undefined {
    const stmt = sqlite.prepare(`
      SELECT user_id as userId, expires_at as expiresAt
      FROM reset_tokens WHERE token = ?
    `);
    return stmt.get(token) as { userId: string; expiresAt: number } | undefined;
  }

  deleteResetToken(token: string): void {
    const stmt = sqlite.prepare(`DELETE FROM reset_tokens WHERE token = ?`);
    stmt.run(token);
  }

  getWallet(userId: string): WalletBalance[] {
    const stmt = sqlite.prepare(`
      SELECT currency_code as currencyCode, currency_name as currencyName, 
             amount, is_base as isBase
      FROM wallet_balances WHERE user_id = ?
    `);
    const rows = stmt.all(userId) as Array<{
      currencyCode: string;
      currencyName: string;
      amount: number;
      isBase: number;
    }>;
    return rows.map(row => ({
      ...row,
      isBase: row.isBase === 1,
    }));
  }

  updateWallet(userId: string, balances: WalletBalance[]): void {
    const deleteStmt = sqlite.prepare(`DELETE FROM wallet_balances WHERE user_id = ?`);
    const insertStmt = sqlite.prepare(`
      INSERT INTO wallet_balances (user_id, currency_code, currency_name, amount, is_base)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = sqlite.transaction(() => {
      deleteStmt.run(userId);
      for (const balance of balances) {
        insertStmt.run(
          userId,
          balance.currencyCode,
          balance.currencyName,
          balance.amount,
          balance.isBase ? 1 : 0
        );
      }
    });

    transaction();
  }

  addTransaction(userId: string, transaction: Transaction): void {
    const stmt = sqlite.prepare(`
      INSERT INTO transactions (id, user_id, type, from_currency, to_currency, 
                                from_amount, to_amount, rate_used, rate_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      transaction.id,
      userId,
      transaction.type,
      transaction.fromCurrency,
      transaction.toCurrency,
      transaction.fromAmount,
      transaction.toAmount,
      transaction.rateUsed,
      transaction.rateDate,
      transaction.createdAt
    );
  }

  getTransactions(userId: string): Transaction[] {
    const stmt = sqlite.prepare(`
      SELECT id, user_id as userId, type, from_currency as fromCurrency, 
             to_currency as toCurrency, from_amount as fromAmount, 
             to_amount as toAmount, rate_used as rateUsed, 
             rate_date as rateDate, created_at as createdAt
      FROM transactions WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(userId) as Transaction[];
  }
}

export const db = new DatabaseService();
export type { User, WalletBalance, Transaction };

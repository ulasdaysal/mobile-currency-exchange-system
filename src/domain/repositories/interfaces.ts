import { User } from '../entities/User';
import { Rate } from '../entities/Rate';
import { WalletBalance } from '../entities/WalletBalance';
import { Transaction, TransactionType } from '../entities/Transaction';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<User>;
  register(data: RegisterData): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getStoredToken(): Promise<string | null>;
  clearSession(): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export interface HistoricalRatesParams {
  currencyCode: string;
  startDate?: string;
  endDate?: string;
  lastN?: number;
}

export interface IRatesRepository {
  getCurrentRates(): Promise<Rate[]>;
  getRateForCurrency(currencyCode: string): Promise<Rate>;
  getHistoricalRates(params: HistoricalRatesParams): Promise<Rate[]>;
}

export interface AddFundsParams {
  amount: number;
  currencyCode?: string;
}

export interface IWalletRepository {
  getBalances(): Promise<WalletBalance[]>;
  getTotalBalanceInPln(): Promise<number>;
  addFunds(params: AddFundsParams): Promise<WalletBalance>;
}

export interface TradeParams {
  type: 'buy' | 'sell';
  currencyCode: string;
  amount: number;
}

export interface TradeResult {
  transaction: Transaction;
  newBalance: WalletBalance;
}

export interface HistoryFilters {
  type?: TransactionType;
  currencyCode?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ITransactionRepository {
  executeTrade(params: TradeParams): Promise<TradeResult>;
  getHistory(filters?: HistoryFilters): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction>;
}

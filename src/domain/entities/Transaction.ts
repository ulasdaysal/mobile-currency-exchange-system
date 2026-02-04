export type TransactionType = 'deposit' | 'buy' | 'sell';

export interface Transaction {
  id: string;
  type: TransactionType;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rateUsed: number;
  rateDate: string;
  createdAt: string;
}

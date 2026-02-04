export interface UserDTO {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

export interface RateDTO {
  code: string;
  currency: string;
  mid?: number;
  bid?: number;
  ask?: number;
  effectiveDate: string;
}

export interface RatesResponseDTO {
  table: string;
  no: string;
  effectiveDate: string;
  rates: RateDTO[];
}

export interface WalletBalanceDTO {
  currencyCode: string;
  currencyName: string;
  amount: number;
  valueInPln: number;
  isBase: boolean;
}

export interface TransactionDTO {
  id: string;
  type: 'deposit' | 'buy' | 'sell';
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rateUsed: number;
  rateDate: string;
  createdAt: string;
}

export interface TradeRequestDTO {
  type: 'buy' | 'sell';
  currencyCode: string;
  amount: number;
}

export interface TradeResponseDTO {
  transaction: TransactionDTO;
  newBalance: WalletBalanceDTO;
}

export interface FundRequestDTO {
  amount: number;
  currencyCode?: string;
}

import { User } from '../../domain/entities/User';
import { Rate } from '../../domain/entities/Rate';
import { Transaction } from '../../domain/entities/Transaction';
import { WalletBalance } from '../../domain/entities/WalletBalance';
import { UserDTO, RateDTO, TransactionDTO, WalletBalanceDTO } from '../dto';

const CURRENCY_FLAGS: Record<string, string> = {
  EUR: '🇪🇺',
  USD: '🇺🇸',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  PLN: '🇵🇱',
};

export function mapUserDTO(dto: UserDTO): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    token: dto.token,
  };
}

export function mapRateDTO(dto: RateDTO): Rate {
  const spread = 0.02;
  const midRate = dto.mid || ((dto.bid || 0) + (dto.ask || 0)) / 2;
  
  return {
    code: dto.code,
    name: dto.currency,
    flag: CURRENCY_FLAGS[dto.code] || '💱',
    midRate,
    buyRate: dto.ask || midRate * (1 + spread),
    sellRate: dto.bid || midRate * (1 - spread),
    effectiveDate: dto.effectiveDate,
  };
}

export function mapTransactionDTO(dto: TransactionDTO): Transaction {
  return {
    id: dto.id,
    type: dto.type,
    fromCurrency: dto.fromCurrency,
    toCurrency: dto.toCurrency,
    fromAmount: dto.fromAmount,
    toAmount: dto.toAmount,
    rateUsed: dto.rateUsed,
    rateDate: dto.rateDate,
    createdAt: dto.createdAt,
  };
}

export function mapWalletBalanceDTO(dto: WalletBalanceDTO): WalletBalance {
  return {
    currencyCode: dto.currencyCode,
    currencyName: dto.currencyName,
    amount: dto.amount,
    valueInPln: dto.valueInPln,
    isBase: dto.isBase,
  };
}

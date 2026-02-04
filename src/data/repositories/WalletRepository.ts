import { WalletBalance } from '../../domain/entities/WalletBalance';
import { IWalletRepository, AddFundsParams } from '../../domain/repositories/interfaces';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS } from '../api/endpoints';
import { WalletBalanceDTO, FundRequestDTO } from '../dto';
import { mapWalletBalanceDTO } from '../mappers';

export class WalletRepository implements IWalletRepository {
  async getBalances(): Promise<WalletBalance[]> {
    const response = await apiClient.get<WalletBalanceDTO[]>(ENDPOINTS.WALLET.BALANCES);
    return response.map(mapWalletBalanceDTO);
  }

  async getTotalBalanceInPln(): Promise<number> {
    const response = await apiClient.get<{ total: number }>(ENDPOINTS.WALLET.TOTAL);
    return response.total;
  }

  async addFunds(params: AddFundsParams): Promise<WalletBalance> {
    const request: FundRequestDTO = {
      amount: params.amount,
      currencyCode: params.currencyCode || 'PLN',
    };
    
    const response = await apiClient.post<WalletBalanceDTO>(ENDPOINTS.WALLET.FUND, request);
    return mapWalletBalanceDTO(response);
  }
}

export const walletRepository = new WalletRepository();

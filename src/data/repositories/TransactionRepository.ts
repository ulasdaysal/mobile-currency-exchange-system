import { Transaction } from '../../domain/entities/Transaction';
import { 
  ITransactionRepository, 
  TradeParams, 
  TradeResult, 
  HistoryFilters 
} from '../../domain/repositories/interfaces';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS } from '../api/endpoints';
import { TransactionDTO, TradeRequestDTO, TradeResponseDTO } from '../dto';
import { mapTransactionDTO, mapWalletBalanceDTO } from '../mappers';

export class TransactionRepository implements ITransactionRepository {
  async executeTrade(params: TradeParams): Promise<TradeResult> {
    const request: TradeRequestDTO = {
      type: params.type,
      currencyCode: params.currencyCode,
      amount: params.amount,
    };
    
    const response = await apiClient.post<TradeResponseDTO>(ENDPOINTS.TRANSACTIONS.TRADE, request);
    
    return {
      transaction: mapTransactionDTO(response.transaction),
      newBalance: mapWalletBalanceDTO(response.newBalance),
    };
  }

  async getHistory(filters?: HistoryFilters): Promise<Transaction[]> {
    let queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.currencyCode) queryParams.append('currency', filters.currencyCode);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
    }
    
    const query = queryParams.toString();
    const endpoint = query ? `${ENDPOINTS.TRANSACTIONS.HISTORY}?${query}` : ENDPOINTS.TRANSACTIONS.HISTORY;
    
    const response = await apiClient.get<TransactionDTO[]>(endpoint);
    return response.map(mapTransactionDTO);
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiClient.get<TransactionDTO>(ENDPOINTS.TRANSACTIONS.DETAIL(id));
    return mapTransactionDTO(response);
  }
}

export const transactionRepository = new TransactionRepository();

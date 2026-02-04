import { Rate } from '../../domain/entities/Rate';
import { IRatesRepository, HistoricalRatesParams } from '../../domain/repositories/interfaces';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS } from '../api/endpoints';
import { RateDTO, RatesResponseDTO } from '../dto';
import { mapRateDTO } from '../mappers';

export class RatesRepository implements IRatesRepository {
  async getCurrentRates(): Promise<Rate[]> {
    const response = await apiClient.get<RatesResponseDTO>(ENDPOINTS.RATES.CURRENT);
    return response.rates.map(mapRateDTO);
  }

  async getRateForCurrency(currencyCode: string): Promise<Rate> {
    const response = await apiClient.get<RateDTO>(ENDPOINTS.RATES.CURRENCY(currencyCode));
    return mapRateDTO(response);
  }

  async getHistoricalRates(params: HistoricalRatesParams): Promise<Rate[]> {
    const { currencyCode, startDate, endDate, lastN } = params;
    
    let queryParams = '';
    if (startDate && endDate) {
      queryParams = `?startDate=${startDate}&endDate=${endDate}`;
    } else if (lastN) {
      queryParams = `?lastN=${lastN}`;
    }
    
    const response = await apiClient.get<RateDTO[]>(
      `${ENDPOINTS.RATES.HISTORICAL(currencyCode)}${queryParams}`
    );
    
    return response.map(mapRateDTO);
  }
}

export const ratesRepository = new RatesRepository();

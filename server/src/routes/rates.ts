import { Router } from 'express';

const router = Router();

const NBP_API_BASE = 'https://api.nbp.pl/api/exchangerates';

interface NBPRate {
  currency: string;
  code: string;
  mid?: number;
  bid?: number;
  ask?: number;
}

interface NBPTableResponse {
  table: string;
  no: string;
  effectiveDate: string;
  rates: NBPRate[];
}

async function fetchNBPRates(table: string = 'A'): Promise<NBPTableResponse> {
  const response = await fetch(`${NBP_API_BASE}/tables/${table}/?format=json`);
  if (!response.ok) {
    throw new Error('Failed to fetch NBP rates');
  }
  const data = await response.json();
  return data[0];
}

async function fetchNBPRateForCurrency(code: string): Promise<{ rate: NBPRate; effectiveDate: string }> {
  const responseA = await fetch(`${NBP_API_BASE}/rates/a/${code}/?format=json`);
  if (responseA.ok) {
    const data = await responseA.json();
    return {
      rate: { ...data.rates[0], currency: data.currency, code: data.code },
      effectiveDate: data.rates[0].effectiveDate,
    };
  }
  
  const responseC = await fetch(`${NBP_API_BASE}/rates/c/${code}/?format=json`);
  if (!responseC.ok) {
    throw new Error(`Currency ${code} not found`);
  }
  const data = await responseC.json();
  return {
    rate: { ...data.rates[0], currency: data.currency, code: data.code },
    effectiveDate: data.rates[0].effectiveDate,
  };
}

router.get('/current', async (req, res) => {
  try {
    const tableA = await fetchNBPRates('A');
    
    res.json({
      table: tableA.table,
      no: tableA.no,
      effectiveDate: tableA.effectiveDate,
      rates: tableA.rates.map(r => ({
        code: r.code,
        currency: r.currency,
        mid: r.mid,
        effectiveDate: tableA.effectiveDate,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exchange rates' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { rate, effectiveDate } = await fetchNBPRateForCurrency(code.toUpperCase());
    
    res.json({
      code: rate.code,
      currency: rate.currency,
      mid: rate.mid,
      bid: rate.bid,
      ask: rate.ask,
      effectiveDate,
    });
  } catch (error) {
    res.status(404).json({ message: 'Currency not found' });
  }
});

router.get('/:code/historical', async (req, res) => {
  try {
    const { code } = req.params;
    const { lastN = '10' } = req.query;
    
    const response = await fetch(
      `${NBP_API_BASE}/rates/a/${code.toUpperCase()}/last/${lastN}/?format=json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch historical rates');
    }
    
    const data = await response.json();
    
    res.json(data.rates.map((r: { mid: number; effectiveDate: string }) => ({
      code: data.code,
      currency: data.currency,
      mid: r.mid,
      effectiveDate: r.effectiveDate,
    })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch historical rates' });
  }
});

export { router as ratesRouter };

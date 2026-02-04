import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const CURRENCY_NAMES: Record<string, string> = {
  EUR: 'Euro',
  USD: 'US Dollar',
  GBP: 'British Pound',
  CHF: 'Swiss Franc',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  PLN: 'Polish Zloty',
};

async function fetchRate(code: string): Promise<{ mid: number; effectiveDate: string }> {
  const response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${code}/?format=json`);
  if (!response.ok) throw new Error('Rate not found');
  const data = await response.json();
  return {
    mid: data.rates[0].mid,
    effectiveDate: data.rates[0].effectiveDate,
  };
}

router.post('/trade', async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { type, currencyCode, amount } = req.body;
  
  if (!type || !currencyCode || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid trade parameters' });
  }
  
  if (type !== 'buy' && type !== 'sell') {
    return res.status(400).json({ message: 'Type must be buy or sell' });
  }
  
  try {
    const { mid: rate, effectiveDate } = await fetchRate(currencyCode);
    const spread = 0.02;
    
    const wallet = db.getWallet(userId);
    let plnBalance = wallet.find(b => b.currencyCode === 'PLN');
    let currencyBalance = wallet.find(b => b.currencyCode === currencyCode);
    
    if (!plnBalance) {
      return res.status(400).json({ message: 'No PLN balance found' });
    }
    
    let fromCurrency: string;
    let toCurrency: string;
    let fromAmount: number;
    let toAmount: number;
    let rateUsed: number;
    
    if (type === 'buy') {
      rateUsed = rate * (1 + spread);
      fromAmount = amount * rateUsed;
      toAmount = amount;
      fromCurrency = 'PLN';
      toCurrency = currencyCode;
      
      if (plnBalance.amount < fromAmount) {
        return res.status(400).json({ message: 'Insufficient PLN balance' });
      }
      
      plnBalance.amount -= fromAmount;
      
      if (!currencyBalance) {
        currencyBalance = {
          currencyCode,
          currencyName: CURRENCY_NAMES[currencyCode] || currencyCode,
          amount: 0,
          isBase: false,
        };
        wallet.push(currencyBalance);
      }
      currencyBalance.amount += toAmount;
      
    } else {
      rateUsed = rate * (1 - spread);
      fromAmount = amount;
      toAmount = amount * rateUsed;
      fromCurrency = currencyCode;
      toCurrency = 'PLN';
      
      if (!currencyBalance || currencyBalance.amount < fromAmount) {
        return res.status(400).json({ message: `Insufficient ${currencyCode} balance` });
      }
      
      currencyBalance.amount -= fromAmount;
      plnBalance.amount += toAmount;
    }
    
    db.updateWallet(userId, wallet);
    
    const transaction = {
      id: uuidv4(),
      userId,
      type,
      fromCurrency,
      toCurrency,
      fromAmount: Math.round(fromAmount * 100) / 100,
      toAmount: Math.round(toAmount * 100) / 100,
      rateUsed: Math.round(rateUsed * 10000) / 10000,
      rateDate: effectiveDate,
      createdAt: new Date().toISOString(),
    };
    
    db.addTransaction(userId, transaction);
    
    const updatedBalance = type === 'buy' ? currencyBalance : plnBalance;
    
    res.json({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        fromCurrency: transaction.fromCurrency,
        toCurrency: transaction.toCurrency,
        fromAmount: transaction.fromAmount,
        toAmount: transaction.toAmount,
        rateUsed: transaction.rateUsed,
        rateDate: transaction.rateDate,
        createdAt: transaction.createdAt,
      },
      newBalance: {
        currencyCode: updatedBalance!.currencyCode,
        currencyName: updatedBalance!.currencyName,
        amount: Math.round(updatedBalance!.amount * 100) / 100,
        valueInPln: updatedBalance!.isBase ? updatedBalance!.amount : updatedBalance!.amount * rate,
        isBase: updatedBalance!.isBase,
      },
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Failed to execute trade' });
  }
});

router.get('/history', (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { type, currency, limit = '50', offset = '0' } = req.query;
  
  let transactions = db.getTransactions(userId);
  
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }
  
  if (currency) {
    transactions = transactions.filter(
      t => t.fromCurrency === currency || t.toCurrency === currency
    );
  }
  
  const start = parseInt(offset as string, 10);
  const count = parseInt(limit as string, 10);
  transactions = transactions.slice(start, start + count);
  
  res.json(transactions.map(t => ({
    id: t.id,
    type: t.type,
    fromCurrency: t.fromCurrency,
    toCurrency: t.toCurrency,
    fromAmount: t.fromAmount,
    toAmount: t.toAmount,
    rateUsed: t.rateUsed,
    rateDate: t.rateDate,
    createdAt: t.createdAt,
  })));
});

router.get('/:id', (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  
  const transactions = db.getTransactions(userId);
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  
  res.json({
    id: transaction.id,
    type: transaction.type,
    fromCurrency: transaction.fromCurrency,
    toCurrency: transaction.toCurrency,
    fromAmount: transaction.fromAmount,
    toAmount: transaction.toAmount,
    rateUsed: transaction.rateUsed,
    rateDate: transaction.rateDate,
    createdAt: transaction.createdAt,
  });
});

export { router as transactionsRouter };

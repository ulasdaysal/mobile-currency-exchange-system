import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

function getCurrentRateForCurrency(code: string): Promise<{ mid: number; effectiveDate: string }> {
  return fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${code}/?format=json`)
    .then(res => res.json())
    .then(data => ({
      mid: data.rates[0].mid,
      effectiveDate: data.rates[0].effectiveDate,
    }));
}

router.get('/balances', (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const wallet = db.getWallet(userId);
  
  res.json(wallet.map(b => ({
    currencyCode: b.currencyCode,
    currencyName: b.currencyName,
    amount: b.amount,
    valueInPln: b.isBase ? b.amount : b.amount * 4.0,
    isBase: b.isBase,
  })));
});

router.get('/total', (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const wallet = db.getWallet(userId);
  
  let total = 0;
  for (const balance of wallet) {
    if (balance.isBase) {
      total += balance.amount;
    } else {
      total += balance.amount * 4.0;
    }
  }
  
  res.json({ total });
});

router.post('/fund', (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { amount, currencyCode = 'PLN' } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }
  
  const wallet = db.getWallet(userId);
  let balance = wallet.find(b => b.currencyCode === currencyCode);
  
  if (!balance) {
    balance = {
      currencyCode,
      currencyName: currencyCode === 'PLN' ? 'Polish Zloty' : currencyCode,
      amount: 0,
      isBase: currencyCode === 'PLN',
    };
    wallet.push(balance);
  }
  
  balance.amount += amount;
  db.updateWallet(userId, wallet);
  
  const transaction = {
    id: uuidv4(),
    userId,
    type: 'deposit' as const,
    fromCurrency: currencyCode,
    toCurrency: currencyCode,
    fromAmount: amount,
    toAmount: amount,
    rateUsed: 1,
    rateDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  
  db.addTransaction(userId, transaction);
  
  res.json({
    currencyCode: balance.currencyCode,
    currencyName: balance.currencyName,
    amount: balance.amount,
    valueInPln: balance.amount,
    isBase: balance.isBase,
  });
});

export { router as walletRouter };

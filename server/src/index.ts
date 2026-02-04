import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { ratesRouter } from './routes/rates';
import { walletRouter } from './routes/wallet';
import { transactionsRouter } from './routes/transactions';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/rates', authMiddleware, ratesRouter);
app.use('/api/wallet', authMiddleware, walletRouter);
app.use('/api/transactions', authMiddleware, transactionsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('NBP API integration enabled');
});

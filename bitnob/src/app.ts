import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import { apiRateLimiter } from './middleware/rateLimiter';
import logger from './utils/logger';
import { connectDb } from './config/db';
import { errorHandler, notFound } from './middleware/error';
import walletRouter from './routes/wallet'

const app = express();

// Connect to MongoDB
connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(apiRateLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/wallets', walletRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
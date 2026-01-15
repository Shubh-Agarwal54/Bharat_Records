import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import documentRoutes from './routes/document.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.FRONTEND_URL],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'bharatrecords_db'
})
.then(() => {
  logger.info('✅ MongoDB Connected Successfully');
  console.log('✅ MongoDB Connected Successfully');
})
.catch((err) => {
  logger.error('MongoDB Connection Error:', err);
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bharat Records API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
});

export default app;

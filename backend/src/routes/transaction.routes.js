import express from 'express';
import {
  getTransactions,
  getTransactionById,
  getTransactionStats
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getTransactions);
router.get('/stats/summary', getTransactionStats);
router.get('/:id', getTransactionById);

export default router;

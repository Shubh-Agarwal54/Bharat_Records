import express from 'express';
import {
  getWallet,
  addMoney,
  transferMoney,
  withdrawMoney
} from '../controllers/wallet.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/', getWallet);
router.post('/add-money', addMoney);
router.post('/transfer', transferMoney);
router.post('/withdraw', withdrawMoney);

export default router;

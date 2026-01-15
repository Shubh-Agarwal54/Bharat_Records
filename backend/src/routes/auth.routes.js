import express from 'express';
import {
  signup,
  login,
  phoneLogin,
  verifyOTPAndLogin,
  refreshToken,
  logout,
  googleAuth
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/phone-login', phoneLogin);
router.post('/verify-otp', verifyOTPAndLogin);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/google', googleAuth);

export default router;

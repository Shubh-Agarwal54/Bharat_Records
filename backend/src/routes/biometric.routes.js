import express from 'express';
import {
  getRegistrationOptions,
  verifyRegistration,
  getAuthOptions,
  verifyAuthentication,
  disableBiometric,
  getBiometricStatus
} from '../controllers/biometric.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public (needs userId in body)
router.post('/auth-options', getAuthOptions);
router.post('/auth-verify', verifyAuthentication);

// Protected
router.get('/status', protect, getBiometricStatus);
router.get('/register-options', protect, getRegistrationOptions);
router.post('/register-verify', protect, verifyRegistration);
router.delete('/disable', protect, disableBiometric);

export default router;

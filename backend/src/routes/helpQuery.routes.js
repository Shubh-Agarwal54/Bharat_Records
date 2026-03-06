import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { submitHelpQuery } from '../controllers/helpQuery.controller.js';

const router = express.Router();

// User submits a help query (auth optional — still works if user is logged in)
router.post('/submit', protect, submitHelpQuery);

export default router;

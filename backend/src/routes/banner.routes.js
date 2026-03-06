import express from 'express';
import { getActiveBanners } from '../controllers/banner.controller.js';

const router = express.Router();

// Public – no auth needed
// GET /api/banners
router.get('/', getActiveBanners);

export default router;

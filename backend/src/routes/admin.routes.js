import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  toggleUserStatus,
  updateUserSubscription,
  deleteUser,
  getAllDocuments,
  deleteDocument,
  getAllTransactions,
  getAllWallets
} from '../controllers/admin.controller.js';

const router = express.Router();

// Admin auth middleware
const adminProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

    req.admin = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Public
router.post('/login', adminLogin);

// Protected
router.get('/stats', adminProtect, getDashboardStats);

router.get('/users', adminProtect, getAllUsers);
router.get('/users/:id', adminProtect, getUserDetail);
router.put('/users/:id/toggle-status', adminProtect, toggleUserStatus);
router.put('/users/:id/subscription', adminProtect, updateUserSubscription);
router.delete('/users/:id', adminProtect, deleteUser);

router.get('/documents', adminProtect, getAllDocuments);
router.delete('/documents/:id', adminProtect, deleteDocument);

router.get('/transactions', adminProtect, getAllTransactions);

router.get('/wallets', adminProtect, getAllWallets);

export default router;

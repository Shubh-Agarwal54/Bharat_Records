import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AdminAccount from '../models/AdminAccount.model.js';
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  toggleUserStatus,
  updateUserSubscription,
  deleteUser,
  getAllDocuments,
  getDocumentSignedUrl,
  deleteDocument,
  getAllTransactions,
  getAllWallets,
  getAllHelpQueries,
  updateHelpQueryStatus,
  deleteHelpQuery
} from '../controllers/admin.controller.js';
import {
  getAllBanners,
  createBanner,
  toggleBannerActive,
  updateBannerOrder,
  deleteBanner,
  bannerUpload
} from '../controllers/banner.controller.js';
import {
  getAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  toggleAdminAccountStatus,
  resetAdminAccountPassword,
  deleteAdminAccount,
  adminAccountLogin,
} from '../controllers/adminPermissions.controller.js';

const router = express.Router();

// Admin auth middleware — accepts both master-admin (User model) and sub-admin (AdminAccount model) tokens
const adminProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Path A: original admin user (stored in User collection with role:'admin')
    if (decoded.id && decoded.role === 'admin') {
      const user = await User.findById(decoded.id);
      if (!user || user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
      req.admin = user;
      req.adminRole = 'admin';
      req.adminPermissions = null; // full access
      return next();
    }

    // Path B: AdminAccount (sub-admin / master-admin / super-admin)
    if (decoded.adminAccountId) {
      const account = await AdminAccount.findById(decoded.adminAccountId).select('-password');
      if (!account || !account.isActive) return res.status(403).json({ success: false, message: 'Account not found or deactivated' });
      req.admin = account;
      req.adminRole = account.role;
      req.adminPermissions = account.permissions;
      return next();
    }

    return res.status(403).json({ success: false, message: 'Admin access required' });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Permission guard — null adminPermissions means full access (master admin via User model)
const checkPermission = (section, action) => (req, res, next) => {
  if (req.adminPermissions === null) return next(); // master admin: full access
  const perm = req.adminPermissions?.[section];
  if (perm && perm[action]) return next();
  return res.status(403).json({
    success: false,
    message: `Permission denied: you need '${action}' permission on '${section}'`
  });
};

// Public
router.post('/login', adminLogin);

// Protected
router.get('/stats', adminProtect, checkPermission('dashboard', 'view'), getDashboardStats);

router.get('/users', adminProtect, checkPermission('users', 'view'), getAllUsers);
router.get('/users/:id', adminProtect, checkPermission('users', 'view'), getUserDetail);
router.put('/users/:id/toggle-status', adminProtect, checkPermission('users', 'edit'), toggleUserStatus);
router.put('/users/:id/subscription', adminProtect, checkPermission('users', 'edit'), updateUserSubscription);
router.delete('/users/:id', adminProtect, checkPermission('users', 'delete'), deleteUser);

router.get('/documents', adminProtect, checkPermission('documents', 'view'), getAllDocuments);
router.get('/documents/:id/signed-url', adminProtect, checkPermission('documents', 'view'), getDocumentSignedUrl);
router.delete('/documents/:id', adminProtect, checkPermission('documents', 'delete'), deleteDocument);

router.get('/transactions', adminProtect, checkPermission('transactions', 'view'), getAllTransactions);

router.get('/wallets', adminProtect, checkPermission('wallets', 'view'), getAllWallets);

router.get('/help-queries', adminProtect, checkPermission('helpQueries', 'view'), getAllHelpQueries);
router.put('/help-queries/:id', adminProtect, checkPermission('helpQueries', 'edit'), updateHelpQueryStatus);
router.delete('/help-queries/:id', adminProtect, checkPermission('helpQueries', 'delete'), deleteHelpQuery);

// Banner management
router.get('/banners', adminProtect, checkPermission('banners', 'view'), getAllBanners);
router.post('/banners', adminProtect, checkPermission('banners', 'manage'), bannerUpload.single('image'), createBanner);
router.put('/banners/:id/toggle', adminProtect, checkPermission('banners', 'edit'), toggleBannerActive);
router.put('/banners/:id/order', adminProtect, checkPermission('banners', 'edit'), updateBannerOrder);
router.delete('/banners/:id', adminProtect, checkPermission('banners', 'delete'), deleteBanner);

// Admin account management (Roles & Permissions)
router.post('/admin-accounts/login', adminAccountLogin); // public – sub-admin login
router.get('/admin-accounts', adminProtect, checkPermission('adminRoles', 'view'), getAdminAccounts);
router.post('/admin-accounts', adminProtect, checkPermission('adminRoles', 'manage'), createAdminAccount);
router.put('/admin-accounts/:id', adminProtect, checkPermission('adminRoles', 'edit'), updateAdminAccount);
router.put('/admin-accounts/:id/toggle', adminProtect, checkPermission('adminRoles', 'manage'), toggleAdminAccountStatus);
router.put('/admin-accounts/:id/reset-password', adminProtect, checkPermission('adminRoles', 'manage'), resetAdminAccountPassword);
router.delete('/admin-accounts/:id', adminProtect, checkPermission('adminRoles', 'delete'), deleteAdminAccount);

export default router;

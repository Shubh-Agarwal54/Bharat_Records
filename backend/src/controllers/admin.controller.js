import User from '../models/User.model.js';
import Document from '../models/Document.model.js';
import Transaction from '../models/Transaction.model.js';
import Wallet from '../models/Wallet.model.js';
import HelpQuery from '../models/HelpQuery.model.js';
import jwt from 'jsonwebtoken';
import { getSignedUrl } from '../utils/s3.utils.js';

// ─── Auth ────────────────────────────────────
// @route POST /api/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin')
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    const token = jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '8h'
    });

    res.json({
      success: true,
      data: { token, admin: { id: user._id, name: user.fullName, email: user.email } }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Dashboard Stats ──────────────────────────
// @route GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalDocuments,
      totalTransactions,
      recentUsers,
      recentDocuments,
      recentTransactions,
      walletStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Document.countDocuments({ isDeleted: false }),
      Transaction.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('fullName email mobile createdAt isActive subscriptionPlan'),
      Document.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).populate('user', 'fullName email'),
      Transaction.find().sort({ createdAt: -1 }).limit(5).populate('user', 'fullName email'),
      Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$balance' }, count: { $sum: 1 } } }])
    ]);

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Doc category breakdown
    const docsByCategory = await Document.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Subscription breakdown
    const subBreakdown = await User.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalDocuments,
          totalTransactions,
          totalWalletBalance: walletStats[0]?.total || 0
        },
        recentUsers,
        recentDocuments,
        recentTransactions,
        userGrowth,
        docsByCategory,
        subBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Users ────────────────────────────────────
// @route GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status, plan } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (plan) query.subscriptionPlan = plan;

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    // Get doc counts per user
    const userIds = users.map(u => u._id);
    const docCounts = await Document.aggregate([
      { $match: { user: { $in: userIds }, isDeleted: false } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const docMap = {};
    docCounts.forEach(d => { docMap[d._id] = d.count; });

    const enriched = users.map(u => ({ ...u.toJSON(), documentCount: docMap[u._id] || 0 }));

    res.json({ success: true, data: { users: enriched, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/users/:id
export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [wallet, documents, transactions] = await Promise.all([
      Wallet.findOne({ user: user._id }),
      Document.find({ user: user._id, isDeleted: false }).sort({ createdAt: -1 }),
      Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(20)
    ]);

    res.json({ success: true, data: { user, wallet, documents, transactions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot modify admin accounts' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, data: { isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/admin/users/:id/subscription
export const updateUserSubscription = async (req, res) => {
  try {
    const { plan, expiry } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.subscriptionPlan = plan;
    if (expiry) user.subscriptionExpiry = expiry;
    await user.save();

    res.json({ success: true, message: 'Subscription updated', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });

    // Soft delete: mark inactive
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Documents ────────────────────────────────
// @route GET /api/admin/documents
export const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category, documentType } = req.query;
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };
    if (category) query.category = category;
    if (documentType) query.documentType = documentType;
    if (search) query.title = { $regex: search, $options: 'i' };

    const [documents, total] = await Promise.all([
      Document.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 })
        .populate('user', 'fullName email clientId'),
      Document.countDocuments(query)
    ]);

    res.json({ success: true, data: { documents, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/documents/:id/signed-url
export const getDocumentSignedUrl = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!doc.s3Key) return res.status(400).json({ success: false, message: 'No S3 key for this document' });

    const signedUrl = await getSignedUrl(doc.s3Key, 300); // 5-minute expiry
    res.json({ success: true, data: { url: signedUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/admin/documents/:id
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.isDeleted = true;
    await doc.save();

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Transactions ─────────────────────────────
// @route GET /api/admin/transactions
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', type, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 })
        .populate('user', 'fullName email clientId'),
      Transaction.countDocuments(query)
    ]);

    res.json({ success: true, data: { transactions, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Wallets ──────────────────────────────────
// @route GET /api/admin/wallets
export const getAllWallets = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // If search provided, find matching users first
    let userFilter = null;
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');
      userFilter = matchingUsers.map(u => u._id);
    }

    const query = userFilter ? { user: { $in: userFilter } } : {};

    const [wallets, total] = await Promise.all([
      Wallet.find(query).skip(skip).limit(Number(limit)).sort({ balance: -1 })
        .populate('user', 'fullName email mobile clientId isActive subscriptionPlan'),
      Wallet.countDocuments(query)
    ]);

    res.json({ success: true, data: { wallets, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Help Queries ─────────────────────────────
// @route GET /api/admin/help-queries
export const getAllHelpQueries = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { query: { $regex: search, $options: 'i' } },
      ];
    }

    const [helpQueries, total] = await Promise.all([
      HelpQuery.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 })
        .populate('userId', 'fullName email mobile'),
      HelpQuery.countDocuments(query)
    ]);

    // Count by status for badges
    const statusCounts = await HelpQuery.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { helpQueries, total, page: Number(page), pages: Math.ceil(total / limit), statusCounts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/admin/help-queries/:id
export const updateHelpQueryStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const helpQuery = await HelpQuery.findById(req.params.id);
    if (!helpQuery) return res.status(404).json({ success: false, message: 'Help query not found' });

    if (status) helpQuery.status = status;
    if (adminNote !== undefined) helpQuery.adminNote = adminNote;
    await helpQuery.save();

    res.json({ success: true, message: 'Help query updated', data: helpQuery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/admin/help-queries/:id
export const deleteHelpQuery = async (req, res) => {
  try {
    const helpQuery = await HelpQuery.findByIdAndDelete(req.params.id);
    if (!helpQuery) return res.status(404).json({ success: false, message: 'Help query not found' });
    res.json({ success: true, message: 'Help query deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

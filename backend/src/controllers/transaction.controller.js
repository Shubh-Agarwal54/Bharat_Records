import Transaction from '../models/Transaction.model.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const { type, status, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('recipient.userId', 'fullName mobile');
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      status: 'success',
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: { transactions }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('recipient.userId', 'fullName mobile email');
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }
    
    res.json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats/summary
// @access  Private
export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { user: req.user._id };
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    const stats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

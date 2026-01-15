import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['credit', 'debit', 'transfer'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['add_money', 'transfer', 'withdraw', 'subscription', 'refund', 'cashback', 'other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  recipient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    mobile: String,
    upiId: String
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'wallet', 'bank_transfer'],
    default: 'wallet'
  },
  paymentGateway: {
    transactionId: String,
    gatewayName: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: String,
    device: String,
    location: String
  },
  failureReason: String,
  refundedAt: Date
}, {
  timestamps: true
});

// Indexes for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1, status: 1 });
transactionSchema.index({ 'paymentGateway.transactionId': 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

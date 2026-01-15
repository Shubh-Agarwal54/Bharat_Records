import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dailyLimit: {
    type: Number,
    default: 50000
  },
  monthlyLimit: {
    type: Number,
    default: 200000
  },
  dailySpent: {
    type: Number,
    default: 0
  },
  monthlySpent: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Reset daily/monthly limits
walletSchema.methods.resetLimits = function() {
  const now = new Date();
  const lastReset = new Date(this.lastResetDate);
  
  // Reset daily if new day
  if (now.getDate() !== lastReset.getDate()) {
    this.dailySpent = 0;
  }
  
  // Reset monthly if new month
  if (now.getMonth() !== lastReset.getMonth()) {
    this.monthlySpent = 0;
  }
  
  this.lastResetDate = now;
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;

import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';

// @desc    Get wallet balance
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0
      });
    }
    
    res.json({
      status: 'success',
      data: { wallet }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/add-money
// @access  Private
export const addMoney = async (req, res) => {
  try {
    const { amount, paymentMethod, paymentGateway } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount'
      });
    }
    
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0
      });
    }
    
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;
    
    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'credit',
      category: 'add_money',
      amount,
      balanceBefore,
      balanceAfter,
      status: 'success',
      description: 'Money added to wallet',
      paymentMethod: paymentMethod || 'upi',
      paymentGateway: paymentGateway || {}
    });
    
    // Update wallet balance
    wallet.balance = balanceAfter;
    await wallet.save();
    
    res.json({
      status: 'success',
      message: 'Money added successfully',
      data: {
        wallet,
        transaction
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Transfer money
// @route   POST /api/wallet/transfer
// @access  Private
export const transferMoney = async (req, res) => {
  try {
    const { amount, recipientMobile, recipientName, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount'
      });
    }
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance'
      });
    }
    
    // Check daily/monthly limits
    wallet.resetLimits();
    
    if (wallet.dailySpent + amount > wallet.dailyLimit) {
      return res.status(400).json({
        status: 'error',
        message: 'Daily limit exceeded'
      });
    }
    
    if (wallet.monthlySpent + amount > wallet.monthlyLimit) {
      return res.status(400).json({
        status: 'error',
        message: 'Monthly limit exceeded'
      });
    }
    
    // Find recipient
    const recipientUser = await require('../models/User.model.js').default.findOne({ 
      mobile: recipientMobile 
    });
    
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;
    
    // Create transaction for sender
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'debit',
      category: 'transfer',
      amount,
      balanceBefore,
      balanceAfter,
      status: 'success',
      description: description || `Transfer to ${recipientName}`,
      recipient: {
        userId: recipientUser?._id,
        name: recipientName,
        mobile: recipientMobile
      },
      paymentMethod: 'wallet'
    });
    
    // Update sender wallet
    wallet.balance = balanceAfter;
    wallet.dailySpent += amount;
    wallet.monthlySpent += amount;
    await wallet.save();
    
    // If recipient exists, credit their wallet
    if (recipientUser) {
      const recipientWallet = await Wallet.findOne({ user: recipientUser._id });
      
      if (recipientWallet) {
        const recipientBalanceBefore = recipientWallet.balance;
        const recipientBalanceAfter = recipientBalanceBefore + amount;
        
        await Transaction.create({
          user: recipientUser._id,
          type: 'credit',
          category: 'transfer',
          amount,
          balanceBefore: recipientBalanceBefore,
          balanceAfter: recipientBalanceAfter,
          status: 'success',
          description: `Received from ${req.user.fullName}`,
          paymentMethod: 'wallet'
        });
        
        recipientWallet.balance = recipientBalanceAfter;
        await recipientWallet.save();
      }
    }
    
    res.json({
      status: 'success',
      message: 'Transfer successful',
      data: {
        wallet,
        transaction
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Withdraw money
// @route   POST /api/wallet/withdraw
// @access  Private
export const withdrawMoney = async (req, res) => {
  try {
    const { amount, bankAccount, ifsc } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount'
      });
    }
    
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance'
      });
    }
    
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;
    
    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'debit',
      category: 'withdraw',
      amount,
      balanceBefore,
      balanceAfter,
      status: 'pending',
      description: `Withdrawal to bank account ${bankAccount}`,
      paymentMethod: 'bank_transfer',
      paymentGateway: {
        bankAccount,
        ifsc
      }
    });
    
    // Update wallet balance
    wallet.balance = balanceAfter;
    await wallet.save();
    
    res.json({
      status: 'success',
      message: 'Withdrawal request submitted',
      data: {
        wallet,
        transaction
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

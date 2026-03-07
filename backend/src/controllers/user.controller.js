import User from '../models/User.model.js';
import Wallet from '../models/Wallet.model.js';
import Document from '../models/Document.model.js';
import Transaction from '../models/Transaction.model.js';
import { sendOTP, verifyOTP } from '../utils/otp.utils.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3.utils.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    const documentCount = await Document.countDocuments({ 
      user: req.user._id, 
      isDeleted: false 
    });
    
    res.json({
      status: 'success',
      data: {
        user: req.user,
        wallet: {
          balance: wallet?.balance || 0
        },
        stats: {
          totalDocuments: documentCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, dob, aadhaarNumber, panNumber, mobile } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (fullName) user.fullName = fullName;
    if (dob) user.dob = dob;
    if (aadhaarNumber) user.aadhaarNumber = aadhaarNumber;
    if (panNumber) user.panNumber = panNumber.toUpperCase();
    if (mobile) user.mobile = mobile;
    
    // Handle profile picture upload
    if (req.file) {
      console.log('📸 Profile picture upload detected:', {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      });
      
      try {
        // Check if S3 credentials are configured
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET) {
          // Upload profile picture inside users/{userId}/ folder
          const fileName = `users/${user._id}/profile-picture.${req.file.originalname.split('.').pop()}`;
          const s3Url = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);
          user.profilePicture = s3Url; // s3Url is now a string
          console.log('✅ Profile picture uploaded successfully:', s3Url);
        } else {
          console.log('⚠️ S3 not configured, skipping profile picture upload');
          console.log('Missing credentials:', {
            hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
            hasBucket: !!process.env.AWS_S3_BUCKET
          });
        }
      } catch (uploadError) {
        console.error('❌ Profile picture upload failed:', uploadError);
        // Don't fail the entire update, just skip the picture
        console.log('⚠️ Continuing with other profile updates');
      }
    }
    
    console.log('💾 Saving user data...');
    console.log('Profile picture URL before save:', user.profilePicture);
    await user.save();
    console.log('✅ User saved successfully');
    console.log('Profile picture URL after save:', user.profilePicture);
    
    // Convert to JSON to see what will be sent
    const userResponse = user.toJSON();
    console.log('👤 User response data:', {
      id: userResponse._id,
      fullName: userResponse.fullName,
      email: userResponse.email,
      dob: userResponse.dob,
      aadhaarNumber: userResponse.aadhaarNumber,
      panNumber: userResponse.panNumber,
      profilePicture: userResponse.profilePicture
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update mobile number
// @route   PUT /api/users/update-mobile
// @access  Private
export const updateMobile = async (req, res) => {
  try {
    const { newMobile } = req.body;
    
    // Check if mobile already exists
    const existingUser = await User.findOne({ mobile: newMobile });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Mobile number already in use'
      });
    }
    
    // Send OTP to new mobile
    await sendOTP(newMobile, 'update_mobile', { mobile: newMobile });
    
    res.json({
      status: 'success',
      message: 'OTP sent to new mobile number',
      data: { newMobile }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Verify OTP and update mobile
// @route   PUT /api/users/verify-update-mobile
// @access  Private
export const verifyUpdateMobile = async (req, res) => {
  try {
    const { newMobile, otp } = req.body;
    
    // Verify OTP
    const isValid = await verifyOTP(newMobile, otp);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP'
      });
    }
    
    // Check again if mobile is available
    const existingUser = await User.findOne({ mobile: newMobile });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Mobile number already in use'
      });
    }
    
    // Update mobile
    const user = await User.findById(req.user._id);
    user.mobile = newMobile;
    await user.save();
    
    // Update localStorage user data
    const updatedUser = user.toJSON();
    
    res.json({
      status: 'success',
      message: 'Mobile number updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update email
// @route   PUT /api/users/update-email
// @access  Private
export const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }
    
    // Send OTP to new email
    await sendOTP(newEmail, 'update_email', { email: newEmail });
    
    res.json({
      status: 'success',
      message: 'OTP sent to new email address',
      data: { newEmail }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Verify OTP and update email
// @route   PUT /api/users/verify-update-email
// @access  Private
export const verifyUpdateEmail = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    
    // Verify OTP
    const isValid = await verifyOTP(newEmail, otp);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP'
      });
    }
    
    // Check again if email is available
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }
    
    // Update email
    const user = await User.findById(req.user._id);
    user.email = newEmail;
    await user.save();
    
    // Update localStorage user data
    const updatedUser = user.toJSON();
    
    res.json({
      status: 'success',
      message: 'Email updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    user.password = newPassword;
    user.security.lastPasswordChange = new Date();
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Permanently delete own account and all associated data
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password, confirmText } = req.body;

    if (confirmText !== 'DELETE') {
      return res.status(400).json({ status: 'error', message: 'Type DELETE to confirm.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    // For local-auth users, verify password before deletion
    if (user.authProvider === 'local') {
      if (!password) {
        return res.status(400).json({ status: 'error', message: 'Password is required to delete your account.' });
      }
      const valid = await user.comparePassword(password);
      if (!valid) {
        return res.status(400).json({ status: 'error', message: 'Incorrect password.' });
      }
    }

    // Delete all S3 files belonging to this user
    const documents = await Document.find({ user: user._id });
    const s3Deletions = documents
      .filter(d => d.s3Key)
      .map(d => deleteFromS3(d.s3Key).catch(() => {})); // soft-fail per file
    await Promise.allSettled(s3Deletions);

    // Wipe all DB records for this user
    await Promise.all([
      Document.deleteMany({ user: user._id }),
      Transaction.deleteMany({ user: user._id }),
      Wallet.deleteOne({ user: user._id }),
    ]);

    // Finally remove the user itself
    await User.findByIdAndDelete(user._id);

    res.json({ status: 'success', message: 'Account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get referral stats
// @route   GET /api/users/referrals
// @access  Private
export const getReferrals = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('fullName email createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: {
        referralCode: req.user.referralCode,
        totalReferrals: req.user.referralCount,
        referrals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

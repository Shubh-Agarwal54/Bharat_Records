import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model.js';
import Wallet from '../models/Wallet.model.js';
import { sendOTP, verifyOTP } from '../utils/otp.utils.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
  });
  
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
  });
  
  return { accessToken, refreshToken };
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { fullName, mobile, email, password, referralCode } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, ...(mobile ? [{ mobile }] : [])]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'User with this mobile number already exists'
      });
    }
    
    // Handle referral
    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode });
      if (referredByUser) {
        referredByUser.referralCount += 1;
        await referredByUser.save();
      }
    }
    
    // Create user
    const userData = {
      fullName,
      email,
      password,
      referredBy: referredByUser?._id
    };
    
    // Only add mobile if provided
    if (mobile) {
      userData.mobile = mobile;
    }
    
    const user = await User.create(userData);
    
    // Create wallet for user
    await Wallet.create({
      user: user._id,
      balance: 0
    });
    
    // Send OTP to email for verification
    await sendOTP(email, 'signup');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. OTP sent to your email.',
      data: {
        userId: user._id,
        clientId: user.clientId,
        mobile: user.mobile,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          clientId: user.clientId,
          dob: user.dob,
          aadhaarNumber: user.aadhaarNumber,
          panNumber: user.panNumber,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login with phone number
// @route   POST /api/auth/phone-login
// @access  Public
export const phoneLogin = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    const user = await User.findOne({ mobile });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found. Please signup first.'
      });
    }
    
    // Send OTP
    const otpResult = await sendOTP(mobile, 'login');
    
    res.json({
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        userId: user._id,
        mobile: user.mobile,
        // Include OTP in development mode for testing (until SMS API is integrated)
        ...(process.env.NODE_ENV !== 'production' && otpResult.otp && { otp: otpResult.otp })
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Verify OTP and complete login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, mobile, otp } = req.body;
    const identifier = email || mobile; // Accept either email or mobile
    
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email or mobile number is required'
      });
    }
    
    // Verify OTP
    const isValidOTP = await verifyOTP(identifier, otp);
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Find user by email or mobile
    const user = await User.findOne(
      identifier.includes('@') ? { email: identifier } : { mobile: identifier }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update verification status
    user.isEmailVerified = true;
    user.isMobileVerified = true;
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    // Get wallet info
    const wallet = await Wallet.findOne({ user: user._id });
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          clientId: user.clientId,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          dob: user.dob,
          aadhaarNumber: user.aadhaarNumber,
          panNumber: user.panNumber,
          profilePicture: user.profilePicture,
          avatar: user.avatar,
          subscriptionPlan: user.subscriptionPlan,
          referralCode: user.referralCode
        },
        wallet: {
          balance: wallet?.balance || 0
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token required'
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    
    user.refreshToken = newRefreshToken;
    await user.save();
    
    res.json({
      status: 'success',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify Google token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google credential'
      });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists by email OR googleId
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      // Create new user
      try {
        user = await User.create({
          fullName: name,
          email,
          password: Math.random().toString(36).slice(-8), // Random password for OAuth users
          profilePicture: picture,
          googleId,
          isEmailVerified: true, // Auto-verify for Google users
          authProvider: 'google'
        });

        // Create wallet for new user
        await Wallet.create({
          user: user._id,
          balance: 0
        });
      } catch (createError) {
        console.error('User creation error:', createError);
        
        // If user creation fails due to duplicate, try to find the existing user
        if (createError.code === 11000) {
          console.log('Duplicate detected, fetching existing user...');
          user = await User.findOne({ email });
          if (!user) {
            return res.status(500).json({
              success: false,
              message: 'Account already exists. Please try logging in again.'
            });
          }
          // Link Google ID to existing account
          if (!user.googleId) {
            user.googleId = googleId;
            user.profilePicture = picture || user.profilePicture;
            user.isEmailVerified = true;
            await user.save();
          }
        } else {
          throw createError;
        }
      }
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId;
      // Only set Google picture if user doesn't have a custom one
      if (!user.profilePicture) {
        user.profilePicture = picture;
      }
      user.isEmailVerified = true;
      await user.save();
    } else {
      // User exists and already linked with Google, just update last login
      // Don't overwrite custom profile picture with Google's picture
      // Only update if user has no profile picture or it's still a Google URL
      if (!user.profilePicture || user.profilePicture.includes('googleusercontent.com')) {
        user.profilePicture = picture || user.profilePicture;
      }
      await user.save();
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Get wallet info
    const wallet = await Wallet.findOne({ user: user._id });

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          clientId: user.clientId,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          dob: user.dob,
          aadhaarNumber: user.aadhaarNumber,
          panNumber: user.panNumber,
          profilePicture: user.profilePicture,
          subscriptionPlan: user.subscriptionPlan,
          referralCode: user.referralCode
        },
        wallet: {
          balance: wallet?.balance || 0
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google authentication failed. Please try again.'
    });
  }
};
